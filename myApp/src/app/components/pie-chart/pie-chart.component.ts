import { Component, OnInit } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import {SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color} from 'ng2-charts';
import {Observable} from "rxjs";
import {Expense} from "../../models/expense";
import {DashboardService} from "../../services/dashboard.service";

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  private categories$: Observable<Expense[]>;


  // Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label;
  public pieChartData: SingleDataSet;
  colors2: Color[] = [{
    backgroundColor:['green', 'blue', 'red', 'white'],
    borderColor: 'rgba(225,10,24,0.2)',
    pointBackgroundColor: 'rgba(225,10,24,0.2)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(225,255,24,0.2)'}
  ];
  colors: Color[] = [{backgroundColor: ['green', 'blue', 'red', 'white'],borderColor: 'rgba(4,10,24,.4)'}];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public expenses = 0;

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
            console.log("1", category.spent_amount);

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


  }
}

