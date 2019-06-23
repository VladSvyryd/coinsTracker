import { Component, OnInit } from '@angular/core';
import {ChartType, ChartOptions, ChartDataSets} from 'chart.js';
import {SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color} from 'ng2-charts';
import {Observable} from "rxjs";
import {Account} from "../../models/account";
import {DashboardService} from "../../services/dashboard.service";
import {formatDate} from "@angular/common";



@Component({
  selector: 'app-account-balance',
  templateUrl: './account-balance.component.html',
  styleUrls: ['./account-balance.component.scss']
})
export class AccountBalanceComponent implements OnInit {
  private account_balance$: Observable<number>;
  private accBalanceHistory$: Observable<any[]>;

  public accountHistory = [];
  public incomes$ = [];
  public expenses = [];


  public lineChartData = [
    { data: [], label: 'Account balance', borderWidth:1.5},
  ];

  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{
        gridLines: { color: 'rgba(255,255,255,0.1)' }
      }],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          ticks: {
           // stepSize : 50,
            beginAtZero: true,
          }
        },
      ]
    },
    annotation: {

    },
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.3)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';

  constructor (private dashService:DashboardService, private dashboardService: DashboardService) { }


  ngOnInit() {
    this.getCurrentBalance();
    this.getAccountHistory();
  }

  getCurrentBalance() {
     this.dashboardService.getSum('account').subscribe((sum)=>{
     });
  }

  getAccountHistory() {
    this.dashboardService.getAccountBalanceHistory('account_balance').subscribe((res:any)=>{
      //console.log(res)
        this.accountHistory = res
        console.log( "account history", this.accountHistory)

      for(let i in res) {
        this.lineChartLabels.push(this.transformDate(res[i].date))
        this.lineChartData[0].data.push(res[i].account_balance)
      }
    })
  }
  transformDate(date) {
    return formatDate(date, 'dd-MM-yy','en');
  }

}


