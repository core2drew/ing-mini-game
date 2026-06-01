import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameoverScreen } from './gameover-screen';

describe('GameoverScreen', () => {
  let component: GameoverScreen;
  let fixture: ComponentFixture<GameoverScreen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameoverScreen],
    }).compileComponents();

    fixture = TestBed.createComponent(GameoverScreen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
