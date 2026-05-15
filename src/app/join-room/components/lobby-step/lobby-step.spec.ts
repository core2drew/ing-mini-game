import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyStep } from './lobby-step';

describe('LobbyStep', () => {
  let component: LobbyStep;
  let fixture: ComponentFixture<LobbyStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LobbyStep],
    }).compileComponents();

    fixture = TestBed.createComponent(LobbyStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
