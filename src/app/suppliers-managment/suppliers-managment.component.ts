import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EmployeeService } from '../../services/code-mentore.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-suppliers-managment',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,NgxSpinnerModule],
  templateUrl: './suppliers-managment.component.html',
  styleUrl: './suppliers-managment.component.css',
})
export class SuppliersManagmentComponent implements OnInit {
  supplierForm!:FormGroup;
  suppliersList: any[] = [];
  categoryForm: any;

  constructor(private fb: FormBuilder, private svc: EmployeeService,private spinner: NgxSpinnerService,private toastr: ToastrService) {
   this.supplierForm = this.fb.group({
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  phone: ['', Validators.required],
  address: ['', Validators.required],
});

  }

  ngOnInit(): void {
    this.allSuppliers();
  }

  allSuppliers() {
    this.spinner.show();
    this.svc.allSuppliers().subscribe((res) => {
      this.spinner.hide();
      this.suppliersList = res.data;
    });
  }
addSupplier() {
  if (this.supplierForm.valid) {
    this.spinner.show();
    this.svc.addSupplier(this.supplierForm.value).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.allSuppliers();
        this.supplierForm.reset(); 
        this.toastr.success('Supplier added successfully');
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err.error?.message || 'Error adding supplier');
      }
    });
  } else {
    this.supplierForm.markAllAsTouched();
  }
}


  removeSupplier() {}
}
