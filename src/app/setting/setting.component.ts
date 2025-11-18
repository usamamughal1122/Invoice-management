import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-setting',
  imports: [CommonModule,FormsModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent {
[x: string]: any;
 section: string = 'general';
  theme: string = 'light';

  sections = [
    { key: 'general', label: 'General', icon: 'bi-gear' },
    { key: 'inventory', label: 'Inventory', icon: 'bi-box-seam' },
    { key: 'employees', label: 'Employees', icon: 'bi-people' },
    { key: 'notifications', label: 'Notifications', icon: 'bi-bell' },
  ];

  general = { companyName: '', logo: null as File | null, currency: 'PKR', timezone: 'Asia/Karachi' };
  inventory = { paginationLimit: 10, lowStockAlert: 5, codePrefix: 'INV-' };
  employees = { defaultRole: 'Employee', autoApproveLeave: false, strongPassword: true };
  notifications = { lowStock: true, newEmployee: false, email: true, sms: false };

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if(savedTheme){ this.theme = savedTheme; }
  }

  setSection(section: string){ this.section = section; }

  toggleTheme(){
    this.theme = this.theme==='light'?'dark':'light';
    localStorage.setItem('theme', this.theme);
  }

  inputStyle(){
    return {
      'background-color': this.theme==='dark'?'#222':'#fff',
      'color': this.theme==='dark'?'#eee':'#222',
      'border':'1px solid '+(this.theme==='dark'?'#555':'#ccc'),
      'padding':'6px',
      'border-radius':'4px',
      'width':'100%',
      'margin-top':'4px',
      'margin-bottom':'4px'
    };
  }

  onLogoUpload(event: any){ this.general.logo = event.target.files[0]; }

  saveGeneral(){ console.log('General:', this.general); alert('General saved!'); }
  saveInventory(){ console.log('Inventory:', this.inventory); alert('Inventory saved!'); }
  saveEmployees(){ console.log('Employees:', this.employees); alert('Employees saved!'); }
  saveNotifications(){ console.log('Notifications:', this.notifications); alert('Notifications saved!'); }

}
