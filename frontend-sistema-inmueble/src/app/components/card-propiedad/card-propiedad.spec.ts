import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPropiedad } from './card-propiedad';

describe('CardPropiedad', () => {
  let component: CardPropiedad;
  let fixture: ComponentFixture<CardPropiedad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPropiedad],
    }).compileComponents();

    fixture = TestBed.createComponent(CardPropiedad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
