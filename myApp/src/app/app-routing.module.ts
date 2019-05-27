import { NgModule } from '@angular/core';
import { CanActivate, Routes, RouterModule } from '@angular/router';
import {ValidationComponent} from './components/validation/validation.component';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {OnlyLoggedInUsersGuard} from "./services/onlyLoggedInUsers.guard";
import {UpsComponent} from "./components/ups/ups.component";
import {PieChartComponent} from './components/pie-chart/pie-chart.component';



const routes: Routes = [
  { path: '', component: ValidationComponent},
  { path: 'dashboard', component: DashboardComponent,  canActivate: [OnlyLoggedInUsersGuard]},
  { path: 'pie-chart', component: PieChartComponent,  canActivate: [OnlyLoggedInUsersGuard]},
  { path: 'validation', component: ValidationComponent},
  { path: 'ups', component: UpsComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
