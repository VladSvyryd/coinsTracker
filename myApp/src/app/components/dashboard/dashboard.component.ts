import { Component, OnInit } from '@angular/core';
import {AuthServiceService} from "../../services/auth-service.service";
import { Observable } from "rxjs";
import { Account } from "../../models/account";
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private accounts : Account[] = [];
  private accountsObservable : Observable<Account[]> ;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  constructor(private authService:AuthServiceService) {

    this.authService.getAllAccounts().subscribe((res : Account[])=>{
      this.accounts = res;
    });
  }
  sleep(delay) {
    let start = new Date().getTime();
    while (new Date().getTime() < start + delay);
  }
  // add Chip on UI
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    console.log(input, value)
    // Add our account

    if ((value || '').trim()) {
      let valueAsString = value.toString().trim();
      this.accounts.push({
        id:1,
        amount:999,
        date:"",
        description:"",
        name:valueAsString
      });
      let newAccount: Account = { amount: 999,
        id: 2,
        date:"",
        description:"",
        name:valueAsString}
      this.authService.createAccount(newAccount)


    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  // remove chip from UI
  remove(account: Account): void {
    const index = this.accounts.indexOf(account);

    if (index >= 0) {
      this.accounts.splice(index, 1);
      this.authService.deleteAccount(account)
    }
  }
  ngOnInit() {
  }

}
