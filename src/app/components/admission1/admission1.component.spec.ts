import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Admission1Component } from './admission1.component';

describe('Admission1Component', () => {
  let component: Admission1Component;
  let fixture: ComponentFixture<Admission1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admission1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Admission1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
