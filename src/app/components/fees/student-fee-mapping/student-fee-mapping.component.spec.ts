import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentFeeMappingComponent } from './student-fee-mapping.component';

describe('StudentFeeMappingComponent', () => {
  let component: StudentFeeMappingComponent;
  let fixture: ComponentFixture<StudentFeeMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentFeeMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentFeeMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
