import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink,RouterLinkActive,CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
  
})
export class SidebarComponent {
dashboardOpen = false;
inventoryOpen = false;
masterDataOpen = false;
invoiceOpen = false;
employeesOpen = false;
settingsOpen = false;

toggleDashboard() { this.dashboardOpen = !this.dashboardOpen; }
toggleInventory() { this.inventoryOpen = !this.inventoryOpen; }
toggleMasterData() { this.masterDataOpen = !this.masterDataOpen; }
toggleInvoice() { this.invoiceOpen = !this.invoiceOpen; }
toggleEmployees() { this.employeesOpen = !this.employeesOpen; }
toggleSettings() { this.settingsOpen = !this.settingsOpen; }
}
