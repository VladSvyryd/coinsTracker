import { Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Account } from "../models/account";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {User} from "../models/user";





@Injectable({
  providedIn: 'root'
})

export class AuthServiceService {
  token: Object;

  server_path = "http://127.0.0.1:5000";


  constructor(private httpClient: HttpClient) {
  }

  login(email: string, password: string) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    httpOptions.headers.append('email', email);
    httpOptions.headers.append('password', password);

    this.httpClient.get(this.server_path + "/login", httpOptions).subscribe(data => {
      this.token = data as Object;
      console.log(this.token);
      this.saveToken(this.token)
    });


  }

  saveToken(token) {
    localStorage.setItem("userToken", token.token)
  }

  loadToken() {
    return localStorage.getItem("userToken");
  }

  public isAuthenticated(): boolean {
    // get the token
    const token = this.loadToken();
    // return a boolean reflecting
    // whether or not the token is expired
    return true;
  }

  getAllUsers() {
    this.httpClient.get(this.server_path + "/user").subscribe(data => {
      console.log(data);
    });
  }

  getAllAccounts() {
    return this.httpClient.get(this.server_path + "/account");
  }

  register(email: string, password: string, name:string){
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    httpOptions.headers.append('password', password);

    let body = new HttpParams().set("name" ,name).set("password" ,email);

    this.httpClient.post(this.server_path+"/user_signUp", body.toString(), httpOptions).pipe(
      catchError(this.handleError)
    ).subscribe();;
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    // this.currentUserSubject.next(null);
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

  createAccount(account:Account) {
    // let new_account:Account = {name: name, amount: amount, date: "",description: ""};
    let new_account = {name: account.name, amount: account.amount};
    this.httpClient.post(this.server_path+"/account", new_account).pipe(
      catchError(this.handleError)
    ).subscribe();
  }

  deleteAccount(account:Account) {
    account.id
    this.httpClient.delete(this.server_path+"/account/"+ account.id).pipe(
      catchError(this.handleError)
    ).subscribe();
  }
}

