import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthServiceService} from "../../services/auth-service.service";
import {Router} from "@angular/router";
import {MatTabGroup, MatSnackBar} from "@angular/material";



@Component({
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.scss']
})
export class ValidationComponent implements OnInit {
@ViewChild(MatTabGroup)
  matTabGroup: MatTabGroup;
 durationOfNotificationsInSeconds = 5;

  options: FormGroup;
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(5)]);
  name = new FormControl('', [Validators.required, Validators.minLength(2)]);
  hide = true;

  constructor(fb: FormBuilder,private authService:AuthServiceService, private router: Router,private snackBar: MatSnackBar) {  this.options = fb.group({
    email: this.email,
    password: this.password,
    name: this.name


  }); }

   openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 5000,
    });
  }

 goToLoginTab(){
    this.matTabGroup.selectedIndex = 0;
  }
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
  tryLogin(){
    this.authService.login(this.options.value.email,this.options.value.password);
    this.router.navigate(['/dashboard'])

  }

  tryRegister(){
    this.authService.register(this.options.value.email, this.options.value.password, this.options.value.name);
    this.goToLoginTab();
    this.openSnackBar("Ok!! Here you go, now Log In", "X");
  }

  ngOnInit() {
  }
}
