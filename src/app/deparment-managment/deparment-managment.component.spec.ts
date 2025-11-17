import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeparmentManagmentComponent } from './deparment-managment.component';

describe('DeparmentManagmentComponent', () => {
  let component: DeparmentManagmentComponent;
  let fixture: ComponentFixture<DeparmentManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeparmentManagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeparmentManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
