import {Component, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {DashboardService} from '../../services/dashboard.service';
import {Account} from '../../models/account';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatBottomSheet, MatDialog, MatIconRegistry} from '@angular/material';
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
import {extractDirectiveDef} from '@angular/core/src/render3/definition';
import {BottomSheetComponent} from '../bottom-sheet/bottom-sheet.component';
import {Icons} from '../../models/icons';
import {DomSanitizer} from '@angular/platform-browser';
import {User} from '../../models/user';
import {AuthServiceService} from '../../services/auth-service.service';
import {AccountBalanceComponent} from '../account-balance/account-balance.component';

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
  private editModeActive = false;
  icons = Icons;
  userSettings:User;
  constructor(
    private dashboardService: DashboardService,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private breakpointObserver: BreakpointObserver,
    private bottomSheet: MatBottomSheet,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private auth:AuthServiceService,
  ) {
    this.icons.forEach((item)=>{
      let path = 'assets/img/fa-icons/'+item.name +'-solid.svg'
      iconRegistry.addSvgIcon(
        item.name,
        sanitizer.bypassSecurityTrustResourceUrl(path));
    })
  }

  initSettings(){
    this.userSettings = this.auth.getUserFromLocalStorage();
  }

  ngOnInit() {
    this.incomes$ = this.dashboardService.getAll('income');
    this.accounts$ = this.dashboardService.getAll('account');
    this.categories$ = this.dashboardService.getAll('expense');
    this.isMobile = this.breakpointObserver.observe(Breakpoints.HandsetPortrait);
    this.initSettings();
  }

  ngAfterInit() {
  }

  changeState( spent_amount) {
    this.clickedState =
      this.clickedState === 'clicked'  && !(spent_amount > 0 ) ? 'notClicked': 'clicked';
  }

  detectCollision(e) {
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
        //if (this.coveredState !== "covered") this.changeState();
      }
    });
  }

  private setDraggableRef_z_Index(event: any) {
    console.log(event.source.getRootElement().classList.add("z_Index_dragged"));
    //  if( !outLoop && item.nodeName  == "BUTTON") item.classList.add("z_Index_dragged"); outLoop=true;
  }

  private tryMakeTransaction() {

    // open dialog  window to make transaction
    const dialogRef = this.dialog.open(TransactionDialogComponent, {
      width: '300px',
      data: {
        from: this.last_transaction.cdkDrag.data,
        to: this.last_transaction.cdkDrop.data,
        type_of_transaction:this.last_transaction.type_of_transaction
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != undefined) {
        this.transitionBegin(
          this.last_transaction.cdkDrag.data,
          this.last_transaction.cdkDrop.data,
          parseInt(result.amount),
          result.description
        );
      }
    });
  }

  makeTransaction_ResetPosition(e, dragRef){
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
    list.forEach((cdkDrop) => {
      let droppableElementRef = cdkDrop.getRootElement();

      // collision detection goes through all accounts, and could be done on the same element, bug fixed
      if (
        this.isCollide(draggableElementRef, droppableElementRef) &&
      droppableElementRef.id !== draggableElementRef.id
      ) {
        if (draggableElementRef.classList.contains("acc") &&
          droppableElementRef.classList.contains("acc")) {
          type_of_transaction = "acc_acc";
        }

        this.last_transaction = {
          type_of_transaction: type_of_transaction,
          cdkDrag,
          cdkDrop
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
      width: '400px',
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

  transitionBegin(fromData, toData, amount,extras) {
    if(this.last_transaction.type_of_transaction =="acc_exp"){
      let newSpending: Spending = {
        description:  extras,
        amount: amount,
        account_id: fromData.id,
        expense_id: toData.id
      };

      this.dashboardService.createSpending(newSpending).subscribe((res: any) => {
        newSpending.id = res.last_added_id;
        this.sharedService.emitChange('account');
        this.sharedService.updateChart('account-chart');
        this.sharedService.updateChart('line-chart');
        this.sharedService.updateChart('donut-chart');
           let account_result = fromData.amount -= amount;
          let expense_result = toData.amount += amount;
          this.updateCoinsOf('account',fromData.id,account_result);
          this.updateCoinsOf('expense',toData.id,expense_result);

      });
    }else if(this.last_transaction.type_of_transaction =="inc_acc"){
      this.dashboardService.transaction_Inc_to_Acc(fromData,toData,amount).subscribe(
        (res)=>{
          this.sharedService.emitChange('income');
          this.sharedService.emitChange('account');
          this.sharedService.updateChart('account-chart');
          this.sharedService.updateChart('line-chart');
          let income_result = fromData.amount -= amount;
          let account_result = toData.amount += amount;
          this.updateCoinsOf('income',fromData.id,income_result);
          this.updateCoinsOf('account',toData.id,account_result);
        }
      );
    }
    else if(this.last_transaction.type_of_transaction =="acc_acc"){
      this.dashboardService.transaction_Acc_to_Acc(fromData,toData,amount).subscribe(
        (res)=>{
          this.sharedService.updateChart('account-chart');
          let account_result1 = fromData.amount -= amount;
          let account_result2 = toData.amount += amount;
          this.updateCoinsOf('account',fromData.id,account_result1);
          this.updateCoinsOf('account',toData.id,account_result2);
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
    if (type === 'Account') {
      let newItem: Account = {
        amount: item.amount || 0,
        name: item.name,
        description: item.description,
        icon: item.icon
      };
      this.dashboardService.createAccount(newItem).subscribe((res: any) => {
        newItem.id = res.last_added_id;
        toArray.push(newItem);
        this.sharedService.emitChange('account');
      });
    } else if (type === 'Income') {
      let newItem: Income = {
        name: item.name,
        amount: item.amount,
        icon: item.icon
      };
      this.dashboardService.createIncome(newItem).subscribe((res: any) => {
        newItem.id = res.last_added_id;
        toArray.push(newItem);
        this.sharedService.emitChange('income');
      });
    } else if (type === 'Expense') {
      let newItem: Expense = {
        name: item.name,
        description: item.description || '',
        icon:item.icon
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

  showExpensInfo(id){
    this.dashboardService.getSpendingByExpenseId(id).subscribe(res=>{
      console.log(res);
      if(res.length){
        const bottomSheet = this.bottomSheet.open(BottomSheetComponent,{
          panelClass: 'customBottomSheet',
          autoFocus: true,
          data: res
        });
      }
    });
  }
  truncate(input) {
    if (input.length > 8)
      return input.substring(0,8) + '..';
    else
      return input;
  };

  private updateCoinsOf(name: string,withId:number,toValue:any) {
    switch (name) {
      case 'income':
        document.querySelector('#incomeInfoBox_'+ withId).innerHTML = "€ " + toValue;
        break;
      case 'account':
        document.querySelector('#accountInfoBox_'+ withId).innerHTML = "€ " + toValue;
        break;
        case 'expense':
        document.querySelector('#expenseInfoBox_'+ withId).innerHTML = "€ " + toValue;
        break;
    }
  }
}

// :TODO - Update on frontEnd Income,Account,Expenses
