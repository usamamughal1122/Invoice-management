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

  // Pagination
  page: number = 1;
  limit: number = 5; // show 5 per page by default
  totalPages: number = 0;

  get startEntry(): number {
    return this.totalEmployees === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endEntry(): number {
    return Math.min(this.page * this.limit, this.totalEmployees);
  }

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
  this.service.getRoles(this.page, this.limit).subscribe({
    next: (res) => {
      // Handle server-side pagination (res.data & res.totalPages / res.total) or fallback to client-side array
      if (res && res.data) {
        this.products = res.data;
        this.totalEmployees = res.total || res.totalItems || (res.totalPages ? res.totalPages * this.limit : this.products.length);
        this.totalPages = res.totalPages || Math.ceil((this.totalEmployees || this.products.length) / this.limit) || 1;
      } else if (Array.isArray(res)) {
        const all = res;
        this.totalEmployees = all.length;
        this.totalPages = Math.ceil(this.totalEmployees / this.limit) || 1;
        const start = (this.page - 1) * this.limit;
        this.products = all.slice(start, start + this.limit);
      } else {
        this.products = [];
        this.totalEmployees = 0;
        this.totalPages = 0;
      }

      const computeArray = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
      this.activeEmployees = computeArray.filter((p: any) => p.active).length;
      this.avgSalary = computeArray.length ? computeArray.reduce((total: number, p: any) => total + (p.salary || 0), 0) / computeArray.length : 0;
      this.employeList.emit(this.products);
      this.isLoading = false;
      this.spinner.hide();
    },
    error: (err) => {
      console.log(err);
      this.isLoading = false;
      this.spinner.hide();
    },
  });
}

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.page > 1) this.goToPage(this.page - 1);
  }

  nextPage() {
    if (this.page < this.totalPages) this.goToPage(this.page + 1);
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
