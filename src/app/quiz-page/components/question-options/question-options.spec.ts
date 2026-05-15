import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionOptions } from './question-options';

describe('QuestionOptions', () => {
  let component: QuestionOptions;
  let fixture: ComponentFixture<QuestionOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionOptions],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionOptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
