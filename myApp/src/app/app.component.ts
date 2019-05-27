import { Component } from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';
import {AuthServiceService} from "./services/auth-service.service";
import {Router} from "@angular/router";
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Observable} from 'rxjs';


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
  constructor(overlayContainer: OverlayContainer, private authService : AuthServiceService, public router: Router,private breakpointObserver: BreakpointObserver) {
    // overlayContainer.getContainerElement().classList.add('unicorn-dark-theme');
    this.isMobile = this.breakpointObserver.observe(Breakpoints.Handset);
  }

  tryLogout(){
    this.authService.logout();
    this.router.navigate(['/validation'])

  }
}
