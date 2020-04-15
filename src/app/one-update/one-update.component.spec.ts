import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OneUpdateComponent } from './one-update.component';

describe('OneUpdateComponent', () => {
  let component: OneUpdateComponent;
  let fixture: ComponentFixture<OneUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OneUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
