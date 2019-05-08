import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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


@NgModule({
  declarations: [
    AppComponent,
    ValidationComponent,
    DashboardComponent,
    PlaceholderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MyOwnCustomMaterialModule,
    ReactiveFormsModule
  ],
  providers: [ {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }
