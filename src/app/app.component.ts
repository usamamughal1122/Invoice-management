import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { InterviewComponent } from './interview/interview.component';
import { TopbarComponent } from "./topbar/topbar.component";
import { SidebarComponent } from './sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { LeaveMangementComponent } from './leave-mangement/leave-mangement.component';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet, TopbarComponent,SidebarComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'EMS';
  constructor(private router: Router) {}

    isLeftSidebarCollapsed = signal<boolean>(false);

  toggleSidebar() {
    this.isLeftSidebarCollapsed.set(!this.isLeftSidebarCollapsed());
  }

 isLoginPage(): boolean {
  console.log('Current URL:', this.router.url); // Add this to debug
  return this.router.url === '/login';
}
}
