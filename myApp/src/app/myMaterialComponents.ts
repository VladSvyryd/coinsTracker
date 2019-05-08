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








import {NgModule} from '@angular/core';

@NgModule({
  imports: [MatChipsModule, MatSlideToggleModule, MatListModule, MatButtonModule, MatCheckboxModule, MatSidenavModule, MatToolbarModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTabsModule, MatDividerModule],
  exports: [MatChipsModule, MatSlideToggleModule, MatListModule, MatButtonModule, MatCheckboxModule, MatSidenavModule, MatToolbarModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTabsModule, MatDividerModule],
})
export class MyOwnCustomMaterialModule { }
