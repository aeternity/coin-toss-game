import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { SdkService } from '../sdk.service'

@Component({
  selector: 'app-transactionlist',
  templateUrl: './transactionlist.component.html',
  styleUrls: ['../../../ArrowNavigationStyles/css/demo.css','../../../ArrowNavigationStyles/css/component.css','../../../ArrowNavigationStyles/css/normalize.css']
})
export class TransactionlistComponent implements OnInit {


  dummyUpdates: any[] = [{type:"out"}, {type:"out"}, {type:"out"}, {type:"in"}, {type:"in"}, {type:"out"}]
  channelUpdates: any[] = []

  constructor(private sdkService: SdkService) {

  }

  initChannelAndMakeTransfer() {
    this.sdkService.initChannel({}).then(channel => {
      // here channel already initialized
      // Make transfer
      channel.update(
        this.sdkService.initiatorAccount.address(),
        this.sdkService.channelParams.responderId,
        10000,
        this.sdkService.signTx
      ).then(res => { debugger }).error(error => { debugger })
    }).catch(e => { debugger });
  }

  ngOnInit() {
    this.initChannelAndMakeTransfer()
    this.channelUpdates = ["foo"];

    console.log(Math.random());


    setInterval(() => {
      if (this.channelUpdates.length < 7 && Math.random() < 0.5)  {
        this.channelUpdates.unshift(this.dummyUpdates.pop())
      }
    }, 1000)


  }

}
