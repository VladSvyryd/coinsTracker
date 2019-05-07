import { Injectable } from '@angular/core';
import {HttpClient,  HttpHeaders} from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  token:Object;
  server_path = "http://127.0.0.1:5000";

  httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
  })
};
  constructor(private httpClient: HttpClient) { }
  login(email:string, password:string){

   this.httpOptions.headers.append('email', email );
   this.httpOptions.headers.append('password', password);

    this.httpClient.get(this.server_path + "/login", this.httpOptions).subscribe(data => {
      this.token  =  data as Object;
      console.log(this.token);
      this.saveToken(this.token)
    });


}
  saveToken(token){
    localStorage.setItem("userToken", token.token)
  }
  loadToken(){
    return localStorage.getItem("userToken");
  }
  public isAuthenticated(): boolean {
    // get the token
    const token = this.loadToken();
    // return a boolean reflecting
    // whether or not the token is expired
    return true;
  }

  getAllUsers(){
    this.httpClient.get(this.server_path + "/user").subscribe(data => {
      console.log(data);
    });
  }

  getAllAccounts() {
    this.httpClient.get(this.server_path + "/account").subscribe(data => {  return data });
  }
}
