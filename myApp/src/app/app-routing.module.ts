import { NgModule } from '@angular/core';
import { CanActivate, Routes, RouterModule } from '@angular/router';
import {ValidationComponent} from './components/validation/validation.component';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {OnlyLoggedInUsersGuard} from "./services/onlyLoggedInUsers.guard";
import {UpsComponent} from "./components/ups/ups.component";
import {PieChartComponent} from './components/pie-chart/pie-chart.component';
import {TesterComponent} from './tester/tester.component';
import {LineChartComponent} from "./components/line-chart/line-chart.component";
import {DoughnutChartComponent} from './components/doughnut-chart/doughnut-chart.component';
import {SettingsComponent} from './components/settings/settings.component';
import {AccountBalanceComponent} from "./components/account-balance/account-balance.component";


const routes: Routes = [
  { path: '', component: ValidationComponent},
  { path: 'dashboard', component: DashboardComponent,  canActivate: [OnlyLoggedInUsersGuard]},
  { path: 'pie-chart', component: PieChartComponent,  canActivate: [OnlyLoggedInUsersGuard]},
  { path: 'account-balance', component: AccountBalanceComponent},
  { path: 'validation', component: ValidationComponent},
  { path: 'tester', component: TesterComponent},
  { path: 'settings', component: SettingsComponent},
  { path: 'doughnut-chart', component: DoughnutChartComponent},
  { path: 'ups', component: UpsComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
