import { Component } from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';


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

constructor(overlayContainer: OverlayContainer) {
    overlayContainer.getContainerElement().classList.add('unicorn-dark-theme');
  }

}
