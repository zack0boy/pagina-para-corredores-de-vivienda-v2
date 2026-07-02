import { TestBed } from '@angular/core/testing';

import { Propiedad } from './propiedad';

describe('Propiedad', () => {
  let service: Propiedad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Propiedad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
