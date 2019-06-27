import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {User} from '../../models/user';
import {AuthServiceService} from '../../services/auth-service.service';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef} from '@angular/material';
import {OverlayContainer} from '@angular/cdk/overlay';
import {AppComponent} from '../../app.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: User;
  fixedLayout: boolean;
  coinsNamesOn: boolean;
  whiteTheme : boolean;
  color = 'accent';
  @Output() changeThemeV: EventEmitter<Boolean> = new EventEmitter();
  constructor(private auth: AuthServiceService,overlayContainer: OverlayContainer,private appComponent: AppComponent) {
    overlayContainer.getContainerElement().classList.add('unicorn-dark-theme');
    this.user = auth.getUserFromLocalStorage();
    this.fixedLayout = this.user.fixedLayout;
    this.coinsNamesOn = this.user.coinsNamesOn;
    this.whiteTheme =  this.user.dark_theme;
  }

  ngOnInit() {
  }

  updateUserSettings(property, newState) {
    this.getUserOnProperty(property,newState);
    this.auth.setNewUser(this.user);
  }

  getUserOnProperty(property,newState) {
    Object.keys(this.user).forEach(key => {
      if (this.user[key] === property) {
         this.user[key] = newState;
      }
    });
  }
   toggleTheme() {
    this.appComponent.changeTheme();
  }

}
