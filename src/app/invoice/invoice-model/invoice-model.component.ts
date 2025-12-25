import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../services/code-mentore.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-invoice-model',
  imports: [CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './invoice-model.component.html',
  styleUrl: './invoice-model.component.css'
})
export class InvoiceModelComponent {
@Input() modal: any;
@Output() invoiceCreated = new EventEmitter<void>();

  // Data Arrays
  clients: any[] = [];
  inventoryList: any[] = [];
  invoiceItems: any[] = [];
  filteredInventoryList: any[] = [];

  statuses: string[] = [
    'Pending',
  ];

  // Form & Selection
  addClientForm!: FormGroup;
  selectedClient: any = null;
  selectedStatus: string = 'Pending';
  
  // Invoice Details
  taxPercent = 0;
  purchaseDate: any = null;
  wrantyExpiry: any = null;
  
  // Calculations
  subtotal = 0;
  taxAmount = 0;
  total = 0;
  
  // UI State
  currentEditingRowIndex: number = -1;
  inventorySearchText: string = '';
  today: any = new Date();

  constructor(
    private fb: FormBuilder,
    private svc: EmployeeService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadInventory();
    
    this.addClientForm = this.fb.group({
      name: ['', Validators.required]
    });
    
    this.addNewRow();
  }

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

  // CLIENT MANAGEMENT
  openAddClient(modalRef: any) {
    this.addClientForm.reset();
    this.modalService.open(modalRef, { centered: true });
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

  // INVOICE ITEMS MANAGEMENT
  addNewRow() {
    this.invoiceItems.push({
      _id: null,
      inventory: null,
      name: '',
      price: 0,
      quantity: 1,
      availableQty: null,
      subtotal: 0,
      isCustom: true
    });
  }

  removeRow(index: number) {
    Swal.fire({
      title: 'Remove this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      confirmButtonColor: '#d4af37',
      cancelButtonColor: '#666'
    }).then(result => {
      if (result.isConfirmed) {
        this.invoiceItems.splice(index, 1);
        this.updateTotals();
      }
    });
  }

  calculateRowSubtotal(item: any) {
    item.subtotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
    this.updateTotals();
  }

  updateTotals() {
    this.subtotal = this.invoiceItems.reduce((sum, item) => 
      sum + (Number(item.subtotal) || 0), 0
    );
    this.taxAmount = (this.subtotal * Number(this.taxPercent || 0)) / 100;
    this.total = this.subtotal + this.taxAmount;
  }

  validateItemName(item: any) {
    if (!item.name || item.name.trim() === '') {
      this.toastr.warning('Please enter an item name');
    }
  }

  // INVENTORY MODAL
  openQuickInventoryModal(modalRef: any, rowIndex: number) {
    this.currentEditingRowIndex = rowIndex;
    this.inventorySearchText = '';
    this.filteredInventoryList = [...this.inventoryList];
    this.modalService.open(modalRef, { size: 'xl', centered: true });
  }

  filterInventory() {
    const search = this.inventorySearchText.toLowerCase().trim();
    this.filteredInventoryList = !search ? [...this.inventoryList] :
      this.inventoryList.filter(inv => 
        inv.name.toLowerCase().includes(search) ||
        inv.sku?.toLowerCase().includes(search) ||
        inv.serialNumber?.toLowerCase().includes(search)
      );
  }

  selectFromInventory(inv: any, modalRef: any) {
    if (this.currentEditingRowIndex === -1) {
      this.toastr.error('Invalid row selection');
      return;
    }

    const exists = this.invoiceItems.find((item, idx) => 
      idx !== this.currentEditingRowIndex && item._id === inv._id
    );
    
    if (exists) {
      Swal.fire('Warning', 'This item is already added', 'warning');
      return;
    }

    this.invoiceItems[this.currentEditingRowIndex] = {
      _id: inv._id,
      inventory: inv._id,
      name: inv.name,
      price: inv.price || 0,
      quantity: 1,
      availableQty: inv.quantity_available,
      subtotal: inv.price || 0,
      isCustom: false,
      sku: inv.sku,
      serialNumber: inv.serialNumber
    };

    this.calculateRowSubtotal(this.invoiceItems[this.currentEditingRowIndex]);
    modalRef.close();
    this.toastr.success('Item added from inventory');
  }

  // SAVE INVOICE
  saveInvoice() {
    // Validations
    if (!this.selectedClient) {
      Swal.fire('Error', 'Please select a client', 'error');
      return;
    }

    if (this.invoiceItems.length === 0) {
      Swal.fire('Error', 'Please add at least one item', 'error');
      return;
    }

    const invalidItems = this.invoiceItems.filter(item => 
      !item.name?.trim() || !item.price || item.price <= 0 || 
      !item.quantity || item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      Swal.fire('Error', 'Please fill in all item details', 'error');
      return;
    }

    // Check inventory availability
    for (const item of this.invoiceItems) {
      if (!item.isCustom && item.availableQty !== null && 
          item.quantity > item.availableQty) {
        Swal.fire('Warning', 
          `Only ${item.availableQty} units available for "${item.name}"`, 
          'warning'
        );
        return;
      }
    }

    // Check if there are custom items
    const customItems = this.invoiceItems.filter(item => item.isCustom);
    
    // Show confirmation if custom items exist
    if (customItems.length > 0) {
      const customItemsList = customItems.map(i => i.name).join(', ');
      Swal.fire({
        title: 'New Items Detected',
        html: `The following items will be added to inventory:<br><br><strong>${customItemsList}</strong><br><br>Continue?`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Yes, Create Invoice',
        confirmButtonColor: '#d4af37',
        cancelButtonColor: '#666'
      }).then(result => {
        if (result.isConfirmed) {
          this.submitInvoice();
        }
      });
    } else {
      this.submitInvoice();
    }
  }

  submitInvoice() {
    const payload = {
      client: this.selectedClient,
      taxPercent: this.taxPercent || 0,
      purchaseDates: this.purchaseDate,
      warrantyExpirys: this.wrantyExpiry,
      statuses: this.selectedStatus,
      items: this.invoiceItems.map(item => ({
        inventory: item.inventory,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        isCustom: item.isCustom
      }))
    };

    this.spinner.show();
    this.svc.createInvoice(payload).subscribe({
      next: (res) => {
        this.spinner.hide();
        
        const customCount = this.invoiceItems.filter(i => i.isCustom).length;
        const message = customCount > 0 
          ? `Invoice created! ${customCount} new item(s) added to inventory.`
          : 'Invoice created successfully!';
        
        Swal.fire('Success', message, 'success');
        this.toastr.success(message);
        
        // Close modal and emit event
        this.modal.close();
        this.invoiceCreated.emit();
      },
      error: (err) => {
        this.spinner.hide();
        Swal.fire('Error', err.error?.message || 'Error saving invoice', 'error');
        this.toastr.error('Error saving invoice');
      }
    });
  }

  // Cancel and close modal
  cancel() {
    if (this.invoiceItems.length > 0 && this.invoiceItems.some(i => i.name || i.price || i.quantity > 1)) {
      Swal.fire({
        title: 'Discard Changes?',
        text: 'You have unsaved changes. Are you sure you want to cancel?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Discard',
        cancelButtonText: 'No, Continue Editing',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#d4af37'
      }).then(result => {
        if (result.isConfirmed) {
          this.modal.dismiss();
        }
      });
    } else {
      this.modal.dismiss();
    }
  }
  
}
