import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {DashboardService} from '../../services/dashboard.service';
import {Account} from '../../models/account';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatDialog} from '@angular/material';
import {DialogWindowComponent} from '../dialog-window/dialog-window.component';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Income} from '../../models/income';
import {Spending} from '../../models/spending';
import {Expense} from '../../models/expense';
import {EditWindowComponent} from '../edit-window/edit-window.component';
import {Observable} from 'rxjs';
import {SharedService} from '../../services/shared.service';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {transition, trigger, useAnimation} from '@angular/animations';
import {fadeIn, hinge, shake} from 'ng-animate';
import {TransactionDialogComponent} from '../transaction-dialog/transaction-dialog.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition('void  => *', useAnimation(fadeIn)),
      transition('*  => void', useAnimation(hinge))
    ]),
    trigger('shake', [
      transition('notClicked  <=> clicked', useAnimation(shake))
    ])
  ]
})
export class DashboardComponent implements OnInit {
  private accounts$: Observable<Account[]>;
  private incomes$: Observable<Income[]>;
  private categories$: Observable<Expense[]>;
  private spending$: Observable<Spending[]>;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  bounce: any;
  currency = '€';
  isMobile: Observable<BreakpointState>;
  clickedState = 'notClicked';
  @ViewChildren('acc', {read: CdkDrag}) cdkAccChildren: QueryList<CdkDrag>;
  @ViewChildren('cat', {read: CdkDrag}) cdkCatChildren: QueryList<CdkDrag>;
  @ViewChild('transaction') bs;
  private last_transaction;

  constructor(
    private dashboardService: DashboardService,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private breakpointObserver: BreakpointObserver
  ) {
  }

  ngOnInit() {
    this.incomes$ = this.dashboardService.getAll('income');
    this.accounts$ = this.dashboardService.getAll('account');
    this.categories$ = this.dashboardService.getAll('expense');
    this.isMobile = this.breakpointObserver.observe(Breakpoints.Handset);
  }

  ngAfterInit() {
  }

  changeState() {
    this.clickedState =
      this.clickedState === 'clicked' ? 'notClicked' : 'clicked';
  }

  detectCollision(e) {
    // set draggable z index to 9999 with css , to see it always over ui items
    this.setDraggableRef_z_Index(e.event);
    // html element, to get colliderBox
    let draggableElementRef = e.event.target;
    // cdk object to interact with its data
    let cdkDrag = e.source;
    let list;
    // html elements should have either inc or acc class
    if (cdkDrag.getRootElement().classList.contains('inc')) {
      list = this.cdkAccChildren;
    } else if (cdkDrag.getRootElement().classList.contains('acc')) {
      list = this.cdkCatChildren
        .toArray()
        .concat(this.cdkAccChildren.toArray());
    }
    list.forEach(cdkDrop => {
      let droppableElementRef = cdkDrop.getRootElement();
      if (this.isCollide(draggableElementRef, droppableElementRef)) {
        console.log('sd');
        //if (this.coveredState !== "covered") this.changeState();
      }
    });
  }

  private setDraggableRef_z_Index(event: any) {
       // console.log(event.path[0].tagName , event.path[1].tagName);
        if(event.path[0].nodeName  == "BUTTON"){
          event.path[0].classList.add("z_Index_dragged");
        }else if (event.path[1].tagName == "BUTTON"){
          event.path[1].classList.add("z_Index_dragged");
        }
  }

  private tryMakeTransaction() {

    // open dialog  window to make transaction
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      width: '400px',
      data: {
        from: this.last_transaction.cdkDrag.data.name,
        to: this.last_transaction.cdkDrop.data.name
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      if (result != undefined) {
        this.transitionBegin(
          this.last_transaction.cdkDrag.data,
          this.last_transaction.cdkDrop.data,
          parseInt(result.amount)
        );
      }
    });
  }

  makeTransaction_ResetPosition(e, dragRef) {
    // html button
    let draggableElementRef = e.source.getRootElement();
    // cdkDrag object with data in it
    let cdkDrag = e.source;
    // create a list to iterate only through needed elements
    let list;
    let type_of_transaction;
    // draggable knows on which element it could be dropped
    if (draggableElementRef.classList.contains('inc')) {
      type_of_transaction = "inc_acc";
      list = this.cdkAccChildren;
    } else if (draggableElementRef.classList.contains('acc')) {
      // account coins are allowed to be send to another accounts
      list = this.cdkCatChildren
        .toArray()
        .concat(this.cdkAccChildren.toArray());
      type_of_transaction = "acc_exp";
    }
    list.forEach(cdkDrop => {
      let droppableElementRef = cdkDrop.getRootElement();
      // collision detection goes through all accounts, and could be done on the same element, bug fixed
      if (
        this.isCollide(draggableElementRef, droppableElementRef) &&
        droppableElementRef.id !== draggableElementRef.id
      ) {
        if (draggableElementRef.classList.contains("acc") && droppableElementRef.classList.contains("acc")) type_of_transaction = "acc_acc";
        console.log(type_of_transaction);
        this.last_transaction = {
          type_of_transaction: type_of_transaction,
          cdkDrag,
          cdkDrop,
        };
        // small hack to open Dialog window to make a transaction
        this.bs.nativeElement.click();
      }
    });
    e.source.reset();
    draggableElementRef.classList.remove("z_Index_dragged");
    // this.changeState();
  }

  openDialogToAddNew(ofType, keys: Array<any>, toArray) {
    const dialogRef = this.dialog.open(DialogWindowComponent, {
      width: '300px',
      data: keys
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        this.add(ofType, result, toArray);
      }
    });
  }

  openDialogToEditOld(item) {
    const dialogRef = this.dialog.open(EditWindowComponent, {
      width: '300px',
      data: item
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        this.upgrade(result, item.title);
      }
    });
  }

  transitionBegin(fromData, toData, amount) {
    console.log(fromData, toData, amount);
    if(this.last_transaction.type_of_transaction =="acc_exp"){
    let newSpending: Spending = {
      description: '',
      amount: amount,
      account_id: fromData.id,
      expense_id: toData.id
    };

    this.dashboardService.createSpending(newSpending).subscribe((res: any) => {
      newSpending.id = res.last_added_id;
      this.sharedService.emitChange('account');
      this.itterate();
    });
    }else if(this.last_transaction.type_of_transaction =="inc_acc"){
      this.dashboardService.transaction_Inc_to_Acc(fromData,toData,amount).subscribe(
        (res)=>{
           this.sharedService.emitChange('income');
           this.sharedService.emitChange('account');
        }
      );
    }
    else if(this.last_transaction.type_of_transaction =="acc_acc"){
      this.dashboardService.transaction_Acc_to_Acc(fromData,toData,amount).subscribe(
        (res)=>{
           this.sharedService.emitChange('account');
        }
      );
    }

  }

  //upgrade Coin

  upgrade(item, itemType) {
    if (itemType === 'Account') {
      this.dashboardService
        .upgradeAccount(item)
        .subscribe(() => this.sharedService.emitChange('account'));
    } else if (itemType === 'Income') {
      this.dashboardService
        .upgradeIncome(item)
        .subscribe(() => this.sharedService.emitChange('income'));
    }
  }

  // add Coin on UI
  add(type, item, toArray: Array<any>): void {
    console.log(type);
    if (type === 'Account') {
      let newItem: Account = {
        amount: item.amount || 0,
        name: item.name,
        description: item.description
      };
      this.dashboardService.createAccount(newItem).subscribe((res: any) => {
        newItem.id = res.last_added_id;
        toArray.push(newItem);
        this.sharedService.emitChange('account');
      });
    } else if (type === 'Income') {
      let newItem: Income = {
        name: item.name,
        amount: item.amount
      };
      this.dashboardService.createIncome(newItem).subscribe((res: any) => {
        newItem.id = res.last_added_id;
        toArray.push(newItem);
        this.sharedService.emitChange('income');
      });
    } else if (type === 'Expense') {
      let newItem: Expense = {
        name: item.name,
        description: item.description || ''
      };
      this.dashboardService.createCategory(item).subscribe((res: any) => {
        newItem.id = res.last_added_id;
        toArray.push(newItem);
      });
    }
  }

  // remove chip from UI
  remove(type, item, from: Array<any>) {
    const index = from.indexOf(item);
    if (index >= 0) {
      from.splice(index, 1);
      console.log(item);

      if (type === 'Account') {
        this.dashboardService.deleteAccount(item).subscribe(() => {
          this.sharedService.emitChange('account');
        });
      } else if (type === 'Income') {
        this.dashboardService.deleteIncome(item).subscribe(() => {
          this.sharedService.emitChange('income');
        });
      } else if (type === 'Spending') {
        //this.dashboardService.deleteSpending(item);
      } else if (type === 'Expense') {
        this.dashboardService.deleteExpense(item);
      }
    }
  }

  isCollide(a, b) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
      aRect.top + aRect.height < bRect.top ||
      aRect.top > bRect.top + bRect.height ||
      aRect.left + aRect.width < bRect.left ||
      aRect.left > bRect.left + bRect.width
    );
  }

  itterate(){
    this.accounts$.forEach(item=>console.log(item))
  }

}

// :TODO - Update on frontEnd Income,Account,Expenses
