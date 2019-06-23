import { Component, OnInit,ElementRef, ViewChild } from '@angular/core';
import { ChartType } from 'chart.js';
import { MultiDataSet, Label } from 'ng2-charts';
import {Observable} from "rxjs";
import {Spending} from "../../models/spending";
import {DashboardService} from "../../services/dashboard.service";


@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements OnInit {

  private spending$: Observable<Spending[]>;
  public categoryIds = [];
  public expenses = 0;  // variable to store expenses for all categories
  public spendingsData = [];
  public valueSingleCat;
  public nameSingleCat;


  // Doughnut
  public doughnutChartLabels: Label[] = [];
  public doughnutChartData: MultiDataSet = [];
  public doughnutChartType: ChartType = 'doughnut';

 public doughnutChartOptions: any = {
    cutoutPercentage: 50,
    elements: {
      center: {
        text: 'Hello',
        fontColor: '#000',
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        fontSize: 24,
        fontStyle: 'normal'
      }
    }
  };
  public doughnutChartDatasets: any[] = [
    {
      options: this.doughnutChartOptions,
      backgroundColor: [
        "#24AEFC",
        "#43E0AA",
        "#935CCB",
        '#14143e',
        '#ff6e00',
        '#f0c800',
        '#00efab',
        '#05d1ff',
        '#841386',
        '#fff'
      ]
    }];



  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {

    this.getCategoryInfo();

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
      this.doughnutChartOptions.elements.center.text = expensesSum;
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
        this.valueSingleCat = value;
        this.nameSingleCat = label;
        this.getSpendingsOnChartClick(this.categoryIds[clickedElementIndex])
      }
    }
  }

}
