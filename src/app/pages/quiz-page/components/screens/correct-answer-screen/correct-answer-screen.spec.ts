import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrectAnswerScreen } from './correct-answer-screen';

describe('CorrectAnswerScreen', () => {
  let component: CorrectAnswerScreen;
  let fixture: ComponentFixture<CorrectAnswerScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorrectAnswerScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(CorrectAnswerScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
