import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-one-update',
  templateUrl: './one-update.component.html',
  styleUrls: ['./one-update.component.scss']
})
export class OneUpdateComponent implements OnInit {


  @Input() update: any

  constructor() { }

  ngOnInit() {
    // console.log(this.update)
  }

}
