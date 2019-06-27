import {Component, OnInit} from '@angular/core';
import {ChartOptions, ChartDataSets} from 'chart.js';
import {Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, Color} from 'ng2-charts';
import {Observable} from "rxjs";
import {DashboardService} from "../../services/dashboard.service";
import {Spending} from "../../models/spending";
import { formatDate } from '@angular/common';
import {template} from "@angular/core/src/render3";

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})

export class PieChartComponent implements OnInit {
  private allSpending$: Observable<Spending[]>;

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


  constructor(private dashboardService: DashboardService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit() {
   this.getAllDataAboutIncomesAndExpenses();
  }


  getAllDataAboutIncomesAndExpenses(date_range=2) {

    let incomeMap = new Map();
    let expenseMap = new Map();

    let currentDate = Date.now();
    let oneDayOffset = 24 * 60 * 60 * 1000;
    for (let i=29; i>=0; i--) {
      let temp = this.transformDate(currentDate - i * oneDayOffset);
       incomeMap.set(temp, 0);
       expenseMap.set(temp, 0);
    }

    this.dashboardService.getIcomesAndExpensesByDate(date_range).subscribe((res:any)=> {
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
      //console.log("incomevalue", incomeValues)
      this.lineChartData[0].data = incomeValues;
      this.lineChartLabels = keys;

      let expenseValues = Array.from(expenseMap.values());
      this.lineChartData[1].data = expenseValues;

      console.log("map", incomeMap);

    })

  }


transformDate(date) {
    return formatDate(date, 'dd-MM','en');
  }
}

