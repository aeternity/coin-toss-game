import {Injectable} from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';

import Channel from '@aeternity/aepp-sdk/es/channel';
// import {Universal} from '@aeternity/aepp-sdk/es/ae/universal';

import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory';
import * as StringUtils from '@aeternity/aepp-sdk/es/utils/string';


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
  public initiatorAccount = MemoryAccount({
    keypair: {
      publicKey: 'ak_SVQ9RvinB2E8pio2kxtZqhRDwHEsmDAdQCQUhQHki5QyPxtMh',
      // tslint:disable-next-line:max-line-length
      secretKey: '5245D200D51B048C825280578EDDA2160F48859D49DCFC3510D87CC46758C97C39E09993C3D5B1147F002925270F7E7E112425ABA0137A6E8A929846A3DFD871'
    }
  });
  channelParams
  wsUrl: string = environment.SC_NODE_URL;
  backendServiceUrl: string = environment.BACKEND_SERVICE_URL;


  constructor(private http: HttpClient) {
  }
  signTx(tag, tx) {
    if (confirm('Do you want to sign this tx -> ' + tag)) { return this.initiatorAccount.signTransaction(tx); }
    return null;
  }

  async getConnectionParams(params: { address: string, port: number }): Promise<any> {
    return this.http.get(`${this.backendServiceUrl}/connect/new?client_account=${params.address}&port=${params.port}`).toPromise();
  }

  async initChannel(params: any) {
    const address = await this.initiatorAccount.address();
    const channelConfig = await this.getConnectionParams({address, port: 1600});
    this.channelParams = Object
      .entries({ ...channelConfig.expected_initiator_configuration.basic, ...channelConfig.expected_initiator_configuration.custom })
      .reduce((acc, [key, value]) => ({ ...acc, [StringUtils.snakeToPascal(key)]: value }), { url: this.wsUrl });
    console.log('Channel params', this.channelParams)
    const channelInstance = await Channel({
      ...this.channelParams,
      // ...params,
      sign: this.signTx
    });
    await this.waitForChannelStart(channelInstance);
    return channelInstance;
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
  onAction(channel, action: ActionTypes, callback: (msg: any) => void) {
    return channel.on(action, callback);
  }

  async waitForChannelStart(channel) {
    return new Promise(resolve =>
      this.onAction(channel, ActionTypes.statusChanged, (status) => {
        if (status === 'open') {
          resolve();
        }
      })
    );
  }


}
