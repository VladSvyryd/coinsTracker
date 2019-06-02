import {Component, Input, OnInit} from '@angular/core';



@Component({
  selector: 'app-coin',
  templateUrl: './coin.component.html',
  styleUrls: ['./coin.component.scss']
})
export class CoinComponent implements OnInit {
  @Input()
  data :any;
  constructor() { }

  ngOnInit() {
  }

}
