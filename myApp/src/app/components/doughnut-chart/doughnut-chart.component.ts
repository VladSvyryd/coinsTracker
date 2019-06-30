import {Component, OnInit} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Label, MultiDataSet} from 'ng2-charts';
import {Observable} from 'rxjs';
import {Spending} from '../../models/spending';
import {DashboardService} from '../../services/dashboard.service';
import {FormControl} from '@angular/forms';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';


import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';


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
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})


export class DoughnutChartComponent implements OnInit {

  private spending$: Observable<Spending[]>;
  public categoryIds = [];
  public expenses = 0;  // variable to store expenses for all categories
  public valueSingleCat;
  public nameSingleCat;

  public doughnutChartLabels: Label[] = [];
  public doughnutChartData: MultiDataSet = [];
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartOptions: ChartOptions = {
    cutoutPercentage: 70,

  };
  public doughnutChartDataset: ChartDataSets[]  =[
    {
      backgroundColor: [
        "rgba(37,176,250,0.3)",
        "rgba(67,224,170,0.3)",
        "rgba(147,92,203,0.3)",
        'rgba(20,20,62,0.3)',
        'rgba(255,110,0,0.3)',
        'rgba(240,200,0,0.3)',
        'rgba(0,239,171,0.3)',
        'rgba(5,209,255,0.3)',
        'rgba(132,19,134,0.3)',
        'rgba(255,255,255,0.3)'
      ]
    }];

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

    this.getCategoryInfo()
  }

;
  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedYear = new Date().getFullYear();
    this.getCategoryInfo();
  }

  getCategoryInfo(){

    let doughnutLabels = [];
    let doughnutData = [];
    this.categoryIds = [];

    let expensesSum = 0;
    this.dashboardService.getSpendingByDate(this.selectedMonth).subscribe((res)=>{
      for(let i in res) {
        doughnutLabels.push(res[i].name);
        doughnutData.push(res[i].spent_amount);
        this.categoryIds.push(res[i].id);
        expensesSum = expensesSum + res[i].spent_amount;
      }

      this.doughnutChartLabels = doughnutLabels;
      this.doughnutChartData = doughnutData;
      if(this.doughnutChartLabels.length > 0) {
        this.nameSingleCat = this.doughnutChartLabels[0];
        this.getSpendingsOnChartClick(this.categoryIds[0]);
      } else {
        this.spending$ = null;
        this.nameSingleCat = null;
      }
      this.expenses = expensesSum;
    });
  }

  // get information about spendings
  getSpendingsOnChartClick(id:number) {
    this.spending$ = this.dashboardService.getSpendingByExpenseId(id);
  }

  chartClicked(e: any): void {
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if ( activePoints.length > 0) {
        // get the internal index of slice in pie chart
        const clickedElementIndex = activePoints[0]._index;
        const label = chart.data.labels[clickedElementIndex];
        // get value by index
        const value = chart.data.datasets[0].data[clickedElementIndex];
        this.valueSingleCat = value;
        this.nameSingleCat = label;
        this.getSpendingsOnChartClick(this.categoryIds[clickedElementIndex])
      }
    }
  }

}
