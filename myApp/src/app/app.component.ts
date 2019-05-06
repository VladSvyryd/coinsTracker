import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'CoinKeeper';
  options = {
      bottom: 0,
      fixed: false,
      top: 0
  };
  users: JSON;
  readonly ROOT_URL = 'http://127.0.0.1:5000/';

constructor(){}

}
