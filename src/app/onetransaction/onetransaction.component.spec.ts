import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnetransactionComponent } from './onetransaction.component';

describe('OnetransactionComponent', () => {
  let component: OnetransactionComponent;
  let fixture: ComponentFixture<OnetransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnetransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnetransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
