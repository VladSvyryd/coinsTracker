import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';


@Component({
  selector: 'app-icon-picker',
  templateUrl: './icon-picker.component.html',
  styleUrls: ['./icon-picker.component.scss']
})
export class IconPickerComponent implements OnInit {
  icons = [
    {name: 'beer'},
    {name: 'book-open'},
    {name: 'building'},
    {name: 'car'},
    {name: 'clinic-medical'},
    {name: 'cocktail'},
    {name: 'coins'},
    {name: 'credit-card'},
    {name: 'dog'},
    {name: 'female'},
    {name: 'film'},
    {name: 'gamepad'},
    {name: 'gas-pump'},
    {name: 'gifts'},
    {name: 'hamburger'},
    {name: 'baby'},
    {name: 'heart'},
    {name: 'hotel'},
    {name: 'map-marked-alt'},
    {name: 'music'},
    {name: 'paw'},
    {name: 'percent'},
    {name: 'piggy-bank'},
    {name: 'pills'},
    {name: 'pizza-slice'},
    {name: 'plane'},
    {name: 'running'},
    {name: 'shopping-cart'},
    {name: 'skull-crossbones'},
    {name: 'star-regular'},
    {name: 'star'},
    {name: 'store'},
    {name: 'subway'},
    {name: 'theater-masks'},
    {name: 'tools'},
    {name: 'tshirt'},
    {name: 'umbrella-beach'},
    {name: 'university'},
    {name: 'users'},
    {name: 'utensils'},
    {name: 'wallet'},
    {name: 'flushed'},
    {name: 'frown'},
    {name: 'dragon'},
    {name: 'stack-overflow'},
    {name: 'users'},
    {name: 'gem'},
    {name: 'ghost'},
    {name: 'hashtag'},
    {name: 'infinity'},
  ];

  @Output() iconName: EventEmitter<String> = new EventEmitter();
  selectedValue:string;
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    this.icons.forEach((item)=>{
      let path = 'assets/img/fa-icons/'+item.name +'-solid.svg'
      iconRegistry.addSvgIcon(
        item.name,
        sanitizer.bypassSecurityTrustResourceUrl(path));
    })
  }

  ngOnInit() {
  }

  updateIcon(name:string){
    this.iconName.emit(name);
  }

}
