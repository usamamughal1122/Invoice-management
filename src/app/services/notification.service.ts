import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  createdAt: string;
  read?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this._notifications.asObservable();

  constructor() {
    // seed with a couple of demo notifications (can be removed later)
    const demo: AppNotification[] = [
      {
        id: this._id(),
        title: 'Invoice #INV-1024 Paid',
        message: 'Invoice INV-1024 was paid successfully.',
        type: 'success',
        createdAt: new Date().toISOString(),
        read: false,
      },
      {
        id: this._id(),
        title: 'Low stock: Printer Paper',
        message: 'Inventory for "Printer Paper" fell below threshold (3 left).',
        type: 'warning',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        read: false,
      },
    ];
    this._notifications.next(demo);
  }

  getAll(): AppNotification[] {
    return this._notifications.getValue();
  }

  add(notification: Partial<AppNotification>) {
    const n: AppNotification = {
      id: this._id(),
      title: notification.title || 'Notification',
      message: notification.message || '',
      type: notification.type || 'info',
      createdAt: notification.createdAt || new Date().toISOString(),
      read: notification.read || false,
    };
    this._notifications.next([n, ...this.getAll()]);
    return n;
  }

  markAllRead() {
    const updated = this.getAll().map(n => ({ ...n, read: true }));
    this._notifications.next(updated);
  }

  markRead(id: string) {
    const updated = this.getAll().map(n => (n.id === id ? { ...n, read: true } : n));
    this._notifications.next(updated);
  }

  delete(id: string) {
    this._notifications.next(this.getAll().filter(n => n.id !== id));
  }

  unreadCount(): number {
    return this.getAll().filter(n => !n.read).length;
  }

  // helper to create IDs
  private _id() {
    return Math.random().toString(36).slice(2, 9);
  }

  // Convenience specialized triggers
  notifyInvoicePaid(invoiceNumber: string) {
    this.add({
      title: `Invoice #${invoiceNumber} Paid`,
      message: `Invoice ${invoiceNumber} received payment.`,
      type: 'success',
    });
  }

  notifyLowStock(item: string, qty?: number) {
    this.add({
      title: `Low stock: ${item}`,
      message: `${item} is low${qty ? ` (only ${qty} left)` : ''}.`,
      type: 'warning',
    });
  }
}
