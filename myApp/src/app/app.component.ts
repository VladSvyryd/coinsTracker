import {Component} from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';
import {Router} from "@angular/router";
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Observable, timer} from 'rxjs';
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
  isExpanded = false;
  users: User;
  readonly ROOT_URL = 'http://127.0.0.1:5000/';
  isMobile: Observable<BreakpointState>;
  color = 'accent';
  otherTheme: boolean = false;
  current_user: User;
  private editModeActive = false;

  changeTheme() {
    this.otherTheme = !this.otherTheme;
  }

  constructor(overlayContainer: OverlayContainer, public router: Router, private breakpointObserver: BreakpointObserver, private _location: Location, private authService: AuthServiceService) {
    overlayContainer.getContainerElement().classList.add('unicorn-dark-theme');
    this.isMobile = this.breakpointObserver.observe(Breakpoints.HandsetPortrait);
    this.current_user = this.authService.getUserFromLocalStorage();

  }

  editModeToggle() {
    this.editModeActive = !this.editModeActive;
    let edit_mode_element_ref = document.querySelectorAll(".edit_mode");
    // each edit function activate for 5 sec and then disappear
    edit_mode_element_ref.forEach((item) => {
        item.classList.toggle("on");
        const source = timer(5000);
        const subscribe = source.subscribe(val => {
          item.classList.remove("on");
        });
      }
    )

  }
}
