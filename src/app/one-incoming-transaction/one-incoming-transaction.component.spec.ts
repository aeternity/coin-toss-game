import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OneIncomingTransactionComponent } from './one-incoming-transaction.component';

describe('OneIncomingTransactionComponent', () => {
  let component: OneIncomingTransactionComponent;
  let fixture: ComponentFixture<OneIncomingTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OneIncomingTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneIncomingTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
