import { Component, OnInit } from '@angular/core';
import {DashboardService} from "../../services/dashboard.service";
import { Account } from "../../models/account";
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatDialog} from '@angular/material';
import {DialogWindowComponent} from "../dialog-window/dialog-window.component";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {Income} from "../../models/income";

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
  private incomes : Income[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  constructor(private dashboardService:DashboardService, public dialog: MatDialog) {

    this.dashboardService.getAllAccounts().subscribe((res : Account[])=>{
      this.accounts = res;
    });
    this.dashboardService.getAllIncomes().subscribe((res : Income[])=>{
      this.incomes = res;
      console.log(res)
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
  drop(event: CdkDragDrop<any>) {
    console.log(event);
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
  remove(item:any, from: Array<any>): void {
    const index = from.indexOf(item);
    if (index >= 0) {
      from.splice(index, 1);
//      this.dashboardService.deleteAccount(item)
      this.dashboardService.deleteIncome(item)
    }
  }
  ngOnInit() {
  }

}
