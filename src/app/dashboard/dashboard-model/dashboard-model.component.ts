import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard-model',
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard-model.component.html',
  styleUrl: './dashboard-model.component.css'
})
export class DashboardModelComponent {
@Input() data: any; // receive inventory item

  constructor(public activeModal: NgbActiveModal) {}
}
