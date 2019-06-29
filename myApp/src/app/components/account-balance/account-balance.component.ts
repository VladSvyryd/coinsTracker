import {Component, OnInit} from '@angular/core';
import {ChartOptions} from 'chart.js';
import {Label, Color} from 'ng2-charts';
import {DashboardService} from "../../services/dashboard.service";
import {formatDate} from "@angular/common";
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SharedService} from '../../services/shared.service';

@Component({
  selector: 'app-account-balance',
  templateUrl: './account-balance.component.html',
  styleUrls: ['./account-balance.component.scss']
})

export class AccountBalanceComponent implements OnInit {

  public accountHistory = [];
  public dateRange = [
    {date:"Week",days:7},
    {date:"Month",days: getDaysInMonths(1,new Date().getMonth(),new Date().getFullYear())},
    {date:"4 Months",days:getDaysInMonths(4,new Date().getMonth(),new Date().getFullYear())},
    {date:"Year",days:days_of_a_year(new Date().getFullYear())}
  ];
  public lineChartData = [
    { data: [], label:"Account balance", borderWidth:1.5},
  ];
  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{
        gridLines: { color: 'rgba(148,159,177,0.3)',
        },
        categoryPercentage: 100,
        distribution: 'linear',
        ticks: {
          suggestedMax: 3
        }
      },
      ],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
          ticks: {
            stepSize : 50,
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
  defaultSelected = 7;
    currency = "€";

  constructor (private dashService:DashboardService,private sharedService: SharedService, private dashboardService: DashboardService,private fb: FormBuilder) {
  }
  ngOnInit() {
    this.getAccountHistory();
    this.sharedService.loadChartAgain$.subscribe(name => {
      switch (name) {
        case "account-chart":
          this.getAccountHistory()
          break;
        case "line-chart":
          break;
        case "donut-chart":
          break;
      }
    });
  }

  getAccountHistory(range = 7) {
    this.lineChartLabels = [];
    this.lineChartData[0].data = []
    this.dashboardService.getAccountBalanceHistory(range).subscribe((res:any)=>{
      this.accountHistory = res;
        let mySet = new Set();
      for(let i=0; i<res.length; i++) {
        mySet.add(this.transformDate(res[i].date))
        //this.lineChartLabels.push(this.transformDate(res[i].date));
        this.lineChartData[0].data.push(res[i].account_balance)
      }
      this.lineChartLabels = Array.from(mySet);
    })
  }
  transformDate(date) {
    return formatDate(date, 'dd-MM','en');
  }

  updateChartOnDate(range) {
    this.getAccountHistory(range);
  }

}

function getDaysInMonths(numberOfMonthsBefore,month,year) {
  // Here January is 1 based
  //Day 0 is the last day in the previous month
  let days = 0;
  let current_month = month+1;
  while(numberOfMonthsBefore != 0){
    days +=  new Date(year, current_month, 0).getDate();
    numberOfMonthsBefore--;
    current_month--;
  }
  return days
};
function days_of_a_year(year)
{
  return isLeapYear(year) ? 366 : 365;
}

function isLeapYear(year) {
  return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}
