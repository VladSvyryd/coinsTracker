import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from 'rxjs';
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

   getAll(path:string):Observable<any[]> {
    return this.httpClient.get<any[]>(this.server_path + "/" + path);
  }

  getSum(path:string): Observable<number>{
    return this.httpClient.get<number>(this.server_path + "/" + path + '_sum');
  }

////*****************ACOUNTS**********************/


  createAccount(account:Account) {
    let new_account:Account = { name: account.name, amount: account.amount};
    return this.httpClient.post(this.server_path+"/account", new_account).pipe(
      catchError(this.handleError)
    );
  }

  deleteAccount(account:Account) {
    return this.httpClient.delete(this.server_path+"/account/"+ account.id).pipe(
      catchError(this.handleError)
    );
  }

  //**************************INCOMES****************************/



createIncome(income:Income) {
    let new_income:Income = { name: income.name, wanted_income: income.wanted_income, amount: income.amount};
   return this.httpClient.post(this.server_path+"/income", new_income).pipe(
      catchError(this.handleError)
    );
  }
deleteIncome(income:Income) {
   return this.httpClient.delete(this.server_path+"/income/"+ income.id).pipe(
      catchError(this.handleError)
    );
  }
upgradeIncome(income:Income){
    let upgraded_income:Income = { name: income.name, amount: income.amount};
    return this.httpClient.put(this.server_path+"/income/"+ income.id, upgraded_income).pipe(
      catchError(this.handleError)
    )
}


  //*****************************CATEGORIES******************************/


createCategory(category:Category) {
    let new_category:Category = {name: category.name, description: category.description, wanted_limit: category.wanted_limit || 0};
    return this.httpClient.post(this.server_path+"/category", new_category).pipe(
      catchError(this.handleError)
    )
  }
deleteCategory(category:Category) {
    this.httpClient.delete(this.server_path+"/category/"+ category.id).pipe(
      catchError(this.handleError)
    ).subscribe();
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
