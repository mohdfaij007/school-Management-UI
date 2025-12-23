import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeHeadFormComponent } from './fee-head-form.component';

describe('FeeHeadFormComponent', () => {
  let component: FeeHeadFormComponent;
  let fixture: ComponentFixture<FeeHeadFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeHeadFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeeHeadFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
