import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-deparment-managment',
  imports: [CommonModule,FormsModule],
  templateUrl: './deparment-managment.component.html',
  styleUrl: './deparment-managment.component.css'
})
export class DeparmentManagmentComponent {
departmentList=[
  {
    id: 1,
    name: 'IT',
    head: 'John Doe',
    members: ['John Doe', 'Jane Smith', 'Bob Johnson'],
    status: 'Active'
  },
  {
    id: 2,
    name: 'HR',
    head: 'Jane Smith',
    members: ['John Doe', 'Jane Smith', 'Bob Johnson'],
    status: 'Inactive'
  },
  {
    id: 3,
    name: 'Sales',
    head: 'Bob Johnson',
    members: ['John Doe', 'Jane Smith', 'Bob Johnson'],
    status: 'Active'
  }
]
}
