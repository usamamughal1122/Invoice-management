import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechInventoryComponent } from './tech-inventory.component';

describe('TechInventoryComponent', () => {
  let component: TechInventoryComponent;
  let fixture: ComponentFixture<TechInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
