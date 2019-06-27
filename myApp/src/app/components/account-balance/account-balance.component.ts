import {Component, OnInit} from '@angular/core';
import {ChartOptions} from 'chart.js';
import {Label, Color} from 'ng2-charts';
import {DashboardService} from "../../services/dashboard.service";
import {formatDate} from "@angular/common";

@Component({
  selector: 'app-account-balance',
  templateUrl: './account-balance.component.html',
  styleUrls: ['./account-balance.component.scss']
})

export class AccountBalanceComponent implements OnInit {

  public accountHistory = [];

  public lineChartData = [
    { data: [], label: 'Account balance', borderWidth:1.5},
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
          ticks: {
           // stepSize : 50,
            beginAtZero: true,
          }
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

  constructor (private dashService:DashboardService, private dashboardService: DashboardService) { }


  ngOnInit() {
    this.getAccountHistory();
  }

  getAccountHistory() {
    this.dashboardService.getAccountBalanceHistory().subscribe((res:any)=>{
      this.accountHistory = res;

      for(let i=0; i<res.length; i++) {
        this.lineChartLabels.push(this.transformDate(res[i].date));
        this.lineChartData[0].data.push(res[i].account_balance)
      }
    })
  }
  transformDate(date) {
    return formatDate(date, 'dd-MM','en');
  }

}


