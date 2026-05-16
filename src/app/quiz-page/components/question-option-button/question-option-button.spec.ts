import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionOptionButton } from './question-option-button';

describe('QuestionOptionButton', () => {
  let component: QuestionOptionButton;
  let fixture: ComponentFixture<QuestionOptionButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionOptionButton],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionOptionButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
