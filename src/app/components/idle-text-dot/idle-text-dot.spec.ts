import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdleTextDot } from './idle-text-dot';

describe('IdleTextDot', () => {
  let component: IdleTextDot;
  let fixture: ComponentFixture<IdleTextDot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdleTextDot],
    }).compileComponents();

    fixture = TestBed.createComponent(IdleTextDot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
