// brand.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '../../services/code-mentore.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule,NgxSpinnerModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css'
})
export class BrandComponent {
  brandForm: FormGroup;
  brandsList: any[] = [];

  constructor(private fb: FormBuilder,private svc: EmployeeService,private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.brandForm = this.fb.group({
      brand: ['', Validators.required]
    });
  }

addBrand() {
  if (this.brandForm.valid) {
    this.spinner.show();
    this.svc.addBrands(this.brandForm.value).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.brandForm.reset();
        this.toastr.success('Brand added successfully');
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err.error?.message || 'Error adding brand');
      }
    });
  } else {
    this.brandForm.markAllAsTouched();
  }
}

    removeBrand() {
      
    }
  }

  

