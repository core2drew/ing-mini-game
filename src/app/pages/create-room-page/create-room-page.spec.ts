import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRoomPage } from './create-room-page';

describe('CreateRoomPage', () => {
  let component: CreateRoomPage;
  let fixture: ComponentFixture<CreateRoomPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoomPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRoomPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
