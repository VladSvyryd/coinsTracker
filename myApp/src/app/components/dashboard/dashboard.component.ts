import {Component, ElementRef, EventEmitter, OnInit, QueryList, ViewChildren} from '@angular/core';
import {DashboardService} from '../../services/dashboard.service';
import {Account} from '../../models/account';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatDialog} from '@angular/material';
import {DialogWindowComponent} from '../dialog-window/dialog-window.component';
import {CdkDrag, CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {Income} from '../../models/income';
import {Spending} from '../../models/spending';
import {Category} from '../../models/category';
import {EditWindowComponent} from '../edit-window/edit-window.component';
import {consoleTestResultHandler} from 'tslint/lib/test';
import {Observable} from 'rxjs';
import {SharedService} from '../../services/shared.service';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {trigger, transition, useAnimation, style} from '@angular/animations';
import { bounce,fadeIn, fadeOut, hinge, shake } from 'ng-animate';
import {TransactionDialogComponent} from '../transaction-dialog/transaction-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [transition('void  => *', useAnimation(fadeIn)),transition('*  => void', useAnimation(hinge))]),
    trigger('shake', [transition('notClicked  <=> clicked', useAnimation(shake))]),
  ]
})
export class DashboardComponent implements OnInit {
  private accounts$ : Observable<Account[]>;
  private incomes$ : Observable<Income[]>;
  private categories$ :  Observable<Category[]>;
  private spending$ :  Observable<Spending[]>;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  bounce: any;
  currency = '€';
  isMobile: Observable<BreakpointState>;
  clickedState = "notClicked";
  @ViewChildren("acc", { read: CdkDrag }) cdkAccChildren: QueryList<CdkDrag>;
  @ViewChildren("cat", { read: CdkDrag }) cdkCatChildren: QueryList<CdkDrag>;
  constructor(private dashboardService:DashboardService, public dialog: MatDialog, private sharedService: SharedService,private breakpointObserver: BreakpointObserver) {
  }
  ngOnInit() {
    this.incomes$ = this.dashboardService.getAll("income");
    this.accounts$ = this.dashboardService.getAll("account");
    this.categories$ = this.dashboardService.getAll("category");
    this.isMobile = this.breakpointObserver.observe(Breakpoints.Handset);
  }
  ngAfterInit(){

  }
   changeState() {
    this.clickedState = (this.clickedState === 'clicked' ? 'notClicked' : 'clicked');
  }

  detectCollision(e) {
    // html element, to get colliderBox
    let draggableElementRef = e.event.target;
    // cdk object to interact with its data
    let cdkDrag = e.source;
    let list;
    // html elements should have either inc or acc class
    if (cdkDrag.getRootElement().classList.contains("inc")) {
      list = this.cdkAccChildren;
    } else if (cdkDrag.getRootElement().classList.contains("acc")) {
      list = this.cdkCatChildren
        .toArray()
        .concat(this.cdkAccChildren.toArray());
    }
    list.forEach(cdkDrop => {
      let droppableElementRef = cdkDrop.getRootElement();
      if (this.isCollide(draggableElementRef, droppableElementRef)) {
        console.log("sd");
        //if (this.coveredState !== "covered") this.changeState();
      }
    });
  }

  private tryMakeTransaction(obj: any) {
      const dialogRef = this.dialog.open(TransactionDialogComponent, {
      width: '400px',
      data: {from:"acc",to:"cat"}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
          //this.transitionBegin(obj.cdkDrop.data,obj.cdkDrag.data,result);
    });
  }

  makeTransaction_ResetPosition(e, dragRef) {
    // html button
    let draggableElementRef = e.source.getRootElement();
    // cdkDrag object with data in it
    let cdkDrag = e.source;
    // create a list to iterate only through needed elements
    let list;
    let acc_to_acc_transaction;
    // draggable knows on which element it could be dropped
    if (draggableElementRef.classList.contains("inc")) {
      acc_to_acc_transaction = false;
      list = this.cdkAccChildren;
    } else if (draggableElementRef.classList.contains("acc")) {
      // account coins are allowed to be send to another accounts
      list = this.cdkCatChildren
        .toArray()
        .concat(this.cdkAccChildren.toArray());
      acc_to_acc_transaction = true;
    }
    list.forEach(cdkDrop => {
      let droppableElementRef = cdkDrop.getRootElement();
      // collision detection goes through all accounts, and could be done on the same element, fixed bug
      if (this.isCollide(draggableElementRef, droppableElementRef )&& droppableElementRef.id !== draggableElementRef.id ) {
        console.log("MakeTransaktion");
        this.tryMakeTransaction({
          acc_to_acc_transaction: acc_to_acc_transaction,
          cdkDrag,
          cdkDrop
        });
      }else{

      }
    });
    e.source.reset();
   // this.changeState();
  }

  openDialogToAddNew(ofType, keys:Array<any>, toArray) {
    const dialogRef = this.dialog.open(DialogWindowComponent, {
      width: '300px',
      data: keys
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined)this.add(ofType,result,toArray);
    });
  }
  openDialogToEditOld(item){
    const dialogRef = this.dialog.open(EditWindowComponent,{
      width: '300px',
      data: item
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined)this.upgrade(result,item.title);
    });
  }


  transitionBegin(fromData,toData,amount){
    console.log("try Transaktion");
       let newSpending: Spending = {
            description:'',
            amount:amount,
            account_id:toData.id,
            category_id:fromData.id,
      };
    this.dashboardService.createSpending(newSpending).subscribe((res: any)=>{
        newSpending.id = res.last_added_id;
        this.sharedService.emitChange('account');
      });
  }
  //upgrade Coin

  upgrade(item,itemType){

    if (itemType ===  "Account") {
      this.dashboardService.upgradeAccount(item).subscribe(()=>
        this.sharedService.emitChange('account')
      );
    }else if(itemType=== "Income"){

      this.dashboardService.upgradeIncome(item).subscribe(()=>
        this.sharedService.emitChange('income')

      );
    }

  }
  // add Coin on UI
  add(type,item, toArray:Array<any>): void {
    console.log(type);
    if (type  === "Account") {
      let newItem: Account = {
        amount: item.amount || 0,
        name:item.name,
        description:item.description};
      this.dashboardService.createAccount(newItem).subscribe((res: any)=>{
        newItem.id = res.last_added_id;
        toArray.push(newItem);
        this.sharedService.emitChange('account');


      });
    }else if(type  ===  "Income"){
      let newItem: Income = {
        name: item.name,
        amount: item.amount
      };
      this.dashboardService.createIncome(newItem).subscribe((res : any)=>{
        newItem.id = res.last_added_id;
        toArray.push(newItem);
        this.sharedService.emitChange('income');
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
            this.sharedService.emitChange('account');
          }
        );

      }else if(type=== "Income"){
        this.dashboardService.deleteIncome(item).subscribe(
          ()=>{
            this.sharedService.emitChange('income');
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

  isCollide(a, b){
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
      ((aRect.top + aRect.height) < (bRect.top)) ||
      (aRect.top > (bRect.top + bRect.height)) ||
      ((aRect.left + aRect.width) < bRect.left) ||
      (aRect.left > (bRect.left + bRect.width))
    );
  }

}
