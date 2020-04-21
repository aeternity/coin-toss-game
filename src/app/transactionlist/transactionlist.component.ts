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


  ngOnInit() {
    this.channelUpdates = ["foo"];

    console.log(Math.random());
    this.sdkService.initChannel({}, (tag, tx) => {
      if (confirm('Do you want to sign this tx -> ' + tag)) return this.sdkService.initiatorAccount.signTransaction(tx, { networkId: 'ae_channel_service_test' });
    }).then(channel => { debugger }).catch(e => { debugger })

    setInterval(() => {
      if (this.channelUpdates.length < 7 && Math.random() < 0.5)  {
        this.channelUpdates.unshift(this.dummyUpdates.pop())
      }
    }, 1000)


  }

}
