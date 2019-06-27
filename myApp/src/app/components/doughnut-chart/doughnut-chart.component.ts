import {Component, OnInit, AfterViewInit, Input} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import { MultiDataSet, Label} from 'ng2-charts';
import {Observable} from "rxjs";
import {Spending} from "../../models/spending";
import {DashboardService} from "../../services/dashboard.service";
import * as Chart from 'chart.js'


@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss']
})


export class DoughnutChartComponent implements OnInit, AfterViewInit {

  private spending$: Observable<Spending[]>;
  public categoryIds = [];
  public expenses = 0;  // variable to store expenses for all categories
  public spendingsData = [];
  public valueSingleCat;
  public nameSingleCat;

  public doughnutChartLabels: Label[] = [];
  public doughnutChartData: MultiDataSet = [];
  public doughnutChartType: ChartType = 'doughnut';

 public doughnutChartOptions: ChartOptions  = {
    cutoutPercentage: 70,


  };
  public doughnutChartDatasets: ChartDataSets[]  = [
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
      ],
      borderWidth: 1.5
    }];

  public isDoughnutChart : boolean;

  constructor(private dashboardService: DashboardService) {
    this.isDoughnutChart = true;

  }

  ngOnInit() {
    this.getCategoryInfo()
    this.isDoughnutChart = true;
  }

   getCategoryInfo(){
    let expensesSum = 0;
    this.dashboardService.getAll('expense').subscribe((res)=>{
      for(let i in res) {
        this.doughnutChartLabels.push(res[i].name)
        this.doughnutChartData.push(res[i].spent_amount)
        this.categoryIds.push(res[i].id)

        expensesSum = expensesSum + res[i].spent_amount;

      }
      this.nameSingleCat = this.doughnutChartLabels[0]
      this.getSpendingsOnChartClick(this.categoryIds[0])
      //this.doughnutChartOptions.elements.center.text = expensesSum;
      this.expenses = expensesSum;

    });
  }

    // get information about spendings
  getSpendingsOnChartClick(id:number) {
    let spendingArray = [];
    this.spending$ = this.dashboardService.getSpendingByExpenseId(id);
    this.spending$.forEach(spendings1 => {
      for(let i in spendings1){
      }
    });

    this.spendingsData = spendingArray;
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

  ngAfterViewInit() {
    let expensesSum = 0;
    this.dashboardService.getAll('expense').subscribe((res)=>{
      for(let i in res) {
        expensesSum = expensesSum + res[i].spent_amount;
      }
    });
    let visible = this.isDoughnutChart;
    Chart.pluginService.register({

      beforeDraw: function(chart) {

        if(visible) {
           let width = chart.canvas.width,
        height = chart.canvas.height,
        ctx = chart.ctx;

        ctx.restore();
        let fontSize = (height / 280).toFixed(2);
        ctx.font = fontSize + "em sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = 'center';
        ctx.fillStyle = '#05d1ff';

        let text = expensesSum.toString()+"€",

        textX = ((chart.chartArea.left + chart.chartArea.right) / 2),
        textY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

        ctx.fillText(text, textX, textY);
        ctx.save();
        }
      }
    })

  }

}
