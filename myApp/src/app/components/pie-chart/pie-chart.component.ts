import { Component, OnInit } from '@angular/core';
import { ChartType, ChartOptions } from 'chart.js';
import {SingleDataSet, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color} from 'ng2-charts';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {
  // Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [['Income'], ['Account'], 'Expenses'];
  public pieChartData: SingleDataSet = [300, 500, 100];
  colors2: Color[] = [{
    backgroundColor:'rgba(2, 2, 2, 1)',
    borderColor: 'rgba(225,10,24,0.2)',
    pointBackgroundColor: 'rgba(225,10,24,0.2)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(225,10,24,0.2)'},

  ];
  colors: Color[] = [{backgroundColor: ['green', 'blue', 'white'],borderColor: 'rgba(4,10,24,.4)'}];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  constructor() {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }
chartColors(){
    return this.colors;
}
  ngOnInit() {
  }

}
