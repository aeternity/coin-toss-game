import {Injectable, Inject} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';


import Channel from '@aeternity/aepp-sdk/es/channel';

import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory';
import Universal from '@aeternity/aepp-sdk/es/ae/universal';
import Node from '@aeternity/aepp-sdk/es/node';
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder';
import { getFunctionACI } from '@aeternity/aepp-sdk/es/contract/aci/helpers';
import { prepareArgsForEncode } from '@aeternity/aepp-sdk/es/contract/aci';
import { buildContractId } from '@aeternity/aepp-sdk/es/tx/builder/helpers';
import * as StringUtils from '@aeternity/aepp-sdk/es/utils/string';
import {BehaviorSubject, Subject} from 'rxjs';
import { filter } from 'rxjs/operators';

enum ActionTypes {
  error = 'error',
  onChainTx = 'onChainTx',
  ownWithdrawLocked = 'ownWithdrawLocked',
  withdrawLocked = 'withdrawLocked',
  ownDepositLocked = 'ownDepositLocked',
  depositLocked = 'depositLocked',
  statusChanged = 'statusChanged',
  stateChanged = 'stateChanged',
}

@Injectable({
  providedIn: 'root'
})
export class SdkService {
  private $channel;
  private $sdkInstance;
  public initiatorAccount = MemoryAccount({
    keypair: {
      publicKey: 'ak_SVQ9RvinB2E8pio2kxtZqhRDwHEsmDAdQCQUhQHki5QyPxtMh',
      // tslint:disable-next-line:max-line-length
      secretKey: '5245D200D51B048C825280578EDDA2160F48859D49DCFC3510D87CC46758C97C39E09993C3D5B1147F002925270F7E7E112425ABA0137A6E8A929846A3DFD871'
    }
  });
  readonly wsUrl: string = environment.SC_NODE_URL;
  readonly backendServiceUrl: string = environment.BACKEND_SERVICE_URL;
  readonly nodeUrl: string = environment.NODE_URL;
  readonly compilerUrl: string = environment.COMPILER_URL;


  constructor(private http: HttpClient, @Inject(LOCAL_STORAGE) private storage: StorageService) {

    // storage example:
    this.storage.set("key", "value");
    this.storage.get("key"); // => "value"
  }

  get channel() {
    return this.$channel;
  }

  async getContractCode() {
    return this.http
      .get(`assets/coin_toss.aes`, {responseType: 'text'})
      .toPromise();
  }

  async getChannelConfig(params: { address: string, port: number }): Promise<any> {
    // Get config from backend
    const configFromBackendService: any = await this.http
      .get(`${this.backendServiceUrl}/connect/new?initiator_id=${params.address}&port=${params.port}`)
      .toPromise();
    // Prepare the config
    return Object
      .entries(configFromBackendService.expected_initiator_configuration)
      .reduce((acc, [key, value]) => ({ ...acc, [StringUtils.snakeToPascal(key)]: value }), { url: this.wsUrl });
  }

  async initChannel() {
    const address = await this.initiatorAccount.address();
    const channelConfig = await this.getChannelConfig({ address, port: 1564 });
    this.$sdkInstance = await Universal({
      compilerUrl: this.compilerUrl,
      nodes: [{ name: 'local', instance: await Node({ url: this.nodeUrl }) }],
      accounts: [this.initiatorAccount]
    });
    this.$channel = new ChannelInstance(
      channelConfig,
      this.$sdkInstance,
      {
        code: await this.getContractCode(),
        storage: this.storage,
        bytecode: await this.$sdkInstance.compileContractAPI(await this.getContractCode())
      }
    );
    await this.channel.openChannel();
    return this.channel;
  }
}

export class ChannelInstance {
  // Deps
  private readonly $storage;
  private $code: string;
  readonly bytecode: string;

  // State
  private $channel;
  private $initiatorAccount;
  private $onSign = new Subject();
  onChainTx = new BehaviorSubject(null);
  error = new BehaviorSubject(null);
  state = new Subject();
  status = new BehaviorSubject(null);
  private http: HttpClient;
  channelParams;
  networkId: string;
  opened;
  actionBlocked: any = false;
  updates = new Map();

  constructor(params, account, { networkId = 'ae_channel_service_test', code = '', storage = {}, bytecode = '' } = {}) {
    this.$code = code;
    this.bytecode = bytecode;
    this.$initiatorAccount = account;
    this.channelParams = params;
    this.networkId = networkId;
    this.$storage = storage;
    this.channelParams = params;

  }

  set code(code: string) {
    this.$code = code;
  }

  get channel() {
    return this.$channel;
  }

  /**
   * Connection
   */
  private registerHandlers() {
    if (!this.channel) {
      throw new Error('Channel create process is not started. Please run `openChannel()`');
    }
    // Register round handler
    // Update round in local storage for each change
    this.$channel.on(ActionTypes.stateChanged, async (newState) => {
      this.$storage.set('state', JSON.stringify({ stateTx: newState }));
      this.$storage.set('round', this.channel.round());
      const unpacked = unpackTx(newState);
      const round = unpacked.tx.encodedTx.tx.round;
      const updates = this.updates.has(round) ? this.updates.get(round) : {};
      if (updates && updates.operation === 'OffChainCallContract') {
        const callRes = await this.channel.getContractCall({
          caller: updates.update.caller_id,
          contract: updates.update.contract_id,
          round
        });
        const decodedResult = await this.decodeCallResult(updates.decoded.function, callRes.returnValue, callRes.returnType);
        this.updates.set(round, { ...updates, decodedResult, callInfo: callRes });
      }
      this.state.next({ updates: this.updates.get(round), state: newState, unpacked });
    });
    this.$channel.on(ActionTypes.statusChanged, (status) => {
      this.status.next(status);
      this.$storage.set('status', this.channel.status());
      if (status === 'accepted') {
        this.$storage.set('fsmId', this.channel.fsmId());
      }
      if (status === 'signed') {
        this.$storage.set('channel', JSON.stringify({
          params: this.channelParams,
          id: this.channel.id()
        }));
      }
    });
    this.$channel.on(ActionTypes.onChainTx, (tx, info) => this.onChainTx.next({ tx, info, unpacked: unpackTx(tx) }));
    this.$channel.on(ActionTypes.error, (error, info) => this.error.next({ error, info }));
  }

  async reconnect() {
    const existingFsmId = this.$storage.get('fsmId');
    const existingChannelId = JSON.parse(this.$storage.get('channel')).id;
    const offchainTx = JSON.parse(this.$storage.get('state')).stateTx;
    this.$channel = await Channel({
      ...this.channelParams,
      sign: this.signTx.bind(this),
      debug: true, // log WebSocket messages,
      existingFsmId,
      existingChannelId,
      offchainTx
    });
    this.registerHandlers();
  }

  async openChannel() {
    this.$channel = await Channel({
      ...this.channelParams,
      sign: this.signTx.bind(this),
      debug: false // log WebSocket messages
    });
    this.registerHandlers();
  }

  disconnect() {
    this.channel.disconnect();
    this.state.next({ state: null, unpacked: null, contractCallInfo: null }) ;
    this.state.next(null);
  }

  /**
   * Handlers
   */
  async awaitContractCreate() {
    return new Promise(resolve => {
      const subscription = this.state.subscribe(({ unpacked, updates }) => {
        if (updates.operation && updates.operation === 'OffChainNewContract') {
          setTimeout(() => subscription.unsubscribe(), 0);
          const round = unpacked.tx.encodedTx.tx.round;
          const owner = updates.update.owner;
          this.actionBlocked = false;
          resolve(buildContractId(owner, round));
        }
      });
      this.actionBlocked = 'Waiting for contract create.';
    });
  }

  async unpackContractUpdates(unpacked, options) {
    if (!options || !options.updates || !options.updates.length) {
      return {};
    }
    const [update] = options.updates;
    const operation = update.op;
    if (!['OffChainNewContract', 'OffChainCallContract'].includes(operation)) {
      return {};
    }
    const round = unpacked.tx.round;
    const callData = update.call_data;
    const decodedCallData = await this.decodeCallData(callData);
    return { round, decoded: decodedCallData, operation, update };
  }

  async awaitContractCall(fnName) {
    return new Promise((resolve, reject) => {
      try {
        const subscription = this.state.subscribe(async ({ unpacked, updates }) => {
          if (updates.operation && updates.operation === 'OffChainCallContract' && updates.decoded.function === fnName) {
            this.actionBlocked = false;
            setTimeout(() => subscription.unsubscribe(), 0);
            resolve(updates);
          }
        });
        this.actionBlocked = 'Waiting for contract call.';
      } catch (e) {
        reject(e);
      }
    });
  }

  async decodeCallResult(fnName: string, callValue, callResult: string) {
    return this.$initiatorAccount.contractDecodeCallResultAPI(this.$code, fnName, callValue, callResult);
  }

  async decodeCallData(callData: string) {
    return this.$initiatorAccount.contractDecodeCallDataByCodeAPI(this.bytecode, callData);
  }

  async signTx(tag, tx, options?: object) {
    const unpacked = unpackTx(tx);
    const updates = await this.unpackContractUpdates(unpacked, options);
    if (updates.round) {
      this.updates.set(updates.round, updates);
    }
    return new Promise(async (resolve, reject) => {
      if (!this.$onSign.observers.length) {
        resolve(await this.$initiatorAccount.signTransaction(tx, { networkId: this.networkId }));
      }
      this.$onSign.next({
        networkId: this.networkId,
        tag,
        unpacked,
        tx,
        updates,
        accept: async () => resolve(await this.$initiatorAccount.signTransaction(tx, { networkId: this.networkId })),
        deny: () => reject(false)
      });
    });
  }

  onSign(txTypes: string[] = []) {
    return this.$onSign.pipe(
      filter(({ unpacked }) => !txTypes.length || txTypes.includes(unpacked.txType))
    );
  }

  onOpened(callback) {
    if (!this.channel) {
      throw new Error('Channel create process is npt started. Please run `openChannel()`');
    }
    if (this.opened) {
      throw new Error('Channel already opened');
    }
    // Awaiting of channel open
    return this.$channel.on('statusChanged', (status) => {
      if (status === 'open') {
        this.opened = true;
        callback();
      }
    });
  }

  async getContractCode() {
    return this.http
      .get(`app/assets/contract.aes`, {responseType: 'text'})
      .toPromise();
  }

  async doContractCall(contractAddress: string, side: string, amount: number) {
    if (!this.channel) {
      throw new Error('Channel create process is npt started. Please run `openChannel()`');
    }
    const contractSource = await this.getContractCode();
    const callData = await this.$initiatorAccount.contractEncodeCallDataAPI(contractSource, 'bet', [side], {backend: 'aevm'})
    await this.channel.callContract({amount: amount, callData, contract: contractAddress, abiVersion: 1})
  }

  /**
   * Register event listener function
   *
   * Possible events:
   *
   *   - "error"
   *   - "onChainTx"
   *   - "ownWithdrawLocked"
   *   - "withdrawLocked"
   *   - "ownDepositLocked"
   *   - "depositLocked"
   *   - "statusChanged"
   *
   */
  onAction(action: ActionTypes, callback: (msg: any) => void) {
    if (!this.channel) {
      throw new Error('Channel not opened');
    }
    return this.channel.on(action, callback);
  }

  /**
   * API
   */
  async deposit(amount: number | string) {
    if (this.actionBlocked) {
      throw new Error('Action is blocked. Reason: ' + this.actionBlocked);
    }
    return await this.channel.deposit(amount, tx => this.signTx('deposit_tx', tx));
  }

  async transfer(from: string, to: string, amount: number | string) {
    if (this.actionBlocked) {
      throw new Error('Action is blocked. Reason: ' + this.actionBlocked);
    }
    return await this.channel.update(from, to, amount, tx => this.signTx('deposit_tx', tx));
  }

  async withdrawal(amount: number | string) {
    if (this.actionBlocked) {
      throw new Error('Action is blocked. Reason: ' + this.actionBlocked);
    }
    return await this.channel.withdrawal(amount, (tx, options) => this.signTx('withdrawal_tx', tx, options));
  }

  async closeChannel() {
    if (this.actionBlocked) {
      throw new Error('Action is blocked. Reason: ' + this.actionBlocked);
    }
    const res = await this.channel.shutdown((tx, options) => this.signTx('shutdown_tx', tx, options));
    this.channel.disconnect();
    return res;
  }

  async contractCall(fn, contractAddress: string, args: any[], { amount = 0, aci = null } = {}) {
    if (!this.channel) {
      throw new Error('Channel create process is not started. Please run `openChannel()`');
    }

    const callData = await this.$initiatorAccount.contractEncodeCallDataAPI(
      await this.getContractCode().catch(e => null),
      fn,
      aci ? await prepareArgsForEncode(getFunctionACI(aci, fn), args) : args
    );
    const res = await this.channel.callContract(
      {amount, callData, contract: contractAddress, abiVersion: 3},
      (tx, options) => this.signTx('contract_call', tx, options)
    );
    if (!res.accepted) {
      throw new Error(`Contract call error: ${res}`);
    }
    const unpacked = unpackTx(res.signedTx);
    const round = unpacked.tx.encodedTx.tx.round;
    const updates = this.updates.get(round);
    const callRes = await this.channel.getContractCall({ caller: updates.update.caller_id, contract: updates.update.contract_id, round });
    const decodedResult = await this.decodeCallResult(updates.decoded.function, callRes.returnValue, callRes.returnType);
    this.updates.set(round, { ...updates, decodedResult, callInfo: callRes });
    if (callRes.returnType !== 'ok') {
      throw Object.assign(decodedResult, new Error(`Contract call ${fn} is aborted`));
    }
    return this.updates.get(round);
  }
}
