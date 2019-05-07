import { Component, OnInit } from '@angular/core';
import {AuthServiceService} from "../../services/auth-service.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
 accounts:any = {
   name: '',
   amount: ''
 };
  constructor(private authService:AuthServiceService) {
    this.accounts  = this.authService.getAllAccounts();
 console.log(this.accounts)
  }

  ngOnInit() {
  }

}
