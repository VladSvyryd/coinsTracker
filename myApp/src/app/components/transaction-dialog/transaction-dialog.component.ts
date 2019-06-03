import { Component, Inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

@Component({
  selector: "app-transaction-dialog",
  templateUrl: "./transaction-dialog.component.html",
  styleUrls: ["./transaction-dialog.component.scss"]
})
export class TransactionDialogComponent implements OnInit {
  data: any;
  form: FormGroup;

  // regex for money value
  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public received_data: any,
    private fb: FormBuilder
  ) {
    this.data = received_data;

  }

  ngOnInit() {

  }
  onNoClick(): void {
    this.dialogRef.close();
  }
   sendData(){
    this.dialogRef.close();
  }
}
