import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveMangementComponent } from './leave-mangement.component';

describe('LeaveMangementComponent', () => {
  let component: LeaveMangementComponent;
  let fixture: ComponentFixture<LeaveMangementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveMangementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveMangementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
