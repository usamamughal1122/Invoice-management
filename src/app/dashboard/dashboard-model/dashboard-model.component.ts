import { CommonModule, DatePipe } from '@angular/common';
import { Component, DoCheck, effect, Input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard-model',
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard-model.component.html',
  styleUrl: './dashboard-model.component.css'
})
export class DashboardModelComponent  {
 dataSignals = signal<any>(null); // receive inventory item

   count = signal(0);
   normalCount = 0;
  constructor(public activeModal: NgbActiveModal) {
    effect(() => {
      console.log('counts',this.count());
    })
  }


   increament(){
   // this.normalCount=this.normalCount+1;
    this.count.set(this.count()+1);
   }
   



}
