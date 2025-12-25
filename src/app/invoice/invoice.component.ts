import { Component, ElementRef, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/code-mentore.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { InvoiceModelComponent } from './invoice-model/invoice-model.component';


import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NgSelectModule } from '@ng-select/ng-select';
import { StripePaymentComponent } from './stripe-payment/stripe-payment.component';

@Component({
  selector: 'app-invoice',
  imports: [CommonModule, FormsModule, NgxSpinnerModule, ReactiveFormsModule,NgSelectModule,InvoiceModelComponent],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css',
})
export class InvoiceComponent implements OnInit {

 // Data Arrays
  invoice: any[] = [];
  selectedInvoiceForView: any = null;
  
  // Pagination
  page: number = 1;
  limit: number = 5;
  totalPages: number = 0;
  today: any = new Date();

  constructor(
    private svc: EmployeeService,
    private modal: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getInvoices();
  }

  getInvoices() {
    this.spinner.show();
    this.svc.getInvoices(this.page, this.limit).subscribe({
      next: (res) => {
        this.invoice = res.data;
        this.totalPages = res.totalPages;
        this.spinner.hide();
      },
      error: (err) => {
        console.error(err);
        this.spinner.hide();
        this.toastr.error('Error loading invoices');
      }
    });
  }

  // email
sendInvoiceEmail(inv: any) {
  console.log("Full Invoice Object:", inv);

  const invoiceId =
    inv?._id ||
    inv?.id ||
    inv?.invoiceId ||
    inv?.invoice_id;

  console.log("Extracted Invoice ID:", invoiceId);

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



  // Pagination
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

  // Open Create Invoice Modal
  openCreateInvoiceModal(modalRef: any) {
    this.modal.open(modalRef, { 
      size: 'xl', 
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }

  // Handle invoice created callback
  onInvoiceCreated() {
    this.getInvoices();
  }

  // Open Invoice Details Modal
  openInvoiceDetailsModal(modalRef: any, invoice: any) {
    this.selectedInvoiceForView = invoice;
    this.modal.open(modalRef, { 
      size: 'xl', 
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }
// only Frountend Pdf genrate not backend inveloved

  // downloadModalPDF(modalContent: HTMLDivElement) {
  //   this.spinner.show();

  //   setTimeout(() => {
  //     const buttons = modalContent.querySelectorAll('.no-print');
  //     buttons.forEach((btn: any) => btn.style.display = 'none');

  //     html2canvas(modalContent, {
  //       scale: 2,
  //       useCORS: true,
  //       logging: false,
  //       backgroundColor: '#ffffff'
  //     }).then(canvas => {
  //       const imgData = canvas.toDataURL('image/png');
  //       const pdf = new jsPDF('p', 'mm', 'a4');
  //       const pdfWidth = pdf.internal.pageSize.getWidth();
  //       const pdfHeight = pdf.internal.pageSize.getHeight();
  //       const ratio = Math.min(
  //         pdfWidth / canvas.width, 
  //         pdfHeight / canvas.height
  //       );
  //       const imgX = (pdfWidth - canvas.width * ratio) / 2;

  //       pdf.addImage(
  //         imgData, 'PNG', imgX, 10, 
  //         canvas.width * ratio, canvas.height * ratio
  //       );
  //       pdf.save(`invoice-${this.selectedInvoiceForView.invoiceNumber}.pdf`);

  //       buttons.forEach((btn: any) => btn.style.display = '');
  //       this.spinner.hide();
  //       this.toastr.success('PDF downloaded successfully!');
  //     }).catch(err => {
  //       console.error('PDF error:', err);
  //       this.spinner.hide();
  //       this.toastr.error('Error generating PDF');
  //     });
  //   }, 300);
  // }

  downloadModalPDF(invoiceId: string) {
    this.svc.downloadPDF(invoiceId).subscribe(
      (res: Blob) => {
        // Create a temporary URL and trigger download
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

// Pay Now button se call hoga
openPaymentModal(invoice: any) {
  console.log('Invoice Total:', invoice.total); // 👈 Check this value
  console.log('Invoice Object:', invoice);
  if (invoice.statuses === 'Paid') {
    this.toastr.info('Invoice already paid');
    return;
  }

  const modalRef = this.modal.open(StripePaymentComponent, {
    centered: true,
    backdrop: 'static'
  });

  // Pass all required data including invoiceId
  modalRef.componentInstance.amount = invoice.total;
  modalRef.componentInstance.invoiceNumber = invoice.invoiceNumber;
  modalRef.componentInstance.invoiceId = invoice._id; // 👈 ADD THIS

  modalRef.result.then((result) => {
    if (result?.success) {
      this.updateInvoiceStatus(invoice._id);
    }
  });
}



updateInvoiceStatus(invoiceId: string) {
  this.spinner.show();

  // Pehle se bani API use ho rahi hai
  this.svc.updateInvoice(invoiceId, {
    statuses: 'Paid' // 👈 sirf ye change
  }).subscribe({
    next: () => {
      this.spinner.hide();
      this.toastr.success('Payment Successful');

      // Invoice list refresh
      this.getInvoices();

      // View modal me status update
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
    // Simulate backend payment verification and status update
    // In a real app, you would send the token to your backend here
    
    this.svc.updateInvoice(invoiceId, { statuses: 'Paid' }).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.toastr.success('Payment successful! Invoice marked as Paid.');
        
        // Update local state and close details modal if open
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