import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthServiceService} from "../../services/auth-service.service";
import {Router} from "@angular/router";



@Component({
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss']
})
export class ValidationComponent implements OnInit {

  options: FormGroup;
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(5)]);
  name = new FormControl('', [Validators.required, Validators.minLength(2)]);
  hide = true;
  getEmailErrorMessage() {
    return this.email.hasError('required') ? 'You must enter a value' :
      this.email.hasError('email') ? 'Not a valid email' :
        '';
  }
  getPasswordErrorMessage() {
    return this.password.hasError('required') ? 'You must enter a value' :
      this.password.hasError('minlength') ? 'Not a valid password, at least 8 digits' :
        '';
  }
  constructor(fb: FormBuilder,private authService:AuthServiceService, private router: Router) {  this.options = fb.group({
    email: this.email,
    password: this.password,
    name: this.name
  }); }

  tryLogin(){
    this.authService.login(this.options.value.email,this.options.value.password);
    console.log(this.options.value.email)
    this.router.navigate(['/dashboard'])

  }


  ngOnInit() {
  }
}
