import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Observable} from 'rxjs';
import {BreakpointState} from '@angular/cdk/layout';
import {User} from '../../models/user';
import {Location} from '@angular/common';
import {AuthServiceService} from '../../services/auth-service.service';
import {SharedService} from '../../services/shared.service';
import {Router} from '@angular/router';
import {MatBottomSheet} from '@angular/material';
import {SettingsComponent} from '../settings/settings.component';

@Component({
  selector: 'app-navigation-vertical',
  templateUrl: './navigation-vertical.component.html',
  styleUrls: ['./navigation-vertical.component.scss']
})
export class NavigationVerticalComponent implements OnInit {


  isMobile: Observable<BreakpointState>;
  color = 'accent';
  whiteTheme = true;
  current_user:User;
  @Output() changeThemeV: EventEmitter<Boolean> = new EventEmitter();
  @Output() editModeV: EventEmitter<Boolean> = new EventEmitter()
  toogleTheme(first) {
    this.changeThemeV.emit(this.whiteTheme = !this.whiteTheme);
    let bool = this.whiteTheme;
    if(first){
      this.updateTheme(!bool)
    }
  }
  constructor(private _location: Location, private authService: AuthServiceService,private sharedService: SharedService,private router:Router,private bottomSheet: MatBottomSheet) {
    this.current_user = this.authService.getUserFromLocalStorage();
  }

  ngOnInit() {
    if(this.current_user && this.current_user.dark_theme){
      this.toogleTheme(false);
    }
  }
  tryLogout(){
    this.authService.logout();
    this.router.navigate(['/validation'])

  }
  goBack(){
    this._location.back();
  }
  updateTheme(bool){
    this.current_user.dark_theme = bool;
    this.authService.setNewUser(this.current_user);
  }

  editModeActive(){
    this.editModeV.emit();
  }

}
