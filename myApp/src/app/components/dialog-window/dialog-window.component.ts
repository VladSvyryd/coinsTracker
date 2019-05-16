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
  name = new FormControl('', [Validators.required]);
  amount = new FormControl('', [Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'), Validators.minLength(1)]); // regex for money value
  inputFields:DialogData[];
  title;
  constructor(public dialogRef: MatDialogRef<DialogWindowComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Array<any>, fb: FormBuilder) {
    this.title = data.shift()
    this.inputFields = data;
    this.inputFields.forEach(function (element, index) {

    });
    this.form = fb.group({

    amount: this.amount,
    name: this.name
  });
  }
  onNoClick(): void {
    this.dialogRef.close();

  }


  ngOnInit() {
  }

}
