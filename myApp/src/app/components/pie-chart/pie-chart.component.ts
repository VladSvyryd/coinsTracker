import { Component, OnInit } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import {SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color} from 'ng2-charts';
import {Observable} from "rxjs";
import {Expense} from "../../models/expense";
import {DashboardService} from "../../services/dashboard.service";
import {Spending} from "../../models/spending";

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  private categories$: Observable<Expense[]>;
  private spending$: Observable<Spending[]>;



  // Pie
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

  constructor(private dashboardService: DashboardService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }
chartColors(){
    return this.colors;
}
  ngOnInit() {
    // display data in pie chart
    let categoryNames = [];
    let categorySpendings = [];
    let expensesSum = 0;
    this.categories$ = this.dashboardService.getAll('expense');
    this.categories$.forEach(categories => {
      categories.forEach( category => {
        categoryNames.push(category.name);
        categorySpendings.push(category.spent_amount);

        expensesSum = expensesSum + category.spent_amount;
            console.log("2", expensesSum);

      });
      console.log(categories[0].name);
      console.log(categories);
      console.log(expensesSum);
      this.expenses = expensesSum;
    });


   this.pieChartLabels = categoryNames;
   this.pieChartData = categorySpendings;



   // get information about spendings
    let spendingInfo = {}, spendingArray = []
    this.spending$ = this.dashboardService.getAll('spending');
    this.spending$.forEach(spendings => {
      spendings.forEach(spending => {
        spendingArray.push(spending.amount);
      });

      console.log(spendingArray);

    });

    this.spendingsData = spendingArray;
  }

  getSingleDataSetInfo() {
    console.log("info");
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
    console.log("value", value);
    this.valueSingleCat = value;
    this.nameSingleCat = label;
    console.log(clickedElementIndex, label, value)
  }
 }
}
}

