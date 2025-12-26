import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../../services/code-mentore.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSpinnerModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  page: number = 1;
  limit: number = 5;
  totalPages: number = 0;
  total: number = 0;

  constructor(
    private svc: EmployeeService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions() {
    this.spinner.show();
    this.svc.getTransactions(this.page, this.limit).subscribe({
      next: (res) => {
        console.log('Transactions loaded:', res);
        this.transactions = res.data || [];
        this.total = res.total || 0;
        this.totalPages = res.totalPages || 0;
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Load transactions error:', err);
        this.spinner.hide();
        this.toastr.error('Failed to load transactions');
      }
    });
  }

  // Pagination methods
  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
      this.loadTransactions();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.goToPage(this.page - 1);
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.goToPage(this.page + 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.page - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  refund(transaction: any) {
    console.log('Refund clicked for:', transaction);

    //  Check if already refunded
    if (transaction.status === 'REFUNDED') {
      this.toastr.info('This transaction is already fully refunded');
      return;
    }

    const items = transaction.invoiceId?.items || [];

    //  Validate items exist
    if (!items || items.length === 0) {
      this.toastr.error('No items found in invoice');
      return;
    }

    //  Filter out already refunded items
    const availableItems = items.filter((item: any) => !item.refunded);

    if (availableItems.length === 0) {
      Swal.fire({
        title: 'All Items Refunded',
        text: 'All items in this invoice have already been refunded',
        icon: 'info',
        confirmButtonColor: '#d4af37'
      });
      return;
    }

    //  If only one item available, show confirmation directly
    if (availableItems.length === 1) {
      this.confirmSingleItemRefund(transaction, availableItems[0]);
      return;
    }

    //  Multiple items - show selection modal
    this.showItemSelectionModal(transaction, availableItems);
  }

  confirmSingleItemRefund(transaction: any, item: any) {
    Swal.fire({
      title: 'Confirm Refund',
      html: `
        <div style="text-align: left;">
          <p><strong>Invoice:</strong> #${transaction.invoiceNumber}</p>
          <p><strong>Item:</strong> ${item.name}</p>
          <p><strong>Quantity:</strong> ${item.quantity}</p>
          <hr/>
          <p style="font-size: 18px; color: #dc3545; font-weight: bold;">
            Refund Amount: ${(item.subtotal / 100).toFixed(2)}
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Refund',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#666'
    }).then(result => {
      if (result.isConfirmed) {
        //  Format item correctly
        const formattedItem = {
          itemId: item._id,
          name: item.name,
          subtotal: item.subtotal
        };
        this.processPartialRefund(transaction, [formattedItem]);
      }
    });
  }

  showItemSelectionModal(transaction: any, availableItems: any[]) {
    const itemsHtml = availableItems.map((item: any, i: number) => `
      <div style="text-align: left; margin-bottom: 12px; padding: 10px; background: #f8f8f8; border-radius: 5px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input
            type="checkbox"
            id="item_${i}"
            style="width: 18px; height: 18px; margin-right: 10px; cursor: pointer;"
          />
          <div style="flex: 1;">
            <strong>${item.name}</strong><br/>
            <small style="color: #666;">
              Qty: ${item.quantity} × $${(item.price / 100).toFixed(2)} =
              <strong style="color: #28a745;">$${(item.subtotal / 100).toFixed(2)}</strong>
            </small>
          </div>
        </label>
      </div>
    `).join('');

    Swal.fire({
      title: 'Select Items to Refund',
      html: `
        <div style="max-height: 400px; overflow-y: auto; text-align: left;">
          ${itemsHtml}
        </div>
        <hr/>
        <div style="text-align: center; margin-top: 15px;">
          <button
            id="selectAll"
            class="swal2-confirm swal2-styled"
            style="background: #666; margin-right: 10px;"
          >
            Select All
          </button>
          <small style="color: #dc3545; display: block; margin-top: 10px;">
            ⚠️ Only selected items will be refunded
          </small>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Refund Selected Items',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#666',
      width: '600px',
      didOpen: () => {
        const selectAllBtn = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');

        selectAllBtn?.addEventListener('click', (e) => {
          e.preventDefault();
          checkboxes.forEach((cb: any) => {
            cb.checked = !cb.checked;
          });
          selectAllBtn.textContent =
            Array.from(checkboxes).every((cb: any) => cb.checked)
              ? 'Deselect All'
              : 'Select All';
        });
      },
      preConfirm: () => {
        const popup = Swal.getPopup();
        if (!popup) return false;

        const selectedItems: any[] = [];
        let totalRefund = 0;

        availableItems.forEach((item: any, i: number) => {
          const checkbox = popup.querySelector(`#item_${i}`) as HTMLInputElement;

          if (checkbox?.checked) {
            selectedItems.push({
              itemId: item._id,
              name: item.name,
              subtotal: item.subtotal
            });
            totalRefund += item.subtotal;
          }
        });

        if (selectedItems.length === 0) {
          Swal.showValidationMessage('Please select at least one item');
          return false;
        }

        return { selectedItems, totalRefund };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        this.confirmAndProcessRefund(transaction, result.value);
      }
    });
  }

  confirmAndProcessRefund(transaction: any, data: any) {
    const { selectedItems, totalRefund } = data;

    Swal.fire({
      title: 'Confirm Refund',
      html: `
        <div style="text-align: left;">
          <p><strong>Invoice:</strong> #${transaction.invoiceNumber}</p>
          <p><strong>Items to Refund:</strong> ${selectedItems.length}</p>
          <ul style="max-height: 150px; overflow-y: auto;">
            ${selectedItems.map((i: any) =>
              `<li>${i.name} - $${(i.subtotal / 100).toFixed(2)}</li>`
            ).join('')}
          </ul>
          <hr/>
          <p style="font-size: 18px; color: #dc3545; font-weight: bold;">
            Total Refund: $${(totalRefund / 100).toFixed(2)}
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirm Refund',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#666'
    }).then(result => {
      if (result.isConfirmed) {
        this.processPartialRefund(transaction, selectedItems);
      }
    });
  }

  processPartialRefund(transaction: any, items: any[]) {
    this.spinner.show();

    const totalRefund = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

    //  Format items correctly - backend expects {itemId, amount}
    const formattedItems = items.map(item => ({
      itemId: item.itemId || item._id,  // Handle both formats
      amount: item.subtotal
    }));

    console.log('Sending refund payload:', {
      transactionId: transaction._id,
      invoiceId: transaction.invoiceId._id,
      items: formattedItems,
      amount: totalRefund
    });

    this.svc.partialRefund({
      transactionId: transaction._id,
      invoiceId: transaction.invoiceId._id,
      items: formattedItems,
      amount: totalRefund
    }).subscribe({
      next: (res) => {
        console.log('Partial refund successful:', res);
        this.spinner.hide();

        const responseData = res.data || res;

        Swal.fire({
          icon: 'success',
          title: 'Refund Successful!',
          html: `
            <p><strong>$${(totalRefund / 100).toFixed(2)}</strong> refunded</p>
            <p>${items.length} item(s) refunded successfully</p>
            <p>New status: <strong>${responseData.invoiceStatus || responseData.status || 'Updated'}</strong></p>
          `,
          confirmButtonColor: '#28a745'
        });

        this.loadTransactions();
      },
      error: (err) => {
        console.error('Partial refund error:', err);
        this.spinner.hide();

        const errorMsg = err?.error?.message || 'Refund failed. Please try again.';

        Swal.fire({
          icon: 'error',
          title: 'Refund Failed',
          text: errorMsg,
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Helper methods for status badges
  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'SUCCESS':
        return 'bg-success';
      case 'REFUNDED':
        return 'bg-secondary';
      case 'PARTIALLY_REFUNDED':
        return 'bg-warning text-dark';
      case 'PENDING':
        return 'bg-info';
      case 'FAILED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'SUCCESS':
        return 'bi-check-circle-fill';
      case 'REFUNDED':
        return 'bi-arrow-counterclockwise';
      case 'PARTIALLY_REFUNDED':
        return 'bi-dash-circle-fill';
      case 'PENDING':
        return 'bi-clock-fill';
      case 'FAILED':
        return 'bi-x-circle-fill';
      default:
        return 'bi-question-circle';
    }
  }
}
