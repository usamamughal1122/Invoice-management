import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '../../services/code-mentore.service';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-category',
  imports: [CommonModule, ReactiveFormsModule, NgbModule,NgxSpinnerModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent {
 categoryForm: FormGroup;
  categoriesList: any[] = [];

  constructor(private fb: FormBuilder,private svc: EmployeeService,private spinner: NgxSpinnerService,private toastr: ToastrService) {
    this.categoryForm = this.fb.group({
      category: ['', Validators.required]
    });
  }

 addCategory() {
  if (this.categoryForm.valid) {
    this.spinner.show();
    this.svc.addCategory(this.categoryForm.value).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.categoryForm.reset();
        this.toastr.success('Category added successfully');
        this.fetchBrands()
      },
      error: (err) => {
        this.spinner.hide();
        this.toastr.error(err.error?.message || 'Error adding category');
      }
    });
  } else {
    this.categoryForm.markAllAsTouched();
  }
}
fetchBrands() {
  this.svc.getcategory().subscribe({
    next: (res: any) => {
      this.categoriesList = res.data || [];
    },
    error: (err) => console.error(err)
  });
}

    removeCategory() {
      
    }
}
