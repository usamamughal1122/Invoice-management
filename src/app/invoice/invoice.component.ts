// invoice.component.ts
import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { EmployeeService } from '../../services/code-mentore.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { InvoiceModelComponent } from './invoice-model/invoice-model.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgSelectModule } from '@ng-select/ng-select';
import { StripePaymentComponent } from './stripe-payment/stripe-payment.component';

@Component({
  selector: 'app-invoice',
  imports: [CommonModule, FormsModule, NgxSpinnerModule, ReactiveFormsModule, NgSelectModule, InvoiceModelComponent],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',
})
export class InvoiceComponent implements OnInit {
  // Filter toggles
  showClientFilter = false;
  showStatusFilter = false;
  showDateFilter = false;

  // Data Arrays
  invoice: any[] = [];
  allInvoices: any[] = [];
  selectedInvoiceForView: any = null;

  // Filter values
  searchClient = '';
  selectedStatus = '';
  selectedDate = '';
  statusList: string[] = ['Paid', 'Pending', 'Overdue'];

  // Pagination
  page: number = 1;
  limit: number = 5;
  totalPages: number = 0;
  today: any = new Date();

  @ViewChild('clientFilterInput') clientFilterInput!: ElementRef;

  constructor(
    private svc: EmployeeService,
    private modal: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getInvoices();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isFilterButton = target.closest('.filter-btn');
    const isFilterPopover = target.closest('.filter-popover');

    if (!isFilterButton && !isFilterPopover) {
      this.closeAllFilters();
    }
  }

  getInvoices() {
    this.spinner.show();
    this.svc.getInvoices(this.page, this.limit).subscribe({
      next: (res) => {
        this.allInvoices = res.data;
        this.totalPages = res.totalPages;
        this.invoice = [...this.allInvoices];
        this.applyFilters();
        this.spinner.hide();
      },
      error: (err) => {
        console.error(err);
        this.spinner.hide();
        this.toastr.error('Error loading invoices');
      }
    });
  }

  closeAllFilters() {
    this.showClientFilter = false;
    this.showStatusFilter = false;
    this.showDateFilter = false;
  }

  toggleClientFilter() {
    const wasOpen = this.showClientFilter;
    this.closeAllFilters();
    this.showClientFilter = !wasOpen;

    if (this.showClientFilter) {
      setTimeout(() => {
        try {
          this.clientFilterInput?.nativeElement?.focus();
        } catch {}
      }, 0);
    }
  }

  toggleStatusFilter() {
    const wasOpen = this.showStatusFilter;
    this.closeAllFilters();
    this.showStatusFilter = !wasOpen;
  }

  toggleDateFilter() {
    const wasOpen = this.showDateFilter;
    this.closeAllFilters();
    this.showDateFilter = !wasOpen;
  }

  applyFilters() {
    let filtered = [...this.allInvoices];

    // Filter by client name
    if (this.searchClient && this.searchClient.trim() !== '') {
      const searchLower = this.searchClient.toLowerCase();
      filtered = filtered.filter(inv =>
        (inv.client?.name || '').toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (this.selectedStatus && this.selectedStatus.trim() !== '') {
      const statusLower = this.selectedStatus.toLowerCase();
      filtered = filtered.filter(inv =>
        (inv.statuses || '').toLowerCase() === statusLower
      );
    }

    // Filter by date
    if (this.selectedDate && this.selectedDate.trim() !== '') {
      filtered = filtered.filter(inv => {
        const invDate = new Date(inv.purchaseDates).toISOString().split('T')[0];
        return invDate === this.selectedDate;
      });
    }

    this.invoice = filtered;
  }

  sendInvoiceEmail(inv: any) {
    const invoiceId = inv?._id || inv?.id || inv?.invoiceId || inv?.invoice_id;

    if (!invoiceId) {
      this.toastr.error("Invoice ID not found!");
      return;
    }

    this.svc.sendInvoiceEmail(invoiceId).subscribe({
      next: () => this.toastr.success("Invoice email sent!"),
      error: (err) => {
        console.error(err);
        this.toastr.error("Error sending email!");
      }
    });
  }

  goToPage(p: number) {
    this.page = p;
    this.getInvoices();
  }

  prevPage() {
    if (this.page > 1) this.goToPage(this.page - 1);
  }

  nextPage() {
    if (this.page < this.totalPages) this.goToPage(this.page + 1);
  }

  openCreateInvoiceModal(modalRef: any) {
    this.modal.open(modalRef, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }

  onInvoiceCreated() {
    this.getInvoices();
  }

  openInvoiceDetailsModal(modalRef: any, invoice: any) {
    this.selectedInvoiceForView = invoice;
    this.modal.open(modalRef, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }

  downloadModalPDF(invoiceId: string) {
    this.svc.downloadPDF(invoiceId).subscribe(
      (res: Blob) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${invoiceId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      err => {
        console.error('Download failed', err);
      }
    );
  }

  openPaymentModal(invoice: any) {
    if (invoice.statuses === 'Paid') {
      this.toastr.info('Invoice already paid');
      return;
    }

    const modalRef = this.modal.open(StripePaymentComponent, {
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.amount = invoice.total;
    modalRef.componentInstance.invoiceNumber = invoice.invoiceNumber;
    modalRef.componentInstance.invoiceId = invoice._id;

    modalRef.result.then((result) => {
      if (result?.success) {
        this.updateInvoiceStatus(invoice._id);
      }
    });
  }

  updateInvoiceStatus(invoiceId: string) {
    this.spinner.show();

    this.svc.updateInvoice(invoiceId, {
      statuses: 'Paid'
    }).subscribe({
      next: () => {
        this.spinner.hide();
        this.toastr.success('Payment Successful');
        this.getInvoices();

        if (this.selectedInvoiceForView?._id === invoiceId) {
          this.selectedInvoiceForView.statuses = 'Paid';
        }
      },
      error: () => {
        this.spinner.hide();
        this.toastr.error('Failed to update payment status');
      }
    });
  }

  processPaymentSuccess(invoiceId: string, token: any) {
    this.spinner.show();

    this.svc.updateInvoice(invoiceId, { statuses: 'Paid' }).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.toastr.success('Payment successful! Invoice marked as Paid.');
        this.getInvoices();

        if (this.selectedInvoiceForView && this.selectedInvoiceForView._id === invoiceId) {
          this.selectedInvoiceForView.statuses = 'Paid';
        }
      },
      error: (err) => {
        this.spinner.hide();
        console.error(err);
        this.toastr.error('Error updating invoice status');
      }
    });
  }
}
