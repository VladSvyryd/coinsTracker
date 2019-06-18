import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {Icons} from '../../models/icons';


@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss']
})
export class IconPickerComponent implements OnInit {


  @Output() iconName: EventEmitter<String> = new EventEmitter();
  selectedValue:string;
  icons = Icons;
    @Input()
  iconToEdit:String;
  constructor() {

  }

  ngOnInit() {
  }

  updateIcon(name:string){
    this.iconName.emit(name);
  }

}
