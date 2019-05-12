import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-dialog-window',
  templateUrl: './dialog-window.component.html',
  styleUrls: ['./dialog-window.component.scss']
})
export class DialogWindowComponent implements OnInit {
  options: FormGroup;
  amount = new FormControl();
  constructor(public dialogRef: MatDialogRef<DialogWindowComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any, fb: FormBuilder) {
    this.options = fb.group({
      amount: this.amount
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
