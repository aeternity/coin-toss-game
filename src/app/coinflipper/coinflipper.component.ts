import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-coinflipper',
  templateUrl: './coinflipper.component.html',
  styleUrls: ['./coinflipper.component.scss']
})
export class CoinflipperComponent implements OnInit {

  coinside: string = ""
  constructor() {

   }
   flipcoin() {
     console.log("triggered")
    Math.random() > 0.49999 ? this.coinside = 'heads' : this.coinside = 'tails'
   }

  ngOnInit() {
  }

}
