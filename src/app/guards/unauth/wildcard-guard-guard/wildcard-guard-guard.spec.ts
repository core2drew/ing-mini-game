import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { wildcardGuardGuard } from './wildcard-guard-guard';

describe('wildcardGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => wildcardGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
