import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerStatusChip } from './player-status-chip';

describe('PlayerStatusChip', () => {
  let component: PlayerStatusChip;
  let fixture: ComponentFixture<PlayerStatusChip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerStatusChip],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerStatusChip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
