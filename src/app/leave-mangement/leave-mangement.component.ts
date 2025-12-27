import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/code-mentore.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { LeaveFormComponent } from './leave-form/leave-form.component';
import Swal from 'sweetalert2';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-leave-mangement',
  imports: [CommonModule,FormsModule,NgxSpinnerModule],
  templateUrl: './leave-mangement.component.html',
  styleUrl: './leave-mangement.component.css'
})
export class LeaveMangementComponent implements OnInit {
approvedLeaves=0;
pendingRequests=0;
rejectedLeaves=0;
leaves:any=[]
modalRef!: NgbModalRef;

  // Pagination
  page: number = 1;
  limit: number = 5;
  totalPages: number = 0;
  totalLeaves: number = 0;

  get startEntry(): number {
    return this.totalLeaves === 0 ? 0 : (this.page - 1) * this.limit + 1;
  }

  get endEntry(): number {
    return Math.min(this.page * this.limit, this.totalLeaves);
  }

constructor(private svc: EmployeeService,   private modalService: NgbModal,private spinner: NgxSpinnerService,private toastr: ToastrService){}


ngOnInit(){
  this.allLeave()
}

allLeave(){
  this.spinner.show();
  this.svc.getAllLeaves(this.page, this.limit).subscribe({
    next:(res)=>{
      if (res && res.data) {
        this.leaves = res.data;
        this.totalLeaves = res.total || res.totalItems || (res.totalPages ? res.totalPages * this.limit : this.leaves.length);
        this.totalPages = res.totalPages || Math.ceil((this.totalLeaves || this.leaves.length) / this.limit) || 1;
      } else if (Array.isArray(res)) {
        const all = res;
        this.totalLeaves = all.length;
        this.totalPages = Math.ceil(this.totalLeaves / this.limit) || 1;
        const start = (this.page - 1) * this.limit;
        this.leaves = all.slice(start, start + this.limit);
      } else {
        this.leaves = [];
        this.totalLeaves = 0;
        this.totalPages = 0;
      }

      this.approvedLeaves = this.leaves.filter((leave: any) => leave.status === 'Approved').length;
      this.pendingRequests = this.leaves.filter((leave: any) => leave.status === 'Pending').length;
      this.rejectedLeaves = this.leaves.filter((leave: any) => leave.status === 'Rejected').length;
      this.spinner.hide();

    },
    error:(err)=>{
      this.spinner.hide();
      console.log(err)
    }
  })
}

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) {
      this.page = p;
      this.allLeave();
    }
  }

  prevPage() {
    if (this.page > 1) this.goToPage(this.page - 1);
  }

  nextPage() {
    if (this.page < this.totalPages) this.goToPage(this.page + 1);
  }


approvalUpdateLeave(leave: any) {
    this.svc.updateLeaves(leave._id, { status: leave.status }).subscribe({
      next: (res: any) => {
        this.toastr.success(`Leave ${leave.status} successfully!`);
      },
      error: (err) => {
        this.toastr.error('Failed to update leave');
        console.error(err);
      }
    });
  }

approveLeave(leave: any) {
  Swal.fire({
    title: 'Are you sure?',
    text: `You are about to approve leave for "${leave.employeeName}"`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, approve it!',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
       this.spinner.show();
      leave.status = 'Approved';
      this.approvalUpdateLeave(leave);
      this.allLeave();
      this.spinner.hide();
      this.toastr.success(`Leave approved successfully!`);
    }
  });
}

rejectLeave(leave: any) {
  Swal.fire({
    title: 'Are you sure?',
    text: `You are about to reject leave for "${leave.employeeName}"`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, reject it!',
    cancelButtonText: 'Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
       this.spinner.show();
      leave.status = 'Rejected';
      this.approvalUpdateLeave(leave);
      this.allLeave();
      this.spinner.hide();
      this.toastr.success(`Leave rejected!`);
    }
  });
}


onApplyLeave() {
  this.spinner.show();
  this.openProductModal();
  this.spinner.hide();
}
 openProductModal() {
    this.modalRef = this.modalService.open(LeaveFormComponent, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      scrollable: true,
    });



    //  After modal closes, refresh lists
    this.modalRef.result.finally(() => {
      this.allLeave();
    });
  }
}