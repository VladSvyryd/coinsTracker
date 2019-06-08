import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Location} from '@angular/common';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Observable} from "rxjs";
import {OverlayContainer} from "@angular/cdk/overlay";


@Component({
  selector: 'app-navigation-bottom',
  templateUrl: './navigation-bottom.component.html',
  styleUrls: ['./navigation-bottom.component.scss']
})
export class NavigationBottomComponent implements OnInit {

  isMobile: Observable<BreakpointState>;
  color = 'accent';
  whiteTheme = false;
  @Output() changeTheme: EventEmitter<Boolean> = new EventEmitter();
  toogleTheme() {
    console.log("toggle")
    this.changeTheme.emit(this.whiteTheme = !this.whiteTheme);
  }
  constructor(private _location: Location) {
  }

  ngOnInit() {
  }

   goBack(){
     this._location.back();
  }
}
