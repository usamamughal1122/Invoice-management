import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../services/code-mentore.service';
import { NgbActiveModal, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule,NgxSpinnerModule,NgbDatepickerModule],
  templateUrl: './leave-form.component.html',
  styleUrl: './leave-form.component.css'
})
export class LeaveFormComponent {
  employeeForm!: FormGroup;
  isEditMode = false;
  employees: any[] = [];
  constructor(
    private fb: FormBuilder,
    private service: EmployeeService,
    public activeModal: NgbActiveModal,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      employeeName: ['', Validators.required],
      type: [''],
      fromDate: ['', Validators.required],
      reason: [''],
      status: ['Pending'], 
      toDate: [''],
    
    });

   this.loadProducts();
  }

  loadProducts() {
  this.spinner.show();
  
  this.service.getRoles().subscribe({
    next: (res) => {
      this.employees = res.data;
      this.spinner.hide();
    },
    error: (err) => {
      console.log(err);
      this.spinner.hide();
    },
    complete: () => {
      this.spinner.hide();
    },
  });
}

  onSubmit() {
    if (this.employeeForm.invalid) return;
    this.spinner.show();
    const payload = this.employeeForm.getRawValue();
    
      this.service.addLeaves(payload).subscribe({
        next: () => {
          this.activeModal.close();
          this.spinner.hide();
        },
        error: (err) => {
          this.spinner.hide();
          console.error('Add Error:', err);
        },
      });
    
  }

  onBack() {
    this.activeModal.dismiss();
  }
}
