import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

import Channel from '@aeternity/aepp-sdk/es/channel'
import { Universal } from '@aeternity/aepp-sdk/es/ae/universal'

import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'


enum ActionTypes {
 error = "error",
 onChainTx = "onChainTx",
 ownWithdrawLocked = "ownWithdrawLocked",
 withdrawLocked = "withdrawLocked",
 ownDepositLocked = "ownDepositLocked",
 depositLocked = "depositLocked",
 statusChanged = 'statusChanged'
}
@Injectable({
  providedIn: 'root'
})
export class SdkService {
  private channelInstance
  private initiatorAccount = MemoryAccount({ keypair: {"publicKey": "ak_SVQ9RvinB2E8pio2kxtZqhRDwHEsmDAdQCQUhQHki5QyPxtMh","secretKey": "5245D200D51B048C825280578EDDA2160F48859D49DCFC3510D87CC46758C97C39E09993C3D5B1147F002925270F7E7E112425ABA0137A6E8A929846A3DFD871"} })
  wsUrl: string = environment.SC_NODE_URL
  backendServiceUrl: string = environment.BACKEND_SERVICE_URL || ' http://127.0.0.1:4000'

  
  constructor(private http: HttpClient) {

  



   }

  async getConnectionParams (params: { address: string, port: number }) {
    return this.http.get(`${this.backendServiceUrl}/connect/new?client_account=${params.address}&port=${params.port}`)
  }

  async initChannel (channelParams: Object) {
    const channelConfig = await this.getConnectionParams({ address: await this.initiatorAccount.address(), port: 1600 })
    this.channelInstance = Channel({
      ...channelConfig,
      ...channelParams,
      sign: (tag, tx) => this.initiatorAccount.signTransaction(tx)
    })
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
 * @param {ActionTypes} event - Event name
 * @param {Function} callback - Callback function
 */
  onAction (action: ActionTypes, callback: Function) {
    return this.channelInstance.on(action, callback)
  }

  async waitForChannelStart () {  
    return new Promise(resolve =>
      this.onAction(ActionTypes.statusChanged, (status) => {
        if (status === 'open') {
          resolve()
        }
      })
    )
  }


}
