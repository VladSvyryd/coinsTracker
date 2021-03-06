import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MyOwnCustomMaterialModule } from './myMaterialComponents';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ValidationComponent } from './components/validation/validation.component';
import {ReactiveFormsModule} from "@angular/forms";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './services/token.interceptor';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';
import { DialogWindowComponent } from './components/dialog-window/dialog-window.component';
import {MAT_DIALOG_DEFAULT_OPTIONS, MAT_BOTTOM_SHEET_DEFAULT_OPTIONS} from "@angular/material";
import { UpsComponent } from './components/ups/ups.component';
import { EditWindowComponent } from './components/edit-window/edit-window.component';
import { CounterComponent } from './components/counter/counter.component';
import { CircleMenuComponent } from './components/circle-menu/circle-menu.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { ChartsModule } from 'ng2-charts';
import { TesterComponent } from './tester/tester.component';
import { CoinComponent } from './components/coin/coin.component';
import { TransactionDialogComponent } from './components/transaction-dialog/transaction-dialog.component';
import { BottomSheetComponent } from './components/bottom-sheet/bottom-sheet.component';
import { NavigationBottomComponent } from './components/navigation-bottom/navigation-bottom.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { NavigationVerticalComponent } from './components/navigation-vertical/navigation-vertical.component';
import { IconPickerComponent } from './components/icon-picker/icon-picker.component';
import { DoughnutChartComponent } from './components/doughnut-chart/doughnut-chart.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AccountBalanceComponent } from './components/account-balance/account-balance.component';

@NgModule({
  declarations: [
    AppComponent,
    ValidationComponent,
    DashboardComponent,
    PlaceholderComponent,
    DialogWindowComponent,
    UpsComponent,
    EditWindowComponent,
    CounterComponent,
    CircleMenuComponent,
    PieChartComponent,
    TesterComponent,
    CoinComponent,
    TransactionDialogComponent,
    BottomSheetComponent,
    NavigationBottomComponent,
    LineChartComponent,
    NavigationVerticalComponent,
    IconPickerComponent,
    DoughnutChartComponent,
    SettingsComponent,
    AccountBalanceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MyOwnCustomMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    ChartsModule,

  ],
   entryComponents: [
    DialogWindowComponent,EditWindowComponent,TransactionDialogComponent,BottomSheetComponent,SettingsComponent
  ],
  providers: [ {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true
  },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {hasBackdrop: true}
    }
    ,
    {
       provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS,
      useValue: {hasBackdrop: true}
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
