import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizTimer } from './quiz-timer';

describe('QuizTimer', () => {
  let component: QuizTimer;
  let fixture: ComponentFixture<QuizTimer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizTimer],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizTimer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
