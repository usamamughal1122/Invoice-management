import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { EmployeeService } from '../../services/code-mentore.service';

@Component({
  selector: 'app-client',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,NgxSpinnerModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent {
clientForm: FormGroup;
  clientsList: any[] = [];
activeClients: string[] = ['Ali Khan', 'Sara Ahmed', 'John Doe'];

  constructor(
    private fb: FormBuilder,
    private svc: EmployeeService,
    private spinner: NgxSpinnerService
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  addClient() {
    if (this.clientForm.invalid) return;

    this.spinner.show(); // show spinner when API starts

    this.svc.addClient(this.clientForm.value).subscribe({
      next: (res) => {
        console.log('✅ API Success:', res);
        this.clientsList.push(res); // optional if API returns new client
        this.clientForm.reset();
        this.spinner.hide(); // hide spinner after success
      },
      error: (err) => {
        console.error('❌ API Error:', err);
        alert('Failed to add client. Check console.');
        this.spinner.hide(); // hide spinner even on error
      },
    });
  }

  

  removeClient(index: number) {
    this.clientsList.splice(index, 1);
  }
}
