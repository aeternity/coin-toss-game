import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ae-button',
  templateUrl: './ae-button.component.html',
  styleUrls: ['./ae-button.component.scss']
})
export class AeButtonComponent implements OnInit {
  @Input() label: string
  @Input() pressed: boolean

  hover: boolean = false;

  mouseenter(){
    this.hover = true;
  }

  mouseleave(){
    this.hover = false;
  }

  pressDown(){
    this.pressed = true
  }

  pressUp(){
    this.pressed = false
  }

  constructor() { }

  ngOnInit() {
  }

}
