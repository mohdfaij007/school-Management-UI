import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyRegisterComponent } from './monthly-register.component';

describe('MonthlyRegisterComponent', () => {
  let component: MonthlyRegisterComponent;
  let fixture: ComponentFixture<MonthlyRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
