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

 // name = new FormControl('', [Validators.required]);
 // amount = new FormControl('', [Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'), Validators.minLength(1)]); // regex for money value
  description = new FormControl();
  data: EditData;
  inputs;
  max;
  value;
  constructor(public dialogRef: MatDialogRef<EditWindowComponent>,
              @Inject(MAT_DIALOG_DATA) public recievedData: EditData, fb: FormBuilder) {
    this.data = recievedData;
    // separate fields of Object
    const { date, id, ...shortObject } = this.data.item;
    this.inputs = shortObject;
    this.form = fb.group({
      name: new FormControl('' + this.data.item.name,[Validators.required]),
      amount: new FormControl('' + this.data.item.amount,[Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'), Validators.minLength(1)]),
      description: new FormControl(String(this.data.item.description) || '')
    });

  }
  onNoClick(): void {
    this.dialogRef.close();

  }
  checkIfAmount(str:string){
    if(str == "amount"){
      return true
    }
    return false;
  }
  sendData(){
    this.data.item.name = this.form.value.name;
    this.data.item.amount = this.form.value.amount;
    this.data.item.description = this.form.value.description;
    this.dialogRef.close(this.data.item);
  }
  ngOnInit() {
    this.setMaximum()

  }
  setMaximum(){
    return this.max = parseInt(this.form.value.amount )+ 1000;
  }
  formatLabel(value: number | null) {
    if (!value) {
      return 0;
    }

    if (value >= 5000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }
}
