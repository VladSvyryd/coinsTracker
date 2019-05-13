import { Component, OnInit } from '@angular/core';
import {DashboardService} from "../../services/dashboard.service";
import { Observable } from "rxjs";
import { Account } from "../../models/account";
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material';
import {MatDialog} from '@angular/material';
import {DialogWindowComponent} from "../dialog-window/dialog-window.component";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

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
      data: {name: '' ,amount: ''}
    });
     dialogRef.afterClosed().subscribe(result => {
      console.log("This comes from dialog",result);
      if(result != undefined && result.name !== "" && result.amount != "")this.add(result);
    });
  }
 drop(event: CdkDragDrop<{title: string, poster: string}[]>) {
    moveItemInArray(this.accounts, event.previousIndex, event.currentIndex);
  }

  // add Chip on UI
  add(tempObject): void {
    // Add our account

      let new_name = tempObject.name.toString().trim();
      let new_amount = tempObject.amount.toString().trim();
      this.accounts.push({
        id:1,
        amount:new_amount,
        date:"",
        name:new_name
      });
      let newAccount: Account = { amount: new_amount,
        id: 2,
        date:"",
        name:new_name}
      this.dashboardService.createAccount(newAccount)

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
