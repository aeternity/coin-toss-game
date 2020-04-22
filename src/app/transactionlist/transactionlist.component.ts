import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { SdkService } from '../sdk.service'

@Component({
  selector: 'app-transactionlist',
  templateUrl: './transactionlist.component.html',
  styleUrls: ['../../../ArrowNavigationStyles/css/demo.css', '../../../ArrowNavigationStyles/css/component.css', '../../../ArrowNavigationStyles/css/normalize.css']
})
export class TransactionlistComponent implements OnInit {


  dummyUpdates: any[] = [{type:"out"}, {type:"out"}, {type:"out"}, {type:"in"}, {type:"in"}, {type:"out"}]
  channelUpdates: any[] = []

  constructor(private sdkService: SdkService) {

  }

  initChannelAndMakeTransfer() {
    this.sdkService.initChannel().then(async (channel) => {
      channel.onOpened(async () => {
        // here channel already opened
        // When channel is created backend service deploy the contract
        // this timeout will wait until this happens to avoid conflicts
        setTimeout(async () => {
          const balanceBefore = await channel.channel.balances([channel.channelParams.initiatorId, channel.channelParams.responderId]);
          const transfer = await channel.transfer(channel.channelParams.initiatorId, channel.channelParams.responderId, 100000);
          const balanceAfter = await channel.channel.balances([channel.channelParams.initiatorId, channel.channelParams.responderId]);
        }, 15000);
      });
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
