import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationBottomComponent } from './navigation-bottom.component';

describe('NavigationBottomComponent', () => {
  let component: NavigationBottomComponent;
  let fixture: ComponentFixture<NavigationBottomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigationBottomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
