import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';
import {AuthServiceService} from '../../services/auth-service.service';
import {Router} from "@angular/router";


@Component({
  selector: 'app-circle-menu',
  templateUrl: './circle-menu.component.html',
  styleUrls: ['./circle-menu.component.scss']
})
export class CircleMenuComponent implements OnInit {

  @ViewChild("toggleButton") toggleButton: ElementRef;
  constructor(private router:Router, private authService : AuthServiceService) { }

  ngOnInit() {
  }
 tryLogout(){
    this.authService.logout();
    this.router.navigate(['/validation'])

  }
  toggleMenu(){
    document.getElementById('circularMenu').classList.toggle('active');
  }
}
