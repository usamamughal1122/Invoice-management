import { Routes } from '@angular/router';
import { SessionListComponent } from './session-list/session-list.component';
import { InterviewComponent } from './interview/interview.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeaveMangementComponent } from './leave-mangement/leave-mangement.component';
import { TechInventoryComponent } from './tech-inventory/tech-inventory.component';
import { IssueRequestsComponent } from './issue-requests/issue-requests.component';
import { RequestManagmentComponent } from './request-managment/request-managment.component';
import { DeparmentManagmentComponent } from './deparment-managment/deparment-managment.component';
import { SuppliersManagmentComponent } from './suppliers-managment/suppliers-managment.component';
import { BrandComponent } from './brands/brands.component';
import { CategoryComponent } from './category/category.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { ClientComponent } from './client/client.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from '../auth.guard';
import { SettingComponent } from './setting/setting.component';
import { LowStockComponent } from './low-stock/low-stock.component';
import { TransactionsComponent } from './invoice/transactions/transactions.component';

export const routes: Routes = [
  // Default route (redirects to sessions)
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Your main route
  { path: 'login', component: LoginComponent },
  { path: 'sessions', component: SessionListComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  { path: 'leaveManagement', component: LeaveMangementComponent,canActivate: [AuthGuard] },
  { path: 'techInventory', component: TechInventoryComponent,canActivate: [AuthGuard] },
  { path: 'brands', component: BrandComponent,canActivate: [AuthGuard] },
   { path: 'categories', component: CategoryComponent,canActivate: [AuthGuard] },
   { path: 'client', component: ClientComponent,canActivate: [AuthGuard] },
   
  //{ path: 'issueRequests', component: IssueRequestsComponent },
  //{ path: 'requestManagment', component: RequestManagmentComponent },
  // { path: 'departments', component: DeparmentManagmentComponent },
  {path: 'invoice', component: InvoiceComponent,canActivate: [AuthGuard]},
   {path: 'suppliers', component: SuppliersManagmentComponent,canActivate: [AuthGuard]},
   {path: 'lowStock', component: LowStockComponent,canActivate: [AuthGuard]},
   {path: 'transactions', component: TransactionsComponent,canActivate: [AuthGuard]},
   {path: 'settings', component: SettingComponent,canActivate: [AuthGuard]},

  { path: '**', redirectTo: 'login' },
];
