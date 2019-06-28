import {Component, OnInit} from '@angular/core';
import * as Chart from 'chart.js';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Label, MultiDataSet} from 'ng2-charts';
import {Observable} from 'rxjs';
import {Spending} from '../../models/spending';
import {DashboardService} from '../../services/dashboard.service';


@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss']
})


export class DoughnutChartComponent implements OnInit {

  private spending$: Observable<Spending[]>;
  public categoryIds = [];
  public static expenses = 0;  // variable to store expenses for all categories
  public valueSingleCat;
  public nameSingleCat;

  public doughnutChartLabels: Label[] = [];
  public doughnutChartData: MultiDataSet = [];
  public doughnutChartType: ChartType = 'doughnut';
  public plugin = {

    afterDraw: function(chart) {

      let width = chart.canvas.width,
        height = chart.canvas.height,
        ctx = chart.ctx;

      ctx.restore();
      let fontSize = (height / 250).toFixed(2);
      ctx.font = fontSize + "em sans-serif";
      ctx.textBaseline = "middle";
      ctx.textAlign = 'center';
      ctx.fillStyle = '#05d1ff';

      let text = DoughnutChartComponent.expenses + "€",

        textX = ((chart.chartArea.left + chart.chartArea.right) / 2),
        textY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

      ctx.fillText(text, textX, textY);
      ctx.save();
    }
  };
  public doughnutChartOptions: ChartOptions = {
    cutoutPercentage: 70,
    plugins:
    this.plugin

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


  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.getCategoryInfo();
  }

  getCategoryInfo(){
    let expensesSum = 0;
    this.dashboardService.getAll('expense').subscribe((res)=>{
      for(let i in res) {
        this.doughnutChartLabels.push(res[i].name);
        this.doughnutChartData.push(res[i].spent_amount);
        this.categoryIds.push(res[i].id);

        expensesSum = expensesSum + res[i].spent_amount;

      }
      this.nameSingleCat = this.doughnutChartLabels[0];
      this.getSpendingsOnChartClick(this.categoryIds[0]);
      DoughnutChartComponent.expenses = expensesSum;
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



  ngOnDestroy() {
    Chart.pluginService.unregister(this.plugin)
  }

}
