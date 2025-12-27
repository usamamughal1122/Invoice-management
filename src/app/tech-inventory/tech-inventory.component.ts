import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/code-mentore.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TechInventoryFormComponent } from './tech-inventory-form/tech-inventory-form.component';
import Swal from 'sweetalert2';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tech-inventory',
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgxSpinnerModule],
  templateUrl: './tech-inventory.component.html',
  styleUrl: './tech-inventory.component.css'
})
export class TechInventoryComponent implements OnInit {
  showNameFilter = false;
  showTopNameFilter = false;
  showBrandFilter = false;
  showCategoryFilter = false;
  showSkuFilter = false;
  showSupplierFilter = false;
  showStatusFilter = false;

  selectedStatus: any;
  inventoryList: any[] = [];
  employees: any[] = [];
  brandsList: any[] = [];
  categoryList: any[] = [];
  suppliersList: any[] = [];
  allInventoryList: any[] = [];
  statusList: string[] = ['Available', 'UnAvailable', 'Repair', 'Retired', 'Lost'];
  searchTerm = '';
  selectedCategory = '';
  selectedBrand = '';
  selectedSupplier = '';
  selectedSku = '';

  @ViewChild('nameFilterInputHeader') nameFilterInputHeader!: ElementRef;
  @ViewChild('nameFilterInputTop') nameFilterInputTop!: ElementRef;

  page: number = 1;
  limit: number = 5;
  totalPages: number = 0;
  isLoading = true;
  modalRef!: NgbModalRef;

  constructor(
    private svc: EmployeeService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.allTechInventory();
    this.brands();
    this.category();
    this.allSuppliers();
    setTimeout(() => {
      this.isLoading = false;
    }, 4000);
  }

  // Listen for clicks anywhere in the document
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Check if click is outside filter buttons and popovers
    const target = event.target as HTMLElement;
    const isFilterButton = target.closest('.filter-btn');
    const isFilterPopover = target.closest('.filter-popover');
    const isCompactSearchBtn = target.closest('.compact-search-btn');
    const isTopSearchInput = target.closest('.compact-search-input');

    // If click is outside all filter-related elements, close all filters
    if (!isFilterButton && !isFilterPopover && !isCompactSearchBtn && !isTopSearchInput) {
      this.closeAllFilters();
      this.showTopNameFilter = false;
    }
  }

  // Handle clicks within the table card
  handleTableClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isFilterButton = target.closest('.filter-btn');
    const isFilterPopover = target.closest('.filter-popover');

    // If clicking inside the table but not on filter elements, close filters
    if (!isFilterButton && !isFilterPopover) {
      this.closeAllFilters();
    }
  }

  allTechInventory() {
    this.spinner.show();
    this.svc.getInventory(this.page, this.limit).subscribe((res) => {
      this.spinner.hide();
      this.allInventoryList = res.data;
      this.totalPages = res.totalPages;
      this.inventoryList = [...this.allInventoryList];
      this.applyFilters();
    });
  }

  refreshList() {
    this.page = 1;
    this.allTechInventory();
  }

  goToPage(p: number) {
    this.page = p;
    this.allTechInventory();
  }

  prevPage() {
    if (this.page > 1) this.goToPage(this.page - 1);
  }

  nextPage() {
    if (this.page < this.totalPages) this.goToPage(this.page + 1);
  }

  onPrevPageClick() {
    if (this.page > 1) {
      this.page--;
      this.allTechInventory();
    }
  }

  goToNextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.allTechInventory();
    }
  }

  openAddModal() {
    this.openProductModal();
  }

  editItem(product: any) {
    this.spinner.show();
    setTimeout(() => {
      this.openProductModal(product);
      this.spinner.hide();
    }, 200);
  }

  openProductModal(product: any = null) {
    this.brands();
    this.category();
    this.allSuppliers();
    this.modalRef = this.modalService.open(TechInventoryFormComponent, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      scrollable: true,
    });

    if (product) {
      this.modalRef.componentInstance.inventoryData = product;
    }

    this.modalRef.result.finally(() => {
      this.allTechInventory();
    });
  }

  closeAllFilters() {
    this.showNameFilter = false;
    this.showBrandFilter = false;
    this.showCategoryFilter = false;
    this.showSkuFilter = false;
    this.showSupplierFilter = false;
    this.showStatusFilter = false;
  }

  toggleTopNameFilter() {
    // Close all column filters
    this.closeAllFilters();
    // Toggle top search
    this.showTopNameFilter = !this.showTopNameFilter;

    if (this.showTopNameFilter) {
      setTimeout(() => {
        try {
          this.nameFilterInputTop?.nativeElement?.focus();
        } catch {}
      }, 0);
    }
  }

  toggleNameFilter() {
    const wasOpen = this.showNameFilter;
    this.closeAllFilters();
    // Toggle: if it was open, keep it closed; if it was closed, open it
    this.showNameFilter = !wasOpen;

    if (this.showNameFilter) {
      setTimeout(() => {
        try {
          this.nameFilterInputHeader?.nativeElement?.focus();
        } catch {}
      }, 0);
    }
  }

  toggleBrandFilter() {
    const wasOpen = this.showBrandFilter;
    this.closeAllFilters();
    this.showBrandFilter = !wasOpen;
  }

  toggleCategoryFilter() {
    const wasOpen = this.showCategoryFilter;
    this.closeAllFilters();
    this.showCategoryFilter = !wasOpen;
  }

  toggleSkuFilter() {
    const wasOpen = this.showSkuFilter;
    this.closeAllFilters();
    this.showSkuFilter = !wasOpen;
  }

  toggleSupplierFilter() {
    const wasOpen = this.showSupplierFilter;
    this.closeAllFilters();
    this.showSupplierFilter = !wasOpen;
  }

  toggleStatusFilter() {
    const wasOpen = this.showStatusFilter;
    this.closeAllFilters();
    this.showStatusFilter = !wasOpen;
  }

  deleteItem(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete this item`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.svc.deleteInventory(id).subscribe({
          next: () => {
            this.spinner.hide();
            this.allTechInventory();
            this.toastr.success('Item deleted successfully!');
          },
          error: () => {
            this.spinner.hide();
            console.error('Delete failed');
            this.toastr.error('Failed to delete item');
          },
        });
      }
    });
  }

  brands() {
    this.svc.getBrands().subscribe({
      next: (res: any) => (this.brandsList = res.data || []),
      error: (err) => console.error(err),
    });
  }

  category() {
    this.svc.getcategory().subscribe({
      next: (res: any) => (this.categoryList = res.data || []),
      error: (err) => console.error(err),
    });
  }

  allSuppliers() {
    this.svc.allSuppliers().subscribe({
      next: (res: any) => (this.suppliersList = res.data || []),
      error: (err) => console.error(err),
    });
  }

  applyFilters() {
    let filtered = [...this.allInventoryList];

    // Filter by search term (name)
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.name || '').toLowerCase().includes(searchLower)
      );
    }

    // Filter by category (exact match)
    if (this.selectedCategory && this.selectedCategory.trim() !== '') {
      const catLower = this.selectedCategory.toLowerCase();
      filtered = filtered.filter(item =>
        item.category?.category?.toLowerCase() === catLower
      );
    }

    // Filter by brand (exact match)
    if (this.selectedBrand && this.selectedBrand.trim() !== '') {
      const brandLower = this.selectedBrand.toLowerCase();
      filtered = filtered.filter(item =>
        item.brand?.brand?.toLowerCase() === brandLower
      );
    }

    // Filter by SKU (contains)
    if (this.selectedSku && this.selectedSku.trim() !== '') {
      const skuLower = this.selectedSku.toLowerCase();
      filtered = filtered.filter(item =>
        (item.sku || '').toString().toLowerCase().includes(skuLower)
      );
    }

    // Filter by supplier
    if (this.selectedSupplier && this.selectedSupplier.trim() !== '') {
      const supLower = this.selectedSupplier.toLowerCase();
      filtered = filtered.filter(item =>
        item.supplier?.name?.toLowerCase() === supLower
      );
    }

    // Filter by status
    if (this.selectedStatus && this.selectedStatus.toString().trim() !== '') {
      const statusLower = this.selectedStatus.toString().toLowerCase();
      filtered = filtered.filter(item =>
        item.status?.toLowerCase() === statusLower
      );
    }

    this.inventoryList = filtered;
  }
}
