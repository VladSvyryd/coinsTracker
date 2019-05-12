import { Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {throwError} from "rxjs";
import {catchError} from "rxjs/operators";
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
        "Access-Control-Allow-Origin" : "true",
        "email" : email,
        "password" : password
      })
    };

    this.httpClient.get(this.server_path + "/login", httpOptions).subscribe(data => {
      this.token = data as Object;
      this.saveToken(this.token)
    });


  }

  saveToken(token) {
    localStorage.setItem("userToken", token.token)
  }

  loadToken() {
    if(localStorage.getItem("userToken") != null){
      return localStorage.getItem("userToken");
    }
    return false
  }


  public isAuthenticated(): boolean {
    // get the token
    const token = this.loadToken();
    // return a boolean reflecting
    // whether or not the token is expired
    return true;
  }


  register(email: string, password: string, name:string){
    let httpOptions = {
      headers: new HttpHeaders({
        'password' : password
      })
    };

    let body = { "name" : name,"email":email};

   return this.httpClient.post(this.server_path+"/user_signUp", body, httpOptions).pipe(
      catchError(this.handleError)
    );
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

}





import {User} from "../models/user";

