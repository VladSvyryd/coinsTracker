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
  user:User;
  fixedLayout: boolean;
  constructor(private auth:AuthServiceService) {
      this.user = auth.getUserFromLocalStorage();
      this.fixedLayout = this.user.fixedLayout;
  }

  ngOnInit() {
  }

  updateUserSettings( v) {
    this.user.fixedLayout = v;
    this.auth.setNewUser(this.user);
  }
}
