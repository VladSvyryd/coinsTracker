import { Injectable } from '@angular/core';
import {HttpClient,  HttpHeaders} from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  token:string;
  server_path = "http://127.0.0.1:5000";

  httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': 'my-auth-token'
  })
};
  constructor(private httpClient: HttpClient) { }
  login(email:string, password:string){

   this.httpOptions.headers = this.httpOptions.headers.append('email', email );
   this.httpOptions.headers = this.httpOptions.headers.append('password', password);

    this.httpClient.get(this.server_path + "/login", this.httpOptions).subscribe(data => {
      this.token  = data as string;
      console.log(this.token);
    });
  }

  saveToken(){
    localStorage.setItem("userToken", this.token)
  }
  loadToken(){
    return localStorage.getItem("userToken") ? localStorage.getItem("userToken"): false;
  }
}
