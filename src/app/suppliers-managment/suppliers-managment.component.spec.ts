import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliersManagmentComponent } from './suppliers-managment.component';

describe('SuppliersManagmentComponent', () => {
  let component: SuppliersManagmentComponent;
  let fixture: ComponentFixture<SuppliersManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuppliersManagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuppliersManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
