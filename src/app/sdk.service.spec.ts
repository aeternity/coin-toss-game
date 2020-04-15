import { TestBed } from '@angular/core/testing';

import { SdkService } from './sdk.service';

describe('SdkService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SdkService = TestBed.get(SdkService);
    expect(service).toBeTruthy();
  });
});
