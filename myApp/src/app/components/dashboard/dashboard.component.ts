import {Component,  EventEmitter, OnInit} from '@angular/core';
import {DashboardService} from '../../services/dashboard.service';
import {Account} from '../../models/account';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatDialog} from '@angular/material';
import {DialogWindowComponent} from '../dialog-window/dialog-window.component';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Income} from '../../models/income';
import {Spending} from '../../models/spending';
import {Category} from '../../models/category';
import {EditWindowComponent} from '../edit-window/edit-window.component';
import {consoleTestResultHandler} from 'tslint/lib/test';
import {Observable} from 'rxjs';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private accounts$ : Observable<Account[]>;
  private incomes$ : Observable<Income[]>;
  private income_sum$: Observable<number>;
  private account_sum$: Observable<number>;
  private categories$ :  Observable<Category[]>;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];


  constructor(private dashboardService:DashboardService, public dialog: MatDialog) {
  }
  ngOnInit() {
    this.incomes$ = this.dashboardService.getAll("income");
    this.accounts$ = this.dashboardService.getAll("account");
    this.categories$ = this.dashboardService.getAll("category");
    this.income_sum$ = this.dashboardService.getSum('income');
    this.account_sum$ = this.dashboardService.getSum('account');

  }
  openDialogToAddNew(ofType, keys:Array<any>, toArray) {
    const dialogRef = this.dialog.open(DialogWindowComponent, {
      width: '250px',
      data: keys
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined)this.add(ofType,result,toArray);
    });
  }
  openDialogToEditOld(item){
    const dialogRef = this.dialog.open(EditWindowComponent,{
      width: '250px',
      data: item
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined)this.upgrade(result);
    });
  }

  //drop(event: CdkDragDrop<any>) {
  //  moveItemInArray(this.accounts$, event.previousIndex, event.currentIndex);
  // }
  onDragEnded(event,item) {
    let element = event.source._dragRef._pointerPositionAtLastDirectionChange;
    let x = element.x;
    let y = element.y;
    let underElement = document.elementFromPoint(x  , y );
    if(underElement.classList.contains("box") && !underElement.classList.contains("active")){
      console.log(underElement)
      underElement.classList.add("active");
    }
    new EventEmitter();


    this.transitionBegin(item,false)
  }
  transitionBegin(fromData,toData){
    //console.log(fromData);

    return true;
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


  //upgrade Coin

  upgrade(item){
    this.dashboardService.upgradeIncome(item).subscribe(()=>
      this.income_sum$ = this.dashboardService.getSum('income')
    );
  }


  // add Coin on UI
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
        this.account_sum$ = this.dashboardService.getSum('account');
      });
    }else if(type  ===  "Income"){
      let newItem: Income = {
        name: item.name,
        amount: item.amount
      };
      this.dashboardService.createIncome(newItem).subscribe((res : any)=>{
        newItem.id = res.last_added_id;
        toArray.push(newItem);
        this.income_sum$ = this.dashboardService.getSum('income');
      });

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
  remove(type,item, from: Array<any>){
    const index = from.indexOf(item);
    if (index >= 0) {
      from.splice(index, 1);
      console.log(item);

      if (type ===  "Account") {
        this.dashboardService.deleteAccount(item).subscribe(
          ()=>{
            this.account_sum$ = this.dashboardService.getSum('account');
          }
        );

      }else if(type=== "Income"){
        this.dashboardService.deleteIncome(item).subscribe(
          ()=>{
            this.income_sum$ = this.dashboardService.getSum('income');
          }
        );

      }
      else if(type === "Spending"){
        //this.dashboardService.deleteSpending(item);
      }else if(type === "Category"){
        this.dashboardService.deleteCategory(item);
      }
    }

  }


}
