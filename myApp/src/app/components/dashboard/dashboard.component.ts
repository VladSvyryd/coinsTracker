import {Component, ElementRef, EventEmitter, OnInit, QueryList} from '@angular/core';
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
import {SharedService} from '../../services/shared.service';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {trigger, transition, useAnimation, style} from '@angular/animations';
import { bounce,fadeIn, fadeOut, hinge, shake } from 'ng-animate';

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
  constructor(private dashboardService:DashboardService, public dialog: MatDialog, private sharedService: SharedService,private breakpointObserver: BreakpointObserver) {
  }
  ngOnInit() {
    this.incomes$ = this.dashboardService.getAll("income");
    this.accounts$ = this.dashboardService.getAll("account");
    this.categories$ = this.dashboardService.getAll("category");
    this.isMobile = this.breakpointObserver.observe(Breakpoints.Handset);
  }

   changeState() {
    this.clickedState = (this.clickedState === 'clicked' ? 'notClicked' : 'clicked');
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

  //drop(event: CdkDragDrop<any>) {
  //  moveItemInArray(this.accounts$, event.previousIndex, event.currentIndex);
  // }
  onDragEnded(event,item) {
    let element = event.source._dragRef;
    console.log(element)

    //let x = element.x;
    //let y = element.y;
    //let colider = document.elementFromPoint(x  , y );
    //if(underElement.classList.contains("box") && !underElement.classList.contains("active")){
    //  console.log(underElement);
    //  underElement.classList.add("active");
    //}
    //new EventEmitter();
    //console.log(colider)
    let elements = document.querySelectorAll('#accountList button');

     elements.forEach((i)=>
     {
      // console.log(i.getBoundingClientRect());
       //console.log(this.isCollide(i,element))
       }
     );
  }
  drop(event){
    //console.log(event.item.element.nativeElement.getBoundingClientRect());
  }
  transitionBegin(fromData,toData){
    console.log("try Transaktion");
       let newSpending: Spending = {
            description:'',
            amount:40,
            category_id:1,
            account_id:11,
      };
    this.dashboardService.createSpending(newSpending).subscribe((res: any)=>{
        newSpending.id = res.last_added_id;
        this.sharedService.emitChange('account');
      });
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
