import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {DialogData} from '../../models/dialog';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
export interface EditData {
  title:string,
  item:any
}

@Component({
  selector: 'app-edit-window',
  templateUrl: './edit-window.component.html',
  styleUrls: ['./edit-window.component.scss']
})
export class EditWindowComponent implements OnInit {
form: FormGroup;

  name = new FormControl('', [Validators.required]);
  amount = new FormControl('', [Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'), Validators.minLength(1)]); // regex for money value
  description = new FormControl();
  objectKeys= Object.keys;
  data: EditData;
  inputs;
  constructor(public dialogRef: MatDialogRef<EditWindowComponent>,
              @Inject(MAT_DIALOG_DATA) public recievedData: EditData, fb: FormBuilder) {
    this.data = recievedData;
     // separate fields of Object
    const { date, id, ...shortObject } = this.data.item;
    this.inputs = shortObject;
    this.form = fb.group({
      name: new FormControl('' + this.data.item.name,[Validators.required]),
      amount: new FormControl('' + this.data.item.amount,[Validators.required]),
    });

  }
  onNoClick(): void {
    this.dialogRef.close();

  }
sendData(){
    this.data.item.name = this.form.value.name;
    this.data.item.amount = this.form.value.amount;
    this.dialogRef.close(this.data.item);
}
  ngOnInit() {
  }

}
