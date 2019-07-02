import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthServiceService} from "./auth-service.service";

@Injectable({
  providedIn: 'root'
})
export class OnlyLoggedInUsersGuard implements  CanActivate{
  constructor(private authService: AuthServiceService,public router: Router) {};

   canActivate() {
    console.log("OnlyLoggedInUsers");
    //if (!this.authService.isTokenExpired()) {
    if (true) {
      return true;
    } else {
      this.router.navigate(["ups"]);
    return false;
    }
  }
}
