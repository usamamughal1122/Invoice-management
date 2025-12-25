import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/code-mentore.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-low-stock',
  imports: [CommonModule,FormsModule,NgxSpinnerModule],
  templateUrl: './low-stock.component.html',
  styleUrl: './low-stock.component.css'
})
export class LowStockComponent implements OnInit {

  items: any[] = [];
  loading = true;
  selectedItem: any = null;
  newQty: number = 0;
 today: Date = new Date();
  constructor(
    private invService: EmployeeService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadQty();
  }

  loadQty() {
    this.spinner.show();
    this.invService.getLowStock().subscribe(res => {
      this.items = res.data;
      this.loading = false;
       this.spinner.hide();
    });
  }

    openEditModal(item: any) {
    this.selectedItem = item;
    this.newQty = item.quantity_available;
  }

updateQty() {
  this.spinner.show();

  this.invService.updateQty(this.selectedItem._id, this.newQty).subscribe({
    next: () => {
      this.loadQty();
      this.toastr.success('Quantity updated successfully!');
      this.spinner.hide();
    },
    error: () => {
      this.spinner.hide();
      this.toastr.error('Failed to update quantity');
    }
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
        this.invService.deleteItem(id).subscribe({
          next: () => {
            this.spinner.hide(); 
            this.loadQty();
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
  
}


