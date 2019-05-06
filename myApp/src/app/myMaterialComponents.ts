import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';





import {NgModule} from '@angular/core';

@NgModule({
  imports: [MatButtonModule, MatCheckboxModule, MatSidenavModule, MatToolbarModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTabsModule],
  exports: [MatButtonModule, MatCheckboxModule, MatSidenavModule, MatToolbarModule, MatFormFieldModule, MatIconModule, MatInputModule, MatTabsModule],
})
export class MyOwnCustomMaterialModule { }
