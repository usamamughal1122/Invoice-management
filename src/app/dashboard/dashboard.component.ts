import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

// Import Chart.js types
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { EmployeeService } from '../../services/code-mentore.service';
import { DashboardModelComponent } from './dashboard-model/dashboard-model.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionListComponent } from "../session-list/session-list.component";
import { NgChartsModule } from 'ng2-charts';
import { CountUpDirective } from '../shared/count-up.directive';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, NgxSpinnerModule, SessionListComponent, NgChartsModule, CountUpDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardList: any[] = [];
  recentRequests: any[] = [];
  topProducts: any[] = [];
  brandsList: any[] = [];
  categoryList: any[] = [];
  suppliersList: any[] = [];
  invoices: any[] = [];
  statuses: string[] = [
    'Draft',
    'Pending',
    'Sent',
    'Paid',
    'Unpaid',
    'Overdue',
    'Cancelled'
  ];
  isLoading = true;
  totalSales: number = 0;
  totalPurchase: number = 0;
  totalSoldItems: number = 0;
  isMouseOver = false;

  //  CHART DATA 

  statusChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#ff991cff', '#35e6f3ff', '#ffc107', '#6c757d', '#dc3545'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  categoryChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Items per Category',
      data: [],
      backgroundColor: 'rgba(254, 159, 67)',
      borderColor: 'rgba(254, 159, 67)',
      borderWidth: 1
    }]
  };

  brandChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56',
        '#4BC0C0', '#9966FF', '#FF9F40',
        '#FF6384', '#C9CBCF'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

 
  //  CHART OPTIONS 

  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right' } }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => 'PKR ' + value.toLocaleString()
        }
      }
    }
  };

  //  CONSTRUCTOR 

  constructor(
    private svc: EmployeeService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService
  ) {}

  //  INIT 

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadInvoices();  
    this.brands();
    this.category();
    this.allSuppliers();
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  //  LOAD DATA 

  loadDashboardData() {
    this.spinner.show();

    this.svc.getInventory().subscribe((res: any) => {
      this.spinner.hide();
     console.log('Dashboard List:', this.dashboardList);
      this.dashboardList = res?.data || [];
      
      this.calculateTotals();
      this.prepareChartData();

      // Force chart refresh
      this.statusChartData = { ...this.statusChartData };
      this.categoryChartData = { ...this.categoryChartData };
      this.brandChartData = { ...this.brandChartData };
      

      // Top products
      this.topProducts = this.dashboardList
        .filter(p => p.quantity_total >= 10)
        .sort((a, b) => b.quantity_total - a.quantity_total)
        .slice(0, 10);
    });
  }

  //  CALCULATE TOTALS 

  calculateTotals() {
    let purchase = 0;
    let sales = 0;
    let soldItems = 0;

    this.dashboardList.forEach(item => {
      const price = item.price || 0;
      const totalQty = item.quantity_total || 0;
      const availableQty = item.quantity_available || 0;

      const sold = totalQty - availableQty;

      purchase += price * totalQty;
      sales += sold * price;
      soldItems += sold;
    });

    this.totalPurchase = purchase;
    this.totalSales = sales;
    this.totalSoldItems = soldItems;
  }

  //  PREPARE CHART DATA 

  prepareChartData() {

    // Status Chart
    const statusMap: any = {};
    this.dashboardList.forEach(item => {
      const status = item.status || 'Unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    this.statusChartData.labels = Object.keys(statusMap);
    this.statusChartData.datasets[0].data = Object.values(statusMap);

    // Category Chart
    const categoryMap: any = {};
    this.dashboardList.forEach(item => {
      const cat = item.category?.category || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const catSorted = Object.entries(categoryMap).sort((a: any, b: any) => b[1] - a[1]);
    this.categoryChartData.labels = catSorted.map(c => c[0]);
    this.categoryChartData.datasets[0].data = catSorted.map(c => c[1] as number);

    // Brand Chart
    const brandMap: any = {};
    this.dashboardList.forEach(item => {
      const brand = item.brand?.brand || 'Unknown';
      brandMap[brand] = (brandMap[brand] || 0) + 1;
    });

    const brandSorted = Object.entries(brandMap).sort((a: any, b: any) => b[1] - a[1]);
    this.brandChartData.labels = brandSorted.map(b => b[0]);
    this.brandChartData.datasets[0].data = brandSorted.map(b => b[1] as number);

    // Sales Vs Purchase Monthly Trend
    const monthMap: any = {};

    this.dashboardList.forEach(item => {
      const date = new Date(item.purchaseDate);
      const m = date.toLocaleString('default', { month: 'short' });

      if (!monthMap[m]) {
        monthMap[m] = { sale: 0, purchase: 0 };
      }

      const price = item.price || 0;
      const totalQty = item.quantity_total || 0;
      const availQty = item.quantity_available || 0;
      const sold = totalQty - availQty;

      monthMap[m].purchase += price * totalQty;
      monthMap[m].sale += sold * price;
    });

    const months = Object.keys(monthMap);

  }

  //  OTHER METHODS 

  brands() {
    this.svc.getBrands().subscribe({
      next: (res: any) => this.brandsList = res?.data || []
    });
  }

  category() {
    this.svc.getcategory().subscribe({
      next: (res: any) => this.categoryList = res?.data || []
    });
  }

  allSuppliers() {
    this.svc.allSuppliers().subscribe({
      next: (res: any) => this.suppliersList = res?.data || []
    });
  }

  viewItem(item: any) {
    const modalRef = this.modalService.open(DashboardModelComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.componentInstance.dataSignals.set(item);
  }

  reloadDashboard() {
    this.spinner.show();
    this.svc.getInventory().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.dashboardList = res?.data || [];
        this.prepareChartData();
        this.calculateTotals();
      }
    });
  }

  countStatus(status: string): number {
    return this.dashboardList.filter((i) => i.status === status).length;
  }

 AllEmployes(data: any): void {
    this.recentRequests = data || [];
  }

  loadInvoices() {
  this.svc.getInvoices(1, 1000).subscribe((res: any) => {
    this.invoices = res.data || [];
    this.calculateInvoiceTotals();
  });
}

calculateInvoiceTotals() {
  let sales = 0;
  let soldItems = 0;

  this.invoices.forEach((inv: any) => {
    inv.items?.forEach((item: any) => {
      const price = item.price || 0;
      const qty = item.quantity || 0;

      sales += price * qty;
      soldItems += qty;
    });
  });

  this.totalSales = sales;           // dashboard ka Total Sales
  this.totalSoldItems = soldItems;   // Sold items
}

// Add these methods to your DashboardComponent class

getTotalInvoiceAmount(): number {
  return this.invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
}

getPaidAmount(): number {
  return this.invoices
    .filter(invoice => invoice.statuses === 'Paid')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
}

getUnpaidAmount(): number {
  return this.invoices
    .filter(invoice => invoice.statuses !== 'Paid')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
}
onMouseEnter() {
    this.isMouseOver = true;
  }

  onMouseLeave() {
    this.isMouseOver = false;
  }
  items = [
  { id: 1, name: 'A', status: 'active' },
  { id: 2, name: 'B', status: 'inactive' },
  { id: 3, name: 'C', status: 'active' }
];

activeStatus = this.items.filter(item=> item.status === 'active');

users = [
  { id: 2, name: 'Ali' },
  { id: 5, name: 'Usama' },
  { id: 9, name: 'Sara' }
];
getUserNames(): string[] {
  return this.users.filter(user => user.id === 5) .map(user => user.name);

}

usersList = [
  { name: 'Ali', active: true },
  { name: 'Usama', active: true },
  { name: 'Bilal', active: false }
];
userActiveNames(): string[] {
  return this.usersList
    .filter(user => user.active)
    .map(user => user.name);
}
}