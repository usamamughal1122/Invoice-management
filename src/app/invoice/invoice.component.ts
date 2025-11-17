import { Component, ElementRef } from '@angular/core';
import { InvoiceFormComponent } from './invoice-form/invoice-form.component';
import { EmployeeService } from '../../services/code-mentore.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-invoice',
  imports: [CommonModule,FormsModule,NgxSpinnerModule,ReactiveFormsModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent {
   clients: any[] = [];
  inventoryList: any[] = [];
  invoiceItems: any[] = [];
  invoice: any[] = [];

  selectedClient: any = null;
  taxPercent = 0;

  purchaseDate: any = null;
  wrantyExpiry: any = null;

  subtotal = 0;
  taxAmount = 0;
  total = 0;

  addClientForm!: FormGroup;
 today: any = new Date();

  constructor(
    private fb: FormBuilder,
    private svc: EmployeeService,
    private modal: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadInventory();
    this.loadInvoice();

    this.addClientForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  // ============================
  //  Load Clients with Spinner
  // ============================
  loadClients() {
    this.spinner.show();
    this.svc.getClients().subscribe({
      next: (res) => {
        this.clients = res.data;
        this.spinner.hide();
      },
      error: (err) => {
        console.error(err);
        this.spinner.hide();
      }
    });
  }

  // ==============================
  //  Load Inventory with Spinner
  // ==============================
  loadInventory() {
    this.spinner.show();
    this.svc.getInventory().subscribe({
      next: (res) => {
        this.inventoryList = res.data;
        this.spinner.hide();
      },
      error: (err) => {
        console.error(err);
        this.spinner.hide();
      }
    });
  }

  // ============================
  //  Load Invoices with Spinner
  // ============================
  loadInvoice() {
    this.spinner.show();
    this.svc.getInvoices().subscribe({
      next: (res) => {
        this.invoice = res.data;
        this.spinner.hide();
      },
      error: (err) => {
        console.error(err);
        this.spinner.hide();
      }
    });
  }

  // ============================
  //  Open Add Client Modal
  // ============================
  openAddClient(modalRef: any) {
    this.addClientForm.reset();
    this.modal.open(modalRef, { centered: true });
  }

  saveClient(modalRef: any) {
    if (this.addClientForm.invalid) return;

    this.spinner.show();
    this.svc.addClient(this.addClientForm.value).subscribe({
      next: (res) => {
        this.spinner.hide();
        this.loadClients();
        this.selectedClient = res.data._id;
        modalRef.close();
        Swal.fire('Success', 'Client added successfully!', 'success');
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to add client', 'error');
      }
    });
  }

  // ============================
  //  Open Inventory Modal
  // ============================
  openInventoryModal(modalRef: any) {
    this.spinner.show();
    setTimeout(() => {
      this.modal.open(modalRef, { size: 'lg', centered: true });
      this.spinner.hide();
    }, 400);
  }

  // ============================
  //  Select Inventory Item
  // ============================
  selectInventoryItem(item: any, modalRef: any) {
    const exists = this.invoiceItems.find(x => x._id === item._id);
    if (exists) {
      Swal.fire('Warning', 'Item already added.', 'warning');
      return;
    }

    this.invoiceItems.push({
      _id: item._id,
      name: item.name,
      availableQty: item.quantity_available,
      price: item.price,
      quantity: 0,
      subtotal: item.price,
      purchaseDate: item.purchaseDate,
      warrantyExpiry: item.warrantyExpiry
    });

    this.updateTotals();
    modalRef.close();
  }

  onQuantityChange(item: any, qty: number) {
    if (qty > item.availableQty) {
      Swal.fire('Warning', `Only ${item.availableQty} available`, 'warning');
      item.quantity = item.availableQty;
    }
    item.subtotal = item.price * item.quantity;
    this.updateTotals();
  }

  removeItem(i: number) {
    Swal.fire({
      title: 'Remove this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
    }).then(result => {
      if (result.isConfirmed) {
        this.invoiceItems.splice(i, 1);
        this.updateTotals();
        Swal.fire('Removed!', 'Item removed.', 'success');
      }
    });
  }

  updateTotals() {
    this.subtotal = this.invoiceItems.reduce((a, b) => a + b.subtotal, 0);
    this.taxAmount = (this.subtotal * this.taxPercent) / 100;
    this.total = this.subtotal + this.taxAmount;
  }

  // ============================
  //  Create Invoice (with spinner)
  // ============================
  saveInvoice() {
    if (!this.selectedClient) {
      Swal.fire('Error', 'Please select a client', 'error');
      return;
    }
    if (this.invoiceItems.length === 0) {
      Swal.fire('Error', 'Please add at least one item', 'error');
      return;
    }

    const payload = {
      client: this.selectedClient,
      taxPercent: this.taxPercent,
      purchaseDates: this.purchaseDate,
      warrantyExpirys: this.wrantyExpiry,
      items: this.invoiceItems.map(i => ({
        inventory: i._id,
        price: i.price,
        quantity: i.quantity,
        purchaseDate: this.purchaseDate,
        warrantyExpiry: this.wrantyExpiry
      }))
    };

    this.spinner.show();

    this.svc.createInvoice(payload).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.spinner.hide();
          Swal.fire('Success', 'Invoice created successfully!', 'success');

          this.invoiceItems = [];
          this.taxPercent = 0;
          this.purchaseDate = null;
          this.wrantyExpiry = null;
          this.selectedClient = null;
          this.updateTotals();

          this.loadClients();
          this.loadInvoice();

          this.toastr.success('Invoice created successfully!');
          this.modal.dismissAll();
        }, 300);
      },
      error: (err) => {
        this.spinner.hide();
        Swal.fire('Error', err.error?.message || 'Error saving invoice', 'error');
        this.toastr.error('Error saving invoice');
      }
    });
  }

  // ============================
  //  Download PDF
  // ============================
  downloadPDF(invoiceCard: HTMLDivElement, invoiceNumber: string) {
    const downloadBtn = invoiceCard.querySelector('button');

    if (downloadBtn) downloadBtn.style.display = 'none';

    html2canvas(invoiceCard, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`invoice-${invoiceNumber}.pdf`);

      if (downloadBtn) downloadBtn.style.display = 'inline-block';
    });
  }

}
  

