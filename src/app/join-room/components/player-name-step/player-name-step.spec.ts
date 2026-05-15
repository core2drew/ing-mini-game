import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerNameStep } from './player-name-step';

describe('PlayerNameStep', () => {
  let component: PlayerNameStep;
  let fixture: ComponentFixture<PlayerNameStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerNameStep],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerNameStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
