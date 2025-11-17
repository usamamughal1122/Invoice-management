import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-request-managment',
  imports: [CommonModule,FormsModule],
  templateUrl: './request-managment.component.html',
  styleUrl: './request-managment.component.css'
})
export class RequestManagmentComponent {
requestList=[
  {
    employee: 'John Doe',
    item: 'Laptop',
    department: 'IT',
    date: new Date(),
    status: 'Pending'
  },
  {
    employee: 'Jane Smith',
    item: 'Desktop',
    department: 'HR',
    date: new Date(),
    status: 'Approved'
  },
  {
    employee: 'Bob Johnson',
    item: 'Tablet',
    department: 'Marketing',
    date: new Date(),
    status: 'Rejected'
  }
]
}
