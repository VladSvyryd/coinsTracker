import {Component, Input, OnInit} from '@angular/core';
import {SharedService} from '../../services/shared.service';
import {DashboardService} from '../../services/dashboard.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnInit {
  @Input()
  title:String;

  @Input()
  data:String;

  private income_sum$: Observable<number>;
  private account_sum$: Observable<number>;
  private noIncomeSum;
  private noAccountSum;

  amount:any;
  constructor( private sharedService: SharedService, private dashService:DashboardService) { }

  ngOnInit() {
    this.income_sum$ = this.dashService.getSum('income');
    this.account_sum$ = this.dashService.getSum('account');
    this.income_sum$.subscribe(res=>{
      if(res[0] == null )this.noIncomeSum = true;
    });
    this.account_sum$.subscribe(
      res=>{
       if(res[0] == null ) this.noAccountSum = true;
      });
    // service that listen to changes of Sums
    this.sharedService.changeEmitted$.subscribe(sum => {
      switch (sum) {
        case "income":
          this.income_sum$ = this.dashService.getSum('income');
          break;
        case "account":
          this.account_sum$ = this.dashService.getSum('account');
          break;
      }
    });
  }

}
