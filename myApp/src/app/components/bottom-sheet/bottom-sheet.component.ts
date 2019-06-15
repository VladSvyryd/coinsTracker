import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MAT_DIALOG_DATA, MatBottomSheetRef, MatDialogRef} from '@angular/material';
import {FormBuilder} from '@angular/forms';
import {Spending} from '../../models/spending';
import {Sort} from '@angular/material/sort';
@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent  {
  data:Spending[];
  sortedData: Spending[];

  constructor(public bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public recievedData: Array<any>) {
    this.data = recievedData
    console.log(this.data)
    if(this.data.length && this.data.length>0)this.sortedData = this.data.slice();
  }

  sortData(sort: Sort) {
    const data = this.data.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }


    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'description': return this.compare(a.description, b.description, isAsc);
        case 'amount': return this.compare(a.amount, b.amount, isAsc);
        case 'date': return this.compareDate(a.date, b.date, isAsc);
        default: return 0;
      }
    });
  }

   truncate(input, howShort) {
    if (input && input.length > howShort)
      return input.substring(0,howShort) + '...';
    else
      return input;
  };
   compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

   compareDate(date1: string, date2: string, isAsc: boolean) {
    return (<any>new Date(date1) < <any>new Date(date2)? -1: 1) * (isAsc ? 1: -1);
  }
}


