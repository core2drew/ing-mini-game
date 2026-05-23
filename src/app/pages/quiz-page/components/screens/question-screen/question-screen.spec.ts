import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionScreen } from './question-screen';

describe('QuestionScreen', () => {
  let component: QuestionScreen;
  let fixture: ComponentFixture<QuestionScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
