import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '../../../services/code-mentore.service';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

interface Brand {
  _id?: string;
  brand: string;
}
interface category {
  _id?: string;
  category: string;
}

export interface Supplier {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
}

@Component({
  selector: 'app-tech-inventory-form',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './tech-inventory-form.component.html',
  styleUrls: ['./tech-inventory-form.component.css'],
})
export class TechInventoryFormComponent implements OnInit {
  @Input() inventoryData: any;
  inventoryForm!: FormGroup;
  isEditMode = false;

  brand: Brand[] = [];
  categories: category[] = [];
  suppliers: Supplier[] = [];
  departments = [
    'HR',
    'IT',
    'Finance',
    'Admin',
    'Management',
    'Operations',
    'Marketing',
    'Support',
    'Logistics',
  ];
  statuses = ['Available', 'UnAvailable', 'Repair', 'Retired', 'Lost'];

  employees: any[] = [];

  constructor(
    private fb: FormBuilder,
    private svc: EmployeeService,
    public activeModal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.inventoryForm = this.fb.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      serialNumber: [''],
      price: [0, Validators.required],
      supplier: [''],
      department: [''],
      purchaseDate: ['', Validators.required],
      warrantyExpiry: [''],
      status: ['Available', Validators.required],
      sku: [''],
      quantity_total: [1, [Validators.required, Validators.min(0)]],
      quantity_available: [1, [Validators.required, Validators.min(0)]],
    });

    this.loadEmployees();

    this.inventoryForm
      .get('brand')
      ?.valueChanges.subscribe(() => this.generateSerial());
    this.inventoryForm
      .get('category')
      ?.valueChanges.subscribe(() => this.generateSerial());

    if (this.inventoryData) {
      this.isEditMode = true;

      const formattedData = {
        ...this.inventoryData,
        purchaseDate: this.formatDate(this.inventoryData.purchaseDate),
        warrantyExpiry: this.formatDate(this.inventoryData.warrantyExpiry),
        brand: this.inventoryData.brand?._id || '',
        category: this.inventoryData.category?._id || '',
        supplier: this.inventoryData.supplier?._id || '',
      };
      this.inventoryForm.patchValue(formattedData);

      this.inventoryForm.patchValue(formattedData);
    }
    this.brands();
    this.category();
    this.allsuppliers();
  }

  loadEmployees() {
    this.svc.getRoles().subscribe({
      next: (res: any) => (this.employees = res.data || []),
      error: (err) => console.error(err),
    });
  }

  generateSerial() {
    const brandId = this.inventoryForm.get('brand')?.value;
    const categoryId = this.inventoryForm.get('category')?.value;

    if (!brandId || !categoryId) return;

    const brandObj = this.brand.find((b) => b._id === brandId);
    const categoryObj = this.categories.find((c) => c._id === categoryId);

    if (!brandObj || !categoryObj) return;

    const brandName = brandObj.brand.substring(0, 3).toUpperCase();
    const categoryName = categoryObj.category.substring(0, 3).toUpperCase();

    const serial = `${brandName}-${categoryName}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;
    const sku = `SKU-${brandName}-${categoryName}-${Date.now()}`;

    this.inventoryForm.get('serialNumber')?.setValue(serial);
    this.inventoryForm.get('sku')?.setValue(sku);
  }

  getEmployeeName(id: string) {
    if (!id) return null;
    const emp = this.employees.find((e) => e._id === id);
    return emp ? emp.name : null;
  }

  onSubmit() {
    if (this.inventoryForm.invalid) {
      this.inventoryForm.markAllAsTouched();
      return;
    }

    const payload = this.inventoryForm.getRawValue();

    if (!this.isEditMode) {
      // generate SKU only for new items
      payload.sku = this.generateUniqueSKU();
    }

    if (this.isEditMode) {
      this.svc.updateInventory(this.inventoryData._id, payload).subscribe({
        next: (res) => {
          this.activeModal.close(res);
          this.toastr.success('Inventory updated successfully!');
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error updating inventory!');
        },
      });
    } else {
      this.svc.addInventory(payload).subscribe({
        next: (res) => {
          this.activeModal.close(res);
          this.toastr.success('Inventory added successfully!');
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Error adding inventory!');
        },
      });
    }
  }

  generateUniqueSKU(): string {
    const brand = this.inventoryForm.get('brand')?.value || 'XXX';
    const category = this.inventoryForm.get('category')?.value || 'YYY';
    return `sku-${brand.substring(0, 3).toUpperCase()}-${category
      .substring(0, 3)
      .toUpperCase()}-${Date.now()}`;
  }

  onBack() {
    this.activeModal.dismiss();
  }

  formatDate(date: any): string | null {
    if (!date) return null;
    return new Date(date).toISOString().substring(0, 10);
  }

  brands() {
    debugger;
    this.svc.getBrands().subscribe({
      next: (res: any) => (this.brand = res.data || []),
      error: (err) => console.error(err),
    });
  }

  category() {
    this.svc.getcategory().subscribe({
      next: (res: any) => (this.categories = res.data || []),
      error: (err) => console.error(err),
    });
  }

  allsuppliers() {
    this.svc.allSuppliers().subscribe({
      next: (res: any) => (this.suppliers = res.data || []),
      error: (err) => console.error(err),
    });
  }
}
