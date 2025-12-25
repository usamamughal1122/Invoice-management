import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
page: number = 1;
limit: number = 5;
totalPages: number = 0;
isLoading = true;
constructor(
  private svc: EmployeeService,  
  private modalService: NgbModal,
  private spinner: NgxSpinnerService,
  private toastr: ToastrService) {

}
 modalRef!: NgbModalRef;
ngOnInit(): void {
  this.allTechInventory();
  this.brands();
  this.category();
  this.allSuppliers();
setTimeout(() => {
    this.isLoading = false;
  }, 4000);
}

allTechInventory() {
  this.spinner.show();
  this.svc.getInventory(this.page, this.limit).subscribe((res) => {
    this.spinner.hide();
    this.allInventoryList = res.data;  
    this.totalPages = res.totalPages;
    this.inventoryList = [...this.allInventoryList]; // clone for display
    
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

    //  Pass data to modal (for edit mode)
    if (product) {
      this.modalRef.componentInstance.inventoryData = product;
    }

    //  After modal closes, refresh lists
    this.modalRef.result.finally(() => {
      this.allTechInventory();

    });
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

 
   brands(){
   this.svc.getBrands().subscribe({
     next: (res: any) => (this.brandsList = res.data || []),
     error: (err) => console.error(err),
   })
  }

   category(){
   this.svc.getcategory().subscribe({
     next: (res: any) => (this.categoryList = res.data || []),
     error: (err) => console.error(err),
   })
  }

  allSuppliers(){
   this.svc.allSuppliers().subscribe({
     next: (res: any) => (this.suppliersList = res.data || []),
     error: (err) => console.error(err),
   })
  }


applyFilters() {
  let filtered = [...this.allInventoryList];

  // Filter by search term
  if (this.searchTerm.trim() !== '') {
    const searchLower = this.searchTerm.toLowerCase();
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(searchLower)
    );
  }

  // Filter by category
  if (this.selectedCategory && this.selectedCategory.trim() !== '') {
    const catLower = this.selectedCategory.toLowerCase();
    filtered = filtered.filter(item =>
      item.category?.category?.toLowerCase() === catLower
    );
  }

  this.inventoryList = filtered;
}


}
