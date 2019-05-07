import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ValidationComponent} from './components/validation/validation.component';
import {DashboardComponent} from "./components/dashboard/dashboard.component";


const routes: Routes = [
  { path: '', component: ValidationComponent},
  { path: 'dashboard', component: DashboardComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
