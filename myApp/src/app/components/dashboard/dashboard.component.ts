import {Component, OnInit} from '@angular/core';
import {DashboardService} from '../../services/dashboard.service';
import {Account} from '../../models/account';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatDialog} from '@angular/material';
import {DialogWindowComponent} from '../dialog-window/dialog-window.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Income} from '../../models/income';
import {Spending} from '../../models/spending';
import {Category} from '../../models/category';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private accounts : Account[] = [];
  private incomes : Income[] = [];
  private sums = {
    income_sum : 0 as any,
    account_sum : 0 as any
  };
  private categories : Category[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  constructor(private dashboardService:DashboardService, public dialog: MatDialog) {
    this.dashboardService.getAll("income").subscribe((res : Income[])=>{
      this.incomes = res;
      console.log(this.incomes);
    });
    this.dashboardService.getAll("account").subscribe((res : Account[])=>{
      this.accounts = res;
    });

    this.dashboardService.getAll("category").subscribe((res : Category[])=>{
      this.categories = res;
    });
    this.dashboardService.getSum('income').subscribe((res)=> this.sums.income_sum = res as number);
    this.dashboardService.getSum('account').subscribe((res)=> this.sums.account_sum = res as number);

  }

  openDialog(ofType,keys:Array<any>, toArray) {
    const dialogRef = this.dialog.open(DialogWindowComponent, {
      width: '250px',
      data: keys
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined)this.add(ofType,result,toArray);
    });
  }
  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.accounts, event.previousIndex, event.currentIndex);

  }
  onDragEnded(event) {
    let element = event.source.getRootElement();
    let boundingClientRect = element.getBoundingClientRect();
    console.log(boundingClientRect);
    let parentPosition = this.getPosition(document.querySelector("html"));
    let  x = (boundingClientRect.x - parentPosition.left);
    let y = (boundingClientRect.y - parentPosition.top);
    console.log('x: ' + x, 'y: ' + y);

    console.log(document.elementFromPoint(x  , y ));
  }
  getPosition(el) {
    let x = 0;
    let y = 0;
    while(el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { top: y, left: x };
  }
  // add Chip on UI
  add(type,item, toArray:Array<any>): void {
    console.log(type);
    if (type  === "Account") {
      let newItem: Account = {
        amount: item.amount || 0,
        name:item.name,
        description:item.description}
      this.dashboardService.createAccount(newItem).subscribe((res: any)=>{
        newItem.id = res.last_added_id;
        toArray.push(newItem);
      });
      this.sums.account_sum= parseInt(this.sums.account_sum) + parseInt(item.amount);
    }else if(type  ===  "Income"){
      let newItem: Income = {
        name: item.name,
        amount: item.amount
      };
      this.dashboardService.createIncome(newItem).subscribe((res : any)=>{
        newItem.id = res.last_added_id;
        toArray.push(newItem);
      });
      this.sums.income_sum= parseInt(this.sums.income_sum) + parseInt(item.amount);
    }
    else if(type  ===  "Category"){
      let newItem: Category = {
        name: item.name,
        description: item.description || "",
      };
      this.dashboardService.createCategory(item).subscribe((res : any)=>{
        newItem.id = res.last_added_id;
        toArray.push(newItem);
      });
    }



  }

  // remove chip from UI
  remove(type,item, from: Array<any>): void {
    const index = from.indexOf(item);
    if (index >= 0) {
      from.splice(index, 1);
      console.log(item);

      if (type ===  "Account") {
        this.sums['account_sum'] -= item.amount;

        this.dashboardService.deleteAccount(item);

      }else if(type=== "Income"){
        console.log("Income",item);
        this.sums['income_sum'] -= item.amount;

        this.dashboardService.deleteIncome(item);
      }
      else if(type === "Spending"){
        //this.dashboardService.deleteSpending(item);
      }else if(type === "Category"){
        this.dashboardService.deleteCategory(item);
      }
    }

  }
  ngOnInit() {
  }

}
