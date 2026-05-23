import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrongAnswerScreen } from './wrong-answer-screen';

describe('WrongAnswerScreen', () => {
  let component: WrongAnswerScreen;
  let fixture: ComponentFixture<WrongAnswerScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrongAnswerScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(WrongAnswerScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
