import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
@Component({
  selector: 'app-ups',
  templateUrl: './ups.component.html',
  styleUrls: ['./ups.component.scss']
})
export class UpsComponent implements OnInit {

  constructor(private _location: Location) { }

  ngOnInit() {
  }
 back() {
    this._location.back();
  }
}
