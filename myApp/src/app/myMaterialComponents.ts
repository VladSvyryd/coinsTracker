import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatChipsModule} from '@angular/material/chips';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';



import {NgModule} from '@angular/core';

@NgModule({
  imports: [MatDialogModule, MatSnackBarModule, MatChipsModule, MatSlideToggleModule, MatListModule, MatButtonModule, MatCheckboxModule, MatSidenavModule, MatToolbarModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTabsModule, MatDividerModule, MatGridListModule],
  exports: [MatDialogModule, MatSnackBarModule, MatChipsModule, MatSlideToggleModule, MatListModule, MatButtonModule, MatCheckboxModule, MatSidenavModule, MatToolbarModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTabsModule, MatDividerModule, MatGridListModule],
})
export class MyOwnCustomMaterialModule { }
