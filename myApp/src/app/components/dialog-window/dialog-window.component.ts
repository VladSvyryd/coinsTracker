import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {DialogData} from "../../models/dialog";

@Component({
  selector: 'app-dialog-window',
  templateUrl: './dialog-window.component.html',
  styleUrls: ['./dialog-window.component.scss']
})
export class DialogWindowComponent implements OnInit {
  form: FormGroup;
  standardIcons = ['star-regular','dragon','gem','star','hashtag', 'coins','infinity', 'ghost'];
  amount = new FormControl('', [Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'), Validators.minLength(1)]); // regex for money value
  name = new FormControl('', [Validators.required]);
  description = new FormControl();
  inputFields:DialogData[];
  icon;
  title;
  constructor(public dialogRef: MatDialogRef<DialogWindowComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Array<any>, fb: FormBuilder) {
    this.title = data.shift()
    this.inputFields = data;
    console.log(this.inputFields)
    this.form = fb.group({
      amount: this.amount,
      name: this.name,
      description: this.description,
      icon:new FormControl()
    });

  }
  onNoClick(): void {
    this.dialogRef.close();
  }


  ngOnInit() {
  }
    sendData(){
    let icon  =  this.form.value.icon !== null  ? this.form.value.icon : this.pickRandomIcon();
    let result = {
      name: this.form.value.name,
      amount:this.form.value.amount,
      description:this.form.value.description,
      icon: icon
    }
    this.dialogRef.close(result);
  }
  addToForm(e) {
    console.log(e)
    this.form.value.icon = e;
  }

  pickRandomIcon():string{
    return this.standardIcons[this.getRandomInt(this.standardIcons.length)];
  }
  getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
}
