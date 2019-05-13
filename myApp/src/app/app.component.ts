import { Component } from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';
import {AuthServiceService} from "./services/auth-service.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CoinKeeper';
  blackThemeOn = false;
  options = {
      bottom: 0,
      fixed: false,
      top: 0
  };
  users: JSON;
  readonly ROOT_URL = 'http://127.0.0.1:5000/';

constructor(overlayContainer: OverlayContainer, private authService : AuthServiceService, public router: Router) {
    // overlayContainer.getContainerElement().classList.add('unicorn-dark-theme');

  }

  tryLogout(){
    this.authService.logout();
          this.router.navigate(['/validation'])

  }
}
