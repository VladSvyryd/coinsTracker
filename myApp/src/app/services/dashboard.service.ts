import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {throwError} from "rxjs";
import {Account} from "../models/account";
import {catchError} from "rxjs/operators";
import {Income} from "../models/income";
import {Category} from "../models/category";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    server_path = "http://127.0.0.1:5000";


  constructor(private httpClient: HttpClient) { }


  //*************************ALL************************/

   getAll(path:string) {
    return this.httpClient.get(this.server_path + "/" + path);
  }


////*****************ACOUNTS**********************/


  createAccount(account:Account) {
    // let new_account:Account = {name: name, amount: amount, date: "",description: ""};
    let new_account:Account = {name: account.name, amount: account.amount};
    this.httpClient.post(this.server_path+"/account", new_account).pipe(
      catchError(this.handleError)
    ).subscribe();
  }

  deleteAccount(account:Account) {
    this.httpClient.delete(this.server_path+"/account/"+ account.id).pipe(
      catchError(this.handleError)
    ).subscribe();
  }

  //**************************INCOMES****************************/



createIncome(income:Income) {
    let new_income:Account = {name: income.name, amount: income.amount};
    this.httpClient.post(this.server_path+"/income", new_income).pipe(
      catchError(this.handleError)
    ).subscribe();
  }
deleteIncome(income:Income) {
    this.httpClient.delete(this.server_path+"/income/"+ income.id).pipe(
      catchError(this.handleError)
    ).subscribe();
  }



  //*****************************CATEGORIES******************************/


createCategory(category:Category) {
   // let new_CAtegory:Category = {name: category.name, amount: category.amount};
   // this.httpClient.post(this.server_path+"/category", new_category).pipe(
    //  catchError(this.handleError)
   // ).subscribe();
  }
deleteCategory(category:Category) {
    //this.httpClient.delete(this.server_path+"/category/"+ category.id).pipe(
    //  catchError(this.handleError)
    //).subscribe();
  }








































  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };
}
