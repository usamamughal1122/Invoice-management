import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '../../services/code-mentore.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,NgxSpinnerModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  @Input() employeeData: any;
  employeeForm!: FormGroup;
  isEditMode = false;
  categories: any[] = [];
  constructor(
    private fb: FormBuilder,
    private service: EmployeeService,
    public activeModal: NgbActiveModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      designation: ['', Validators.required],
      department: [''],
      salary: [0],
      contactNo: [''],
      address: [''],
     createdAt: [{ value: new Date(), disabled: true }],
     active: [true]
    });

    // If editing, fill form
    if (this.employeeData) {
      
      this.isEditMode = true;
      this.employeeForm.patchValue(this.employeeData);
    }

  }

  loadCategories() {
    this.spinner.show();
    this.service.category().subscribe({
      next: (res) => {
        this.categories = res.data || [];
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        console.error('Category fetch error:', err);
        this.categories = [];
      },
    });
  }

  onSubmit() {
    if (this.employeeForm.invalid) return;
    this.spinner.show();
    const payload = this.employeeForm.getRawValue();
    if (this.isEditMode) {
      this.service.updateEmployee(this.employeeData._id, payload).subscribe({
        next: () => { 
          this.activeModal.close();
          this.spinner.hide(); // Hide the spinner
          this.toastr.success('Employee updated successfully!');
        },
        error: (err) => {
          console.error('Update Error:', err);
          this.toastr.error('Failed to update employee');
        },
      });
    } else {
      this.service.addEmployee(payload).subscribe({
        next: () => {
          this.activeModal.close();
          this.spinner.hide(); // Hide the spinner
          this.toastr.success('Employee added successfully!');
        },
        error: (err) => {
          console.error('Add Error:', err);
          this.toastr.error('Failed to add employee');
        },
      });
    }
  }
  onBack() {
    this.activeModal.dismiss();
  }
}
