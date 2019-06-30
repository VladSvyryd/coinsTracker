import {Component, OnInit} from '@angular/core';
import {ChartOptions, ChartDataSets} from 'chart.js';
import {Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color} from 'ng2-charts';
import {DashboardService} from "../../services/dashboard.service";
import { formatDate } from '@angular/common';
import {FormControl} from '@angular/forms';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';


import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Observable} from 'rxjs';



const moment = _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};



@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})

export class PieChartComponent implements OnInit {

  //line chart
  public lineChartData: ChartDataSets[] = [
    { data: [], label: 'incomes' , borderWidth: 1.5, fill: false},
    { data: [], label: 'expenses' , borderWidth: 1.5, fill: false},
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
      //backgroundColor: 'rgba(148,159,177,0.3)',
      borderColor: '#43E0AA',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
      { // red
      //backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';

  isMobile: Observable<BreakpointState>;

  date = new FormControl(moment());
  selectedYear;
  selectedMonth;

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.selectedYear = normalizedYear.year();
    this.date.setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonth.month());
    this.selectedMonth = normalizedMonth.month() + 1;
    this.date.setValue(ctrlValue);
    datepicker.close();

    this.getAllDataAboutIncomesAndExpenses();
  }


  constructor(private dashboardService: DashboardService, private breakpointObserver:BreakpointObserver) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
    this.isMobile = this.breakpointObserver.observe(Breakpoints.HandsetPortrait);
  }

  ngOnInit() {
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedYear = new Date().getFullYear();
    this.getAllDataAboutIncomesAndExpenses();
  }


  getAllDataAboutIncomesAndExpenses() {

    let incomeMap = new Map();
    let expenseMap = new Map();

    let numberOfDaysISelectedMonth= new Date(this.selectedYear, this.selectedMonth, 0).getDate();
    for (let i=1; i<=numberOfDaysISelectedMonth; i++) {
       let day;
       let month;
       if(i<10)  day = "0" + i; else day = i;
       if (new Date().getMonth()  < 10) month ="0" + this.selectedMonth; else {month=this.selectedMonth;}
       incomeMap.set(day +"-" + month, 0);
       expenseMap.set(day +"-" + month, 0);
    }

    this.dashboardService.getIcomesAndExpensesByDate(this.selectedMonth).subscribe((res:any)=> {
      console.log(res)
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
      this.lineChartData[0].data = incomeValues;
      this.lineChartLabels = keys;

      let expenseValues = Array.from(expenseMap.values());
      this.lineChartData[1].data = expenseValues;

    })

  }


transformDate(date) {
    return formatDate(date, 'dd-MM','en');
  }

}

