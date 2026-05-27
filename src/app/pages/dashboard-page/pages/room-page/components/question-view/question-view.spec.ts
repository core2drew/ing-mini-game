import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionView } from './question-view';

describe('QuestionView', () => {
  let component: QuestionView;
  let fixture: ComponentFixture<QuestionView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionView],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
