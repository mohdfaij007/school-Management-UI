import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeHeadReportComponent } from './fee-head-report.component';

describe('FeeHeadReportComponent', () => {
  let component: FeeHeadReportComponent;
  let fixture: ComponentFixture<FeeHeadReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeHeadReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeeHeadReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
