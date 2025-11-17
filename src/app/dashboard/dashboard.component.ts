import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/code-mentore.service';
import { SessionListComponent } from '../session-list/session-list.component';
import { DashboardModelComponent } from './dashboard-model/dashboard-model.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SessionListComponent,NgxSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']  
})
export class DashboardComponent {

  dashboardList: any[] = [];     
  recentRequests: any[] = [];   
  topProducts: any[] = [];   
  brandsList: any[] = [];
  categoryList: any[] = [];
  suppliersList: any[] = [];
 isLoading = true;
  constructor(private svc: EmployeeService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.brands();
    this.category();
    this.allSuppliers();
    setTimeout(() => {
      this.isLoading = false;
    },4000)
  }

loadDashboardData() {
  this.spinner.show();
  this.svc.getInventory().subscribe((res: any) => {
    this.spinner.hide();
    this.dashboardList = res.data || [];

    // Filter products with quantity_total > 10 and take top 20
    this.topProducts = this.dashboardList
      .filter(p => p.quantity_total >= 10)
      .sort((a, b) => b.quantity_total - a.quantity_total) 
      .slice(0, 20);
  });
}
  reloadDashboard(): void {
    this.loadDashboardData();
  }


  reloadTopProducts(): void {
    this.svc.getInventory().subscribe({
      next: (res) => {
        this.dashboardList = res?.data || [];
      },
      error: (err) => console.error(' Error loading top products:', err)
    });
  }


  countStatus(status: string): number {
    return this.dashboardList.filter((i) => i.status === status).length;
  }


  AllEmployes(data: any): void {
    this.recentRequests = data || [];
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

viewItem(item: any) {
  this.spinner.show();
   const modalRef = 
   this.modalService.open(DashboardModelComponent, 
    { size: 'xl', backdrop: 'static' });
  modalRef.componentInstance.data = item;
  this.spinner.hide();   
 }
}
