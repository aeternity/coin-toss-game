import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinflipperComponent } from './coinflipper.component';

describe('CoinflipperComponent', () => {
  let component: CoinflipperComponent;
  let fixture: ComponentFixture<CoinflipperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinflipperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinflipperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
