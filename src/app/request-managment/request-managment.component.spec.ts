import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestManagmentComponent } from './request-managment.component';

describe('RequestManagmentComponent', () => {
  let component: RequestManagmentComponent;
  let fixture: ComponentFixture<RequestManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestManagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
