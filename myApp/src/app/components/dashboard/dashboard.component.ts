import { Component, OnInit } from '@angular/core';
import {AuthServiceService} from "../../services/auth-service.service";
import { Observable } from "rxjs";
import { Account } from "../../models/account";


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private accounts : Account[] = [];
  private accountsObservable : Observable<Account[]> ;

  constructor(private authService:AuthServiceService) {
    this.authService.getAllAccounts().subscribe((res : any[])=>{
      this.accounts = res;
    });
  }

  ngOnInit() {
  }

}
