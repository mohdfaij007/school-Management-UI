import { TestBed } from '@angular/core/testing';

import { MasterSetupService } from './master-setup.service';

describe('MasterSetupService', () => {
  let service: MasterSetupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterSetupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
