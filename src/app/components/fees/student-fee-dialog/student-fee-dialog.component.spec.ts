import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFeeDialogComponent } from './student-fee-dialog.component';

describe('StudentFeeDialogComponent', () => {
  let component: StudentFeeDialogComponent;
  let fixture: ComponentFixture<StudentFeeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFeeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFeeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
