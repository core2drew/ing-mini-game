import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteScreen } from './complete-screen';

describe('CompleteScreen', () => {
  let component: CompleteScreen;
  let fixture: ComponentFixture<CompleteScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(CompleteScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
