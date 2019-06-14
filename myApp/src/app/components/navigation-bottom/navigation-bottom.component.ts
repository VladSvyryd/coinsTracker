import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Location} from '@angular/common';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Observable} from "rxjs";
import {OverlayContainer} from "@angular/cdk/overlay";
import {User} from '../../models/user';
import {AuthServiceService} from '../../services/auth-service.service';
import {SharedService} from '../../services/shared.service';


@Component({
  selector: 'app-navigation-bottom',
  templateUrl: './navigation-bottom.component.html',
  styleUrls: ['./navigation-bottom.component.scss']
})
export class NavigationBottomComponent implements OnInit {

  isMobile: Observable<BreakpointState>;
  color = 'accent';
  whiteTheme = true;
  current_user:User;
  @Output() changeTheme: EventEmitter<Boolean> = new EventEmitter();
  @Output() editMode: EventEmitter<Boolean> = new EventEmitter()
  toogleTheme(first) {
    console.log("toggle")
    this.changeTheme.emit(this.whiteTheme = !this.whiteTheme);
    let bool = this.whiteTheme;
    console.log(this.whiteTheme);
    if(first){
      this.updateTheme(!bool)
    }
  }
  constructor(private _location: Location, private authService: AuthServiceService,private sharedService: SharedService) {
    this.current_user = JSON.parse(this.authService.getUserFromLocalStorage());
     console.log("cur_user",this.current_user);


  }

  ngOnInit() {
   if(this.current_user.dark_theme){
        this.toogleTheme(false);
   }
  }

   goBack(){
     this._location.back();
  }
  updateTheme(bool){
    this.current_user.dark_theme = bool;
    this.authService.setNewUser(this.current_user);

  }

  editModeActive(){
        this.sharedService.editModeToggle(true);
  }
}
