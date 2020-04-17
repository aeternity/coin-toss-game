import { Component, OnInit, Input, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import {
  trigger,
  state,
  style,
  animate,
  group,
  transition,
  AnimationEvent
} from '@angular/animations';

/* https://www.usefuldev.com/post/Angular:%20using%20animations%20with%20NgIf
 */

@Component({
  selector: 'app-one-incoming-transaction',
  templateUrl: './one-incoming-transaction.component.html',
  styleUrls: ['../../../ArrowNavigationStyles/css/demo.css','../../../ArrowNavigationStyles/css/component.css','../../../ArrowNavigationStyles/css/normalize.css'],
  animations: [
    trigger('state', [
      state('in', style({
       // no clue what this does:
        // transform: 'translateX(0)', opacity: 1, height: '41px'
        transform: 'translateX(0)', opacity: 1
      })),
      transition('void => *', [
        style({ transform: 'translateX(40%)', opacity: 0}),
        // style({ transform: 'translateX(-40%)', opacity: 0,  height:'41px' }),
        group([
          animate('400ms 0.4s ease', style({
            transform: 'translateX(0)',
            
            //height:'41px'
          })),
          animate('300ms 0.1s ease-in', style({
            opacity: 1  
          }))
        ])
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'translateX(100%)' }))
      ])
    ]),
    /* trigger('isHovered', [
      state('false', style({
       // no clue what this does:
        height: '64px', 
      })),
      state('true', style({
        // no clue what this does:
         height: '144px', 
       })),
      transition('void => *', [
        style({ height: '64px' }),
        group([
          animate('40ms ease', style({
            height: '64px',
          })),
          animate('300ms 0.1s ease-in', style({
            opacity: 1  
          }))
        ]),
      ]),
      transition('* => true', [
        style({ height: '144px' }),
        group([
          animate('40ms ease', style({
            height: '144px',
          })),
          animate('300ms 0.1s ease-in', style({
            opacity: 1  
          }))
        ]),
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'translateX(100%)' }))
      ])
    ]), */
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class OneIncomingTransactionComponent implements OnInit {

@ViewChild('theEntry', {static: false}) theEntry;

  isExpanded: boolean = false;
  isHovered: boolean = false;
  delayedIsHovered: boolean = false;
  
  constructor(private ref: ChangeDetectorRef) { 
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.state = "in";
    if (this.state == 'visible') {
      setTimeout(() => {
        console.log("Time is up!")
        this.state = 'hidden'
      }); 
    }

    console.log(this.theEntry)
  }

  mouseOverArrow () {
    console.log("Arrow hovered!")
    this.isHovered = true
    this.ref.detectChanges() 
    setTimeout(() => {
      this.delayedIsHovered = true
      this.ref.detectChanges() 
    }, 400);
  }

  mouseLeaveArrow () {
    this.isHovered = false
    setTimeout(() => {
      this.isExpanded == true ? this.delayedIsHovered = true : this.delayedIsHovered = false

      this.ref.detectChanges()  
    }, 400);

    
 
  }

  mouseLeaveTxcontent() {
    console.log("mouse left content!");
    this.delayedIsHovered = false;
    //this.ref.markForCheck();
  }

  state: string;
      // tslint:disable-next-line: variable-name
      private _show: boolean = true
      get show() {
        return this._show;
      }

      @Input() 
      set show(value: boolean) {
        if (value) {
          // show the content and set it's state to trigger fade in animation
          this._show = value;
          this.state = 'visible';
        } else {
          // just trigger the fade out animation
          this.state = 'hidden';
        }
      }

      animationDone(event: AnimationEvent) {
       /*  console.log("Done changing a state !")
        // now remove the 
        if (event.fromState === 'visible' && event.toState === 'hidden') {
          this._show = false;
        } */
      }


}

export type FadeState = 'visible' | 'hidden';




