import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeStructureFormComponent } from './fee-structure-form.component';

describe('FeeStructureFormComponent', () => {
  let component: FeeStructureFormComponent;
  let fixture: ComponentFixture<FeeStructureFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeStructureFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeeStructureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
