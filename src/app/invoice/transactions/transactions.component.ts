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
    this.svc.getTransactions().subscribe({
      next: (res) => {
        console.log('Transactions loaded:', res);
        this.transactions = res.data || [];
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Load transactions error:', err);
        this.spinner.hide();
        this.toastr.error('Failed to load transactions');
      }
    });
  }

  refund(transaction: any) {
    // Confirm before refund
    Swal.fire({
      title: 'Refund Payment?',
      html: `
        <div style="text-align: left;">
          <p><strong>Invoice:</strong> ${transaction.invoiceNumber}</p>
          <p><strong>Amount:</strong> $${(transaction.amount / 100).toFixed(2)}</p>
          <p><strong>Client:</strong> ${transaction.invoiceId?.client?.name || 'N/A'}</p>
        </div>
        <p style="margin-top: 15px; color: #dc3545;">
          <i class="bi bi-exclamation-triangle"></i>
          This action will refund the Payment and update the invoice status to Pending.
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '<i class="bi bi-arrow-counterclockwise me-2"></i>Yes, Refund',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal-wide'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.processRefund(transaction);
      }
    });
  }

  processRefund(transaction: any) {
    this.spinner.show();
    
    this.svc.refundTransaction(transaction._id).subscribe({
      next: (res) => {
        console.log('Refund successful:', res);
        this.spinner.hide();
        
        Swal.fire({
          icon: 'success',
          title: 'Refund Successful!',
          html: `
            <p>Payment has been refunded successfully.</p>
            <p><strong>Invoice ${transaction.invoiceNumber}</strong> status updated to Pending.</p>
          `,
          confirmButtonColor: '#28a745'
        });

        // Refresh transactions list
        this.loadTransactions();
      },
      error: (err) => {
        console.error('Refund error:', err);
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

  // Helper method to get status badge color
  getStatusBadgeClass(status: string): string {
    switch(status) {
      case 'SUCCESS':
        return 'bg-success';
      case 'REFUNDED':
        return 'bg-secondary';
      case 'PENDING':
        return 'bg-warning';
      case 'FAILED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  // Helper method to get status icon
  getStatusIcon(status: string): string {
    switch(status) {
      case 'SUCCESS':
        return 'bi-check-circle-fill';
      case 'REFUNDED':
        return 'bi-arrow-counterclockwise';
      case 'PENDING':
        return 'bi-clock-fill';
      case 'FAILED':
        return 'bi-x-circle-fill';
      default:
        return 'bi-question-circle';
    }
  }
}