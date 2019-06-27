import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {Observable, throwError} from 'rxjs';
import {Account} from "../models/account";
import {catchError} from "rxjs/operators";
import {Income} from "../models/income";
import {Expense} from "../models/expense";
import {Spending} from '../models/spending';
import {AccountTrack} from "../models/account-track";
import {IncomeTrack} from "../models/income-track";
import {User} from '../models/user';

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



//*****************ACCOUNTS**********************/

  createAccount(account:Account) {
    let new_account:Account = { name: account.name, amount: account.amount,icon:account.icon};
    console.log(new_account);
    return this.httpClient.post(this.server_path+"/account", new_account).pipe(
      catchError(this.handleError)
    );
  }

  deleteAccount(account:Account) {
    return this.httpClient.delete(this.server_path+"/account/"+ account.id).pipe(
      catchError(this.handleError)
    );
  }

  upgradeAccount(account:Account){
    let upgraded_account:Account = { name: account.name, amount: account.amount, description:account.description,icon:account.icon};
    return this.httpClient.put(this.server_path+"/account/"+ account.id, upgraded_account).pipe(
      catchError(this.handleError)
    )
  }


  //**************************INCOMES****************************/

  createIncome(income:Income) {
    let new_income:Income = { name: income.name, wanted_income: income.wanted_income, amount: income.amount,icon:income.icon};
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
    let upgraded_income:Income = { name: income.name, amount: income.amount, icon:income.icon};
    return this.httpClient.put(this.server_path+"/income/"+ income.id, upgraded_income).pipe(
      catchError(this.handleError)
    )
  }


  //*****************************EXPENSES******************************/

  createCategory(category:Expense) {
    let new_category:Expense = {name: category.name, description: category.description, wanted_limit: category.wanted_limit || 0, icon:category.icon};
    return this.httpClient.post(this.server_path+"/expense", new_category).pipe(
      catchError(this.handleError)
    )
  }

  deleteExpense(category:Expense) {
    this.httpClient.delete(this.server_path+"/expense/"+ category.id).pipe(
      catchError(this.handleError)
    ).subscribe();
  }

  createSpending(spending:Spending){
    let new_spending:Spending = {account_id:spending.account_id, amount: spending.amount, expense_id:spending.expense_id, description:spending.description};
    return this.httpClient.post(this.server_path+"/spending", new_spending).pipe(
      catchError(this.handleError)
    )
  }

  getSpendingByExpenseId(id:number):Observable<any[]>  {
    return this.httpClient.get<Spending[]>(this.server_path+"/spending/" + id).pipe(
      catchError(this.handleError)
    );
  }

  transaction_Inc_to_Acc(inc:Income, acc:Account,transaction_amount) {
    let {id,amount}: Income = inc;
    let destructedInc = {id,amount};
    let destructedAcc = {id: acc.id, amount:acc.amount}
    let transactionData = {inc: destructedInc,acc: destructedAcc,transaction_amount:transaction_amount};
    console.log(transactionData)
      return this.httpClient.put(this.server_path+"/inc_to_acc", transactionData).pipe(
      catchError(this.handleError)
    )
  }
  transaction_Acc_to_Acc(accFrom:Account, accTo: Account,transaction_amount){
    let transactionData = {accIdFrom: accFrom.id, accIdTo:accTo.id, transaction_amount}
      return this.httpClient.put(this.server_path+"/acc_to_acc", transactionData).pipe(
      catchError(this.handleError)
    )
  }


  
    //*****************************ACCOUNT/INCOME TRACK******************************/
   getAccountBalanceHistory():Observable<any[]>  {
    return this.httpClient.get<any[]>(this.server_path+"/account_balance").pipe(
      catchError(this.handleError)
    );
  }

  getIcomesAndExpensesByDate(date_range:number):Observable<any[]>  {
    return this.httpClient.get<any[]>(this.server_path+"/income_expense/"+date_range).pipe(
      catchError(this.handleError)
    );
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
