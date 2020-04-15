import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';

@Component({
  selector: 'app-transactionlist',
  templateUrl: './transactionlist.component.html',
  styleUrls: ['../../../ArrowNavigationStyles/css/demo.css','../../../ArrowNavigationStyles/css/component.css','../../../ArrowNavigationStyles/css/normalize.css']
})
export class TransactionlistComponent implements OnInit {

  channelUpdates: any[] = []

  constructor() {

  }

  ngOnInit() {
    this.channelUpdates = ["foo"];

    console.log(Math.random());
    
    setInterval(() => {
      if (this.channelUpdates.length < 5 && Math.random() < 0.5)  {
        this.channelUpdates.unshift(String(Math.random()))
      }
    }, 1000)


  }

}
