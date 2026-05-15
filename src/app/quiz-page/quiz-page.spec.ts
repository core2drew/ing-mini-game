import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizPage } from './quiz-page';

describe('QuizPage', () => {
  let component: QuizPage;
  let fixture: ComponentFixture<QuizPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizPage],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
