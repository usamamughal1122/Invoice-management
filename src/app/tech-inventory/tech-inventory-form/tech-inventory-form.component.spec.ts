import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechInventoryFormComponent } from './tech-inventory-form.component';

describe('TechInventoryFormComponent', () => {
  let component: TechInventoryFormComponent;
  let fixture: ComponentFixture<TechInventoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechInventoryFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechInventoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
