import { Component, OnInit } from '@angular/core';
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
  otherTheme: boolean = false;

  changeTheme() {
    console.log("toggle")
    this.otherTheme = !this.otherTheme;
  }



  constructor(overlayContainer: OverlayContainer, private breakpointObserver: BreakpointObserver, private _location: Location) {
     this.isMobile = this.breakpointObserver.observe(Breakpoints.Handset);
     overlayContainer.getContainerElement().classList.add('unicorn-dark-theme');
  }

  ngOnInit() {
  }

   goBack(){
     this._location.back();
  }
}
