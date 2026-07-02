import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Propiedades } from './propiedades';

describe('Propiedades', () => {
  let component: Propiedades;
  let fixture: ComponentFixture<Propiedades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Propiedades],
    }).compileComponents();

    fixture = TestBed.createComponent(Propiedades);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
