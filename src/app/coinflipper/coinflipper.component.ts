import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { Observable } from 'rxjs';



import 'rxjs/add/observable/fromEvent';
import { Subscription } from 'rxjs';
import {of, fromEvent} from 'rxjs';



enum State {
  initial = 'initial',
  channelCreated = 'channelCreated',
  contractCreated = 'contractCreated',
  hashInserted = 'hashInserted',
  bidPlaced = 'bidPlaced',
  won = 'won',
  lost = 'lost',
  error = 'error',
  ready = 'ready',
  running = 'running',
  finished = 'finished',
}

@Component({
  selector: 'app-coinflipper',
  templateUrl: './coinflipper.component.html',
  styleUrls: ['./coinflipper.component.scss']
})
export class CoinflipperComponent implements OnInit {
  keyDownSubscription: Subscription;
  keyUpSubscription: Subscription;
  isPressed: boolean = false;

  state: State = State.ready
  stateEnum: typeof State = State;

  buttonLabels = {
    'initial': 'Open Channel to play',
    'ready': 'Flip Coin ! (SPACE)',
  }

  coinside: string = ""
  coinsideThrowReveal: string = ""
  constructor() {

   }
   flipcoin() {
     let result =  Math.random() > 0.49999 ? 'heads' : 'tails'
    this.coinside = result;
    setTimeout(() => {
      this.coinsideThrowReveal = result
    }, 3000);
   }

  ngOnInit() {
    this.keyDownSubscription = fromEvent(document, 'keydown').subscribe( (e: KeyboardEvent) => {
      e.code == "Space" ? this.isPressed = true : true
    })
    this.keyUpSubscription = fromEvent(document, 'keyup').subscribe((e: KeyboardEvent) => {
      e.code == "Space" ? this.isPressed = false : true
      this.flipcoin()
    })
  }

  ngOnDestroy() {
    this.keyDownSubscription.unsubscribe()
    this.keyUpSubscription.unsubscribe()
  }

}
