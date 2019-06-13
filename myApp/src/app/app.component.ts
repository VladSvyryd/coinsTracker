import { Component } from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';
import {Router} from "@angular/router";
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {Location} from '@angular/common';
import {AuthServiceService} from './services/auth-service.service';
import {User} from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CK';
  blackThemeOn = false;
  options = {
    bottom: 0,
    fixed: false,
    top: 0
  };
  users: JSON;
  readonly ROOT_URL = 'http://127.0.0.1:5000/';
  isMobile: Observable<BreakpointState>;
  color = 'accent';
  otherTheme: boolean = false;
  current_user: User;
  changeTheme() {
    console.log("toggle")
    this.otherTheme = !this.otherTheme;
  }

  constructor(overlayContainer: OverlayContainer, public router: Router,private breakpointObserver: BreakpointObserver,private _location: Location,private authService:AuthServiceService) {
    overlayContainer.getContainerElement().classList.add('unicorn-dark-theme');
    this.isMobile = this.breakpointObserver.observe(Breakpoints.Handset);
    this.current_user =  JSON.parse(this.authService.getUserFromLocalStorage());

  }

}
