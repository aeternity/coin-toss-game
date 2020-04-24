import {Injectable, Inject} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';


import Channel from '@aeternity/aepp-sdk/es/channel';

import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory';
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder';
import { buildContractId } from '@aeternity/aepp-sdk/es/tx/builder/helpers';
import * as StringUtils from '@aeternity/aepp-sdk/es/utils/string';
import {Subject} from 'rxjs';


enum ActionTypes {
  error = 'error',
  onChainTx = 'onChainTx',
  ownWithdrawLocked = 'ownWithdrawLocked',
  withdrawLocked = 'withdrawLocked',
  ownDepositLocked = 'ownDepositLocked',
  depositLocked = 'depositLocked',
  statusChanged = 'statusChanged'
}

@Injectable({
  providedIn: 'root'
})
export class SdkService {
  private $channel;
  public initiatorAccount = MemoryAccount({
    keypair: {
      publicKey: 'ak_SVQ9RvinB2E8pio2kxtZqhRDwHEsmDAdQCQUhQHki5QyPxtMh',
      // tslint:disable-next-line:max-line-length
      secretKey: '5245D200D51B048C825280578EDDA2160F48859D49DCFC3510D87CC46758C97C39E09993C3D5B1147F002925270F7E7E112425ABA0137A6E8A929846A3DFD871'
    }
  });
  wsUrl: string = environment.SC_NODE_URL;
  backendServiceUrl: string = environment.BACKEND_SERVICE_URL;


  constructor(private http: HttpClient, @Inject(LOCAL_STORAGE) private storage: StorageService) {

    // storage example:
    this.storage.set("key", "value");
    this.storage.get("key"); // => "value"
  }

  get channel() {
    return this.$channel;
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

  async initChannel(params: any = {}) {
    const address = await this.initiatorAccount.address();
    const channelConfig = await this.getChannelConfig({ address, port: 1564 });

    this.$channel = new ChannelInstance(channelConfig, this.initiatorAccount);
    await this.channel.openChannel();
    return this.channel;
  }
}

export class ChannelInstance {
  private $channel;
  private $initiatorAccount;
  state = new Subject();
  status = new Subject();
  channelParams;
  networkId: string;
  opened;
  actionBlocked: any = false;

  constructor(params, account, { networkId } = { networkId: 'ae_channel_service_test' }) {
    this.channelParams = params;
    this.$initiatorAccount = account;
    this.networkId = networkId;
  }

  get channel() {
    return this.$channel;
  }

  async awaitContractCreate() {
    return new Promise(resolve => {
      const subscription = this.state.subscribe(({ unpacked }) => {
        if (unpacked.tx.encodedTx.txType === 'channelOffChain'
          && unpacked.tx.encodedTx.tx.updates[0]
          && unpacked.tx.encodedTx.tx.updates[0].txType === 'channelOffChainCreateContract'
        ) {
          subscription.unsubscribe();
          const round = unpacked.tx.encodedTx.tx.round;
          const owner = unpacked.tx.encodedTx.tx.updates[0].tx.owner;
          this.actionBlocked = false;
          resolve(buildContractId(owner, round));
        }
      });
      this.actionBlocked = 'Waiting for contract create.';
    });
  }

  async signTx(tag, tx) {
    console.log('Channel signing -----------');
    console.log('Signing using networkId -> ' + this.networkId);
    console.log('Channel sign tag -> ' + tag);
    console.log('Channel sign transaction: ', unpackTx(tx));
    console.log('---------------------------');
    return this.$initiatorAccount.signTransaction(tx, { networkId: this.networkId });
  }

  async openChannel() {
    this.$channel = await Channel({
      ...this.channelParams,
      sign: this.signTx.bind(this),
      debug: false // log WebSocket messages
    });
    // Register round handler
    // Update round in local storage for each change
    this.$channel.on('stateChanged', async (newState) => {
      const unpacked = unpackTx(newState);
      console.log('New state: ', unpacked);
      this.state.next({ state: newState, unpacked });
      localStorage.setItem('fsmId', this.channel.fsmId());
      localStorage.setItem('state', JSON.stringify({ stateTx: newState }));
      localStorage.setItem('round', this.channel.round());
    });
    this.$channel.on('statusChanged', (status) => {
      this.status.next(status);
      localStorage.setItem('status', this.channel.status());
      if (status === 'open') {
        localStorage.setItem('channel', JSON.stringify({
          params: this.channelParams,
          id: this.channel.id()
        }));
      }
    });
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
    return await this.channel.withdrawal(amount, tx => this.signTx('withdrawal_tx', tx));
  }

  disconnect(amount: number | string) {
    this.channel.disconnect();
  }

  async closeChannel() {
    if (this.actionBlocked) {
      throw new Error('Action is blocked. Reason: ' + this.actionBlocked);
    }
    this.channel.disconnect();
    return this.channel.shutdown(tx => this.signTx('shutdown_tx', tx));
  }
}
