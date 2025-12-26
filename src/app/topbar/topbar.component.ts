import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ThemeService } from '../../services/theme.service';

import { Subscription } from 'rxjs';
import { AppNotification, NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, FormsModule, NgxSpinnerModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  currentYear = new Date().getFullYear();
  showNotifications = false;
  notifications: AppNotification[] = [];
  unreadCount = 0;
  private subs: Subscription[] = [];
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private themeSvc: ThemeService,
    private elRef: ElementRef,
    private notif: NotificationService
  ) {}

  @Input() theme: 'light' | 'dark' = 'light';
  @Output() themeChange = new EventEmitter<'light' | 'dark'>();

  userEmail: string = '';
  showUserMenu = false;

  ngOnInit() {
    this.userEmail = localStorage.getItem('email') || '';
    // subscribe to global theme
    this.themeSvc.theme.subscribe(t => {
      this.theme = t;
      this.isDarkMode = t === 'dark';
    });

    // notifications
    const s1 = this.notif.notifications$.subscribe(list => {
      this.notifications = list;
      this.unreadCount = list.filter(n => !n.read).length;
    });
    this.subs.push(s1);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleNotifications(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.showNotifications = !this.showNotifications;
  }

  markAllNotificationsRead() {
    this.notif.markAllRead();
    this.unreadCount = 0;
  }

  markAsRead(n: AppNotification, event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (!n.read) this.notif.markRead(n.id);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(evt: MouseEvent) {
    const target = evt.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      this.showUserMenu = false;
      this.showNotifications = false;
    }
  }

  toggleTheme() {
    // Use global theme service to toggle site-wide
    this.themeSvc.toggle();
    // Emit so parent components (if using Input/Output) remain in sync
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.theme = newTheme;
    this.themeChange.emit(this.theme);
  }

  logout() {
    this.spinner.show();

    // Remove localStorage data
    localStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
    localStorage.removeItem('email');

    setTimeout(() => {
      this.spinner.hide();
      this.router.navigate(['/login']);
      this.toastr.success('Logged out successfully');
    }, 3000);
  }
}

// 🧹 Delete all products (backend only)
// app.delete("/api/products", async (req, res) => {
//   try {
//     const result = await Product.deleteMany({});
//     res.status(200).json({
//       message: "All products deleted successfully",
//       deletedCount: result.deletedCount,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
