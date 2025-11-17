import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/code-mentore.service';
import { Router } from '@angular/router';
import { ProductFormComponent } from '../product-form/product-form.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule,NgxSpinnerModule],
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.css'],
})
export class SessionListComponent implements OnInit {
  totalEmployees = 0;
  activeEmployees = 0;
  avgSalary = 0;
  products: any[] = [];
  modalRef!: NgbModalRef;
isLoading: boolean = false;

 @Output() employeList = new EventEmitter<any>();
 
  constructor(
    private service: EmployeeService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

 loadProducts() {
  this.spinner.show();
  this.isLoading = true; 
  this.service.getRoles().subscribe({
    next: (res) => {
      this.products = res.data;
      this.totalEmployees = this.products.length;
      this.activeEmployees = this.products.filter((p: any) => p.active).length;
      this.avgSalary = this.products.reduce((total: number, p: any) => total + p.salary, 0) / this.products.length;
      this.employeList.emit(this.products);
      this.isLoading = false; 
      this.spinner.hide();
    },
    error: (err) => {
      console.log(err);
      this.isLoading = false; 
    },
    complete: () => {
      this.spinner.hide();
    },
  });
}

  //  open modal for create
  onCreateNew() {
    this.openProductModal();
  }

  onEditProduct(product: string) {
    this.spinner.show();
    this.openProductModal(product);
    this.spinner.hide();
  }

  openProductModal(product: any = null) {
    this.modalRef = this.modalService.open(ProductFormComponent, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      scrollable: true,
    });

    //  Pass data to modal (for edit mode)
    if (product) {
      this.modalRef.componentInstance.employeeData = product;
    }

    //  After modal closes, refresh lists
    this.modalRef.result.finally(() => {
      this.loadProducts();
    });
  }
  onDelete(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.service.deleteProduct(id).subscribe({
          next: () => {
            this.loadProducts();
            this.spinner.hide();
            this.toastr.success('Product deleted successfully!');
          },
          error: () =>{console.error,
          this.toastr.error('Failed to delete product');
          },
        });
      }
    });
  }
}
