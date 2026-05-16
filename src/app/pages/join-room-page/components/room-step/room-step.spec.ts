import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomStep } from './room-step';

describe('RoomStep', () => {
  let component: RoomStep;
  let fixture: ComponentFixture<RoomStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomStep],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
