import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { SdkService } from '../sdk.service';

@Component({
  selector: 'app-transactionlist',
  templateUrl: './transactionlist.component.html',
  styleUrls: [
    '../../../ArrowNavigationStyles/css/demo.css',
    '../../../ArrowNavigationStyles/css/component.css',
    '../../../ArrowNavigationStyles/css/normalize.css'
  ]
})
export class TransactionlistComponent implements OnInit {


  dummyUpdates: any[] = [{type: 'out' }, {type: 'out'}, {type: 'out'}, {type: 'in'}, {type: 'in'}, {type: 'out'}];
  channelUpdates: any[] = [];

  constructor(private sdkService: SdkService) {

  }

  initChannelAndWaitForContract() {
    const txTypes = []; // [ 'signedTx' ]
    this.sdkService.initChannel().then(async (channel) => {
      // On onChain Tx
      channel.onChainTx.subscribe((data) => {
        console.log('---------- OnChainTx: ', data);
      });
      // On error
      channel.error.subscribe((error) => {
        console.log('---------- On Error ', error);
      });
      // On new state
      channel.state.subscribe((state) => {
        console.log('---------- New state: ', state);
      });
      // On new status
      channel.status.subscribe((status) => {
        console.log('---------- New status: ', status);
      });
      // Subscribe for signing of specific transactions type
      // Or another transactions will be signed automaticaly
      channel.onSign(txTypes).subscribe(({ unpacked, accept, deny, networkId, tag }) => {
        console.log('---------- Channel signing -----------');
        console.log('Channel sign networkId: ' + networkId);
        console.log('Channel sign tag -> ' + tag);
        console.log('Channel sign transaction: ', unpacked);
        console.log('---------------------------------------');
        accept();
      });
      // On opened callback
      channel.onOpened(async () => {
        console.log('--------------- Channel Opened On-Chain ---------------');

        // channel.disconnect();
        // await channel.reconnect();

        // Block all channel operations util contract is created
        const contractAddress = await channel.awaitContractCreate();
        console.log('--------------- Contract Deployed ---------------');
        const BackendSetHash = await channel.awaitContractCall();
        console.log('--------------- Backend set the hash ---------------');
        // Make a contract call
        const callRes = await channel.contractCall('player_pick', contractAddress, ['"tail"']);
        console.log('--------------- Client pick a coin side ---------------');
      });
    }).catch(e => {  console.log(e); });
  }

  ngOnInit() {
    // Init Channel;
    this.initChannelAndWaitForContract();
    this.channelUpdates = ['foo'];

    setInterval(() => {
      if (this.channelUpdates.length < 7 && Math.random() < 0.5)  {
        this.channelUpdates.unshift(this.dummyUpdates.pop());
      }
    }, 1000);


  }

}
