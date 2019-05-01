import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'svyb';
 serverData: JSON;
  employeeData: JSON;
  users: JSON;
  readonly ROOT_URL= 'http://127.0.0.1:5000/'

  constructor(private httpClient: HttpClient){
  }
getEmployees(){
    this.httpClient.get('http://127.0.0.1:5000/employees').subscribe(data => {
      this.employeeData  = data as JSON;
      console.log(this.employeeData);
    })
  }
  getUsers(){
    this.httpClient.get('http://127.0.0.1:5000/users').subscribe(data => {
      this.users  = data as JSON;
      console.log(this.users);
    })
  }
}
