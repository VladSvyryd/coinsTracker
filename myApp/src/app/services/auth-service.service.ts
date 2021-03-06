import { Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import * as jwt_decode from 'jwt-decode';




import {User} from "../models/user";
import {Router} from '@angular/router';
@Injectable({
  providedIn: 'root'
})

export class AuthServiceService {
  token: Object;
  server_path = "http://127.0.0.1:5000";


  constructor(private httpClient: HttpClient,private router: Router) {
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
      if(this.getUserFromLocalStorage() === null){
      let newUser:User = {email:email, dark_theme: false,fixedLayout:false,coinsNamesOn:true}
          this.setNewUser(newUser);
      }
      this.router.navigate(['/dashboard']);
    });


  }

  saveToken(token) {
    localStorage.setItem("userToken", token.token)
  }

  getToken() {
      return localStorage.getItem("userToken");
  }
 getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) return null;

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }
   isTokenExpired(token?: string): boolean {
    if(!token) token = this.getToken();
    if(!token) return true;

    const date = this.getTokenExpirationDate(token);
    if(date === undefined) return false;
    return !(date.valueOf() > new Date().valueOf());
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
    localStorage.removeItem('userToken');
    localStorage.removeItem('userProfile');
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

 setNewUser(user:User){
   console.log("set_new_cur_user", user);
   localStorage.setItem("userProfile", JSON.stringify(user))
  }
  getUserFromLocalStorage(){
    return JSON.parse(localStorage.getItem("userProfile"));
  }

}

