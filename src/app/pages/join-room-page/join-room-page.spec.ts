import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinRoomPage } from './join-room-page';

describe('JoinRoomPage', () => {
  let component: JoinRoomPage;
  let fixture: ComponentFixture<JoinRoomPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinRoomPage],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinRoomPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
