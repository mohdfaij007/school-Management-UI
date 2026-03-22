import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeDailyReportComponent } from './fee-daily-report.component';

describe('FeeDailyReportComponent', () => {
  let component: FeeDailyReportComponent;
  let fixture: ComponentFixture<FeeDailyReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeDailyReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeeDailyReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
