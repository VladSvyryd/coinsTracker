import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import {Color, BaseChartDirective, Label, monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend} from 'ng2-charts';
import {Observable} from 'rxjs';
import {Spending} from '../../models/spending';
import {DashboardService} from '../../services/dashboard.service';
import {formatDate} from '@angular/common';


@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent implements OnInit {
  private allSpending$: Observable<Spending[]>;

  //line chart
  public lineChartData = [
    { data: [], label: 'incomes' , borderWidth: 1.5 },
    { data: [], label: 'expenses' , borderWidth: 1.5 },
  ];

  public lineChartLabels: Label[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{
        gridLines: { color: 'rgba(255,255,255,0.1)' },

      }],
      yAxes: [
        {
          id: 'y-axis-0',
          position: 'left',
        },
      ]
    },
    annotation: {

    },
  };
  public lineChartColors: Color[] = [
    { // grey
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderColor: 'rgba(0,255,0,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'rgba(255,0,0,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  defaultSelected = getDaysInMonths(1,new Date().getMonth(),new Date().getFullYear());
  currency = "€";
  public dateRange = [
    {date:"Week",days:7},
    {date:"Month",days: getDaysInMonths(1,new Date().getMonth(),new Date().getFullYear())},
    {date:"1/4 Year",days:getDaysInMonths(4,new Date().getMonth(),new Date().getFullYear())},
    {date:"Year",days:days_of_a_year(new Date().getFullYear())}
  ];
  constructor(private dashboardService: DashboardService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit() {
    this.getAllDataAboutIncomesAndExpenses();
  }


  getAllDataAboutIncomesAndExpenses2(date_range=7) {
    this.lineChartLabels = [];
    this.lineChartData[0].data = []
    this.lineChartData[1].data = []
    this.dashboardService.getIcomesAndExpensesByDate(date_range).subscribe((res:any)=>{
      console.log(res)

      let mySet = new Set();
      for(let i=0; i<this.defaultSelected; i++) {
        mySet.add(this.transformDate(res[i].date))
        if(res[i].type === "income") {
          this.lineChartData[0].data.push(res[i].amount)
        }
        else{
          this.lineChartData[1].data.push(res[i].amount);
        }
      this.lineChartLabels.push(i+"");
      }
      console.log(this.lineChartData[0].data,
      this.lineChartData[1].data)
    });
  }
  getAllDataAboutIncomesAndExpenses(date_range=7) {

    let incomeMap = new Map();
    let expenseMap = new Map();

    let currentDate = Date.now();
    let oneDayOffset = 24 * 60 * 60 * 1000;
    for (let i=29; i>=0; i--) {
      let temp = this.transformDate(currentDate - i * oneDayOffset);
      incomeMap.set(temp, 0);
      expenseMap.set(temp, 0);
    }

    this.dashboardService.getIcomesAndExpensesByDate(date_range).subscribe((res:any)=> {
      for(let i=0; i<res.length; i++) {
        if(res[i].type === "income") {
          let newDate = this.transformDate(res[i].date);
          let amountValue = incomeMap.get(newDate);
          let sumValue = amountValue + res[i].amount;
          incomeMap.set(newDate, sumValue);
        }
        else {
          let newDate = this.transformDate(res[i].date);
          let amountValue = expenseMap.get(newDate);
          let sumValue = amountValue + res[i].amount;
          expenseMap.set(newDate, sumValue);
        }
      }

      let keys = Array.from(incomeMap.keys());
      let incomeValues = Array.from(incomeMap.values());
      //console.log("incomevalue", incomeValues)
      this.lineChartData[0].data = incomeValues;
      this.lineChartLabels = keys;

      let expenseValues = Array.from(expenseMap.values());

      this.lineChartData[1].data = expenseValues;

      console.log("map", incomeMap);

    })

  }


  transformDate(date) {
    return formatDate(date, 'dd-MM','en');
  }

  updateChartOnDate(range) {
    this.getAllDataAboutIncomesAndExpenses(range);
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
