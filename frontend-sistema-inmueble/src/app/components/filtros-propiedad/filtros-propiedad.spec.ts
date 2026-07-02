import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosPropiedad } from './filtros-propiedad';

describe('FiltrosPropiedad', () => {
  let component: FiltrosPropiedad;
  let fixture: ComponentFixture<FiltrosPropiedad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltrosPropiedad],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltrosPropiedad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
