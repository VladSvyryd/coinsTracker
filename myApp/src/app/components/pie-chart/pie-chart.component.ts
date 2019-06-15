import { Component, OnInit } from '@angular/core';
import {ChartType, ChartOptions, ChartDataSets} from 'chart.js';
import {SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color} from 'ng2-charts';
import {Observable} from "rxjs";
import {Expense} from "../../models/expense";
import {DashboardService} from "../../services/dashboard.service";
import {Spending} from "../../models/spending";
import {Account} from "../../models/account";
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  private categories$: Observable<Expense[]>;
  private spending$: Observable<Spending[]>;
  private allSpending$: Observable<Spending[]>;
  private accounts$: Observable<Account[]>;

  //line chart
  public lineChartData: ChartDataSets[] = [
    { data: [], label: '' ,borderWidth:1.5},
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

  public allSpendingsData;


  // Pie chart
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label;
  public pieChartData: SingleDataSet;

  colors: Color[] = [{backgroundColor: ['green', 'blue', 'red', 'white'],borderColor: 'rgba(4,10,24,.4)'}];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public expenses = 0;  // variable to store expenses for all categories
  public spendingsData = [];
  public valueSingleCat;
  public nameSingleCat;
  public categoryIds;


  constructor(private dashboardService: DashboardService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }
chartColors(){
    return this.colors;
}
  ngOnInit() {
    // display data in pie chart

   this.accounts$ = this.dashboardService.getAll('account');
   this.accounts$.forEach(accounts =>{
     accounts.forEach(account => {
       console.log("account", account.amount);
     })
    });


   this.getCategoryInfo();
   this.getAllSpendings();
  }

  getCategoryInfo(){
    let categoryNames = [];
    let categorySpendings = [];
    let expensesSum = 0;
    let categoryIds = [];
    this.categories$ = this.dashboardService.getAll('expense');
    this.categories$.forEach(categories => {
      categories.forEach( category => {
        categoryNames.push(category.name);
        categorySpendings.push(category.spent_amount);
        categoryIds.push(category.id);

        expensesSum = expensesSum + category.spent_amount;
      });
      this.expenses = expensesSum;
      console.log(categoryIds, categoryNames);
    });

   this.pieChartLabels = categoryNames;
   this.pieChartData = categorySpendings;
   this.categoryIds = categoryIds;
  }

  //get all spending to show in account balance
  getAllSpendings(){
    let allSpendingsAmount = [];
    let allSpendingDate = [];
    this.allSpending$ = this.dashboardService.getAll('spending');
    this.allSpending$.forEach(spendingsAll => {
      for(let i in spendingsAll){

        allSpendingsAmount.push(spendingsAll[i].amount);
        allSpendingDate.push(this.transformDate(spendingsAll[i].date));
      }
    });

    this.lineChartData[0].data = allSpendingsAmount;
    this.lineChartLabels = allSpendingDate;
    console.log()

  }


  // get information about spendings
  getSpendingsOnChartClick(id:number) {
    let spendingArray = [];
    this.spending$ = this.dashboardService.getSpendingByCategoryId(id);
    this.spending$.forEach(spendings1 => {
      for(let i in spendings1){
        console.log("spendings1", spendings1[i]);
      }
    });

    this.spendingsData = spendingArray;
  }

  public chartClicked(e: any): void {
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if ( activePoints.length > 0) {
        // get the internal index of slice in pie chart
        const clickedElementIndex = activePoints[0]._index;
        const label = chart.data.labels[clickedElementIndex];
        // get value by index
        const value = chart.data.datasets[0].data[clickedElementIndex];
        //console.log("value", value);
        this.valueSingleCat = value;
        this.nameSingleCat = label;
        //console.log(clickedElementIndex, label, value);
        //console.log(this.categoryIds[clickedElementIndex]);
        this.getSpendingsOnChartClick(this.categoryIds[clickedElementIndex])
      }
    }
  }
transformDate(date) {
    return formatDate(date, 'dd-MM-yy','en');
  }
}

