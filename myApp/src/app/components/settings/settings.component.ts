import {Component, Inject, OnInit} from '@angular/core';
import {User} from '../../models/user';
import {AuthServiceService} from '../../services/auth-service.service';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef} from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: User;
  fixedLayout: boolean;
  coinsNamesOn: boolean;

  constructor(private auth: AuthServiceService) {
    this.user = auth.getUserFromLocalStorage();
    this.fixedLayout = this.user.fixedLayout;
    this.coinsNamesOn = this.user.coinsNamesOn;
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
}
