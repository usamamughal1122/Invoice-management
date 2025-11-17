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

constructor(private svc: EmployeeService,   private modalService: NgbModal,private spinner: NgxSpinnerService,private toastr: ToastrService){}


ngOnInit(){
  this.allLeave()
}

allLeave(){
  this.spinner.show();
  this.svc.getAllLeaves().subscribe({
    next:(res)=>{
      this.leaves=res.data
      this.approvedLeaves=res.data.filter((leave: any) => leave.status === 'Approved').length
       this.pendingRequests=res.data.filter((leave: any) => leave.status === 'Pending').length
      this.rejectedLeaves=res.data.filter((leave: any) => leave.status === 'Rejected').length
     this.spinner.hide();
     
    },
    error:(err)=>{
      this.spinner.hide();
      console.log(err)
    }
  })
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