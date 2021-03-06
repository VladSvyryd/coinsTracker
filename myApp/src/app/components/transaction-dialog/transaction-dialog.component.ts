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
  amount = new FormControl('', [Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$'), Validators.minLength(1)]);
  // regex for money value
  constructor(
    public dialogRef: MatDialogRef<TransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public received_data: any,
    private fb: FormBuilder
  ) {
    this.data = received_data;
    this.form = new FormGroup({
      amount: this.amount,
      description: new FormControl()
    });
  }

  ngOnInit() {}
  onNoClick(): void {
    this.dialogRef.close();
  }
  sendData() {
    this.dialogRef.close(this.form.value);
  }

  hasDescription() {
    return this.data.type_of_transaction === "acc_exp";
  }
  truncate(input) {
    if (input.length > 8)
      return input.substring(0,8) + '..';
    else
      return input;
  };
}
