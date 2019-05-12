import { Component, OnInit } from '@angular/core';
import {DashboardService} from "../../services/dashboard.service";
import { Observable } from "rxjs";
import { Account } from "../../models/account";
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material';
import {MatDialog} from '@angular/material';
import {DialogWindowComponent} from "../dialog-window/dialog-window.component";

export interface DialogData {
  animal: string;
  name: string;
}
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
  animal: string;
  name: string;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  constructor(private dashboardService:DashboardService, public dialog: MatDialog) {

    this.dashboardService.getAllAccounts().subscribe((res : Account[])=>{
      this.accounts = res;
    });
  }
  sleep(delay) {
    let start = new Date().getTime();
    while (new Date().getTime() < start + delay);
  }
    openDialog() {
    const dialogRef = this.dialog.open(DialogWindowComponent, {
      width: '250px',
      data: {name: this.name, animal: this.animal}
    });
     dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
       this.animal = result;
    });
  }


  // add Chip on UI
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add our account
    if ((value || '').trim()) {
      let valueAsString = value.toString().trim();
      this.accounts.push({
        id:1,
        amount:999,
        date:"",
        name:valueAsString
      });
      let newAccount: Account = { amount: 999,
        id: 2,
        date:"",
        name:valueAsString}
      this.dashboardService.createAccount(newAccount)


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
      this.dashboardService.deleteAccount(account)
    }
  }
  ngOnInit() {
  }

}
