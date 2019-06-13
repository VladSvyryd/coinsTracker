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


  // get information about spendings
  getSpendingsFromChartClick(id:number) {
    let spendingArray = [];
    this.spending$ = this.dashboardService.getSpendingByCategory(id);
    this.spending$.forEach(spendings1 => {
      for(let i in spendings1){
        console.log(spendings1[i]);
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
        console.log(clickedElementIndex, label, value);
        console.log(this.categoryIds[clickedElementIndex]);

        this.getSpendingsFromChartClick(this.categoryIds[clickedElementIndex])
      }
    }
  }


}

