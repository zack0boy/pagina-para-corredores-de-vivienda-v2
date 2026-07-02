import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recuperacionpassword } from './recuperacionpassword';

describe('Recuperacionpassword', () => {
  let component: Recuperacionpassword;
  let fixture: ComponentFixture<Recuperacionpassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recuperacionpassword],
    }).compileComponents();

    fixture = TestBed.createComponent(Recuperacionpassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
