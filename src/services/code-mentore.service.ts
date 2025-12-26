import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  // private API_BASE = 'http://localhost:3000';
private API_BASE = 'http://invoice-management-backend-gamma.vercel.app';
  constructor(private http: HttpClient) {}

  private getRole(): string {
    return localStorage.getItem('role') || 'vendor';
  }

  private getUserIdParam(): HttpParams | null {
    const role = this.getRole();
    const uid = localStorage.getItem('uid');
    if (role === 'vendor') {
      return new HttpParams().set('userId', uid || '');
    }
    return null;
  }

  // Basic error handler
  private handleError(op = 'request') {
    return (err: any) => {
      console.error(`${op} failed:`, err);
      return throwError(() => err);
    };
  }

  // Roles / Products
  getRoles(): Observable<any> {
    const params = this.getUserIdParam();
    return this.http
      .get<any>(`${this.API_BASE}/api/products`, params ? { params } : {})
      .pipe(catchError(this.handleError('getRoles')));
  }

  addEmployee(payload: any): Observable<any> {
    if (this.getRole() === 'vendor') payload.userId = localStorage.getItem('uid');
    return this.http
      .post<any>(`${this.API_BASE}/api/products`, payload)
      .pipe(catchError(this.handleError('addEmployee')));
  }

  updateEmployee(id: string, payload: any): Observable<any> {
    return this.http
      .put<any>(`${this.API_BASE}/api/products/${id}`, payload)
      .pipe(catchError(this.handleError('updateEmployee')));
  }

  deleteProduct(id: string): Observable<any> {
    const params = this.getUserIdParam();
    return this.http
      .delete<any>(`${this.API_BASE}/api/products/${id}`, params ? { params } : {})
      .pipe(catchError(this.handleError('deleteProduct')));
  }

  category(): Observable<any> {
    const params = this.getUserIdParam();
    return this.http
      .get<any>(`${this.API_BASE}/api/product-categories`, params ? { params } : {})
      .pipe(catchError(this.handleError('category')));
  }

  // Leave Management
  getAllLeaves(): Observable<any> {
    const params = this.getUserIdParam();
    return this.http
      .get<any>(`${this.API_BASE}/api/leave-management`, params ? { params } : {})
      .pipe(catchError(this.handleError('getAllLeaves')));
  }

  addLeaves(payload: any): Observable<any> {
    if (this.getRole() === 'vendor') payload.userId = localStorage.getItem('uid');
    return this.http
      .post<any>(`${this.API_BASE}/api/leave-management`, payload)
      .pipe(catchError(this.handleError('addLeaves')));
  }

  updateLeaves(id: string, payload: any): Observable<any> {
    return this.http
      .put<any>(`${this.API_BASE}/api/leave-management/${id}`, payload)
      .pipe(catchError(this.handleError('updateLeaves')));
  }

  // Tech Inventory
  getInventory(page: number = 1, limit: number = 10): Observable<any> {
    let params = this.getUserIdParam() || new HttpParams();
    params = params.set('page', page.toString()).set('limit', limit.toString());
    return this.http
      .get<any>(`${this.API_BASE}/api/tech-inventory`, { params })
      .pipe(catchError(this.handleError('getInventory')));
  }

  addInventory(payload: any): Observable<any> {
    if (this.getRole() === 'vendor') payload.userId = localStorage.getItem('uid');
    return this.http
      .post<any>(`${this.API_BASE}/api/tech-inventory`, payload)
      .pipe(catchError(this.handleError('addInventory')));
  }

  updateInventory(id: string, payload: any): Observable<any> {
    return this.http
      .put<any>(`${this.API_BASE}/api/tech-inventory/${id}`, payload)
      .pipe(catchError(this.handleError('updateInventory')));
  }

  deleteInventory(id: string): Observable<any> {
    const params = this.getUserIdParam();
    return this.http
      .delete<any>(`${this.API_BASE}/api/tech-inventory/${id}`, params ? { params } : {})
      .pipe(catchError(this.handleError('deleteInventory')));
  }

  // Brands
  getBrands(): Observable<any> {
    const params = this.getUserIdParam();
    return this.http
      .get<any>(`${this.API_BASE}/api/tech-inventory-brands`, params ? { params } : {})
      .pipe(catchError(this.handleError('getBrands')));
  }

  addBrands(payload: any): Observable<any> {
    if (this.getRole() === 'vendor') payload.userId = localStorage.getItem('uid');
    return this.http
      .post<any>(`${this.API_BASE}/api/tech-inventory-brands`, payload)
      .pipe(catchError(this.handleError('addBrands')));
  }

  getcategory(): Observable<any> {
    const params = this.getUserIdParam();
    return this.http
      .get<any>(`${this.API_BASE}/api/tech-inventory-category`, params ? { params } : {})
      .pipe(catchError(this.handleError('getcategory')));
  }

  addCategory(payload: any): Observable<any> {
    if (this.getRole() === 'vendor') payload.userId = localStorage.getItem('uid');
    return this.http
      .post<any>(`${this.API_BASE}/api/tech-inventory-category`, payload)
      .pipe(catchError(this.handleError('addCategory')));
  }

  // Suppliers
  allSuppliers(): Observable<any> {
    const params = this.getUserIdParam();
    return this.http
      .get<any>(`${this.API_BASE}/api/tech-inventory-supplier`, params ? { params } : {})
      .pipe(catchError(this.handleError('allSuppliers')));
  }

  addSupplier(payload: any): Observable<any> {
    if (this.getRole() === 'vendor') payload.userId = localStorage.getItem('uid');
    return this.http
      .post<any>(`${this.API_BASE}/api/tech-inventory-supplier`, payload)
      .pipe(catchError(this.handleError('addSupplier')));
  }

  // Clients
  getClients(): Observable<any> {
    const params = this.getUserIdParam();
    return this.http
      .get<any>(`${this.API_BASE}/api/tech-inventory-client`, params ? { params } : {})
      .pipe(catchError(this.handleError('getClients')));
  }

  addClient(data: any): Observable<any> {
    if (this.getRole() === 'vendor') data.userId = localStorage.getItem('uid');
    return this.http
      .post<any>(`${this.API_BASE}/api/tech-inventory-client`, data)
      .pipe(catchError(this.handleError('addClient')));
  }

  // Invoices
  getInvoices(page: number = 1, limit: number = 10): Observable<any> {
    let params = this.getUserIdParam() || new HttpParams();
    params = params.set('page', page.toString()).set('limit', limit.toString());
    return this.http
      .get<any>(`${this.API_BASE}/api/invoices`, { params })
      .pipe(catchError(this.handleError('getInvoices')));
  }

  createInvoice(data: any): Observable<any> {
    if (this.getRole() === 'vendor') data.userId = localStorage.getItem('uid');
    return this.http
      .post<any>(`${this.API_BASE}/api/invoices`, data)
      .pipe(catchError(this.handleError('createInvoice')));
  }

  updateInvoice(id: string, payload: any): Observable<any> {
    return this.http
      .put<any>(`${this.API_BASE}/api/invoices/${id}`, payload)
      .pipe(catchError(this.handleError('updateInvoice')));
  }

  downloadPDF(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.API_BASE}/api/invoices/${id}/download`, { responseType: 'blob' as 'json' })
      .pipe(catchError(this.handleError('downloadPDF')));
  }

  sendInvoiceEmail(id: string) {
    return this.http
      .post<any>(`${this.API_BASE}/api/invoices/${id}/send-email`, {})
      .pipe(catchError(this.handleError('sendInvoiceEmail')));
  }

  // Low stock
  getLowStock(page: number = 1, limit: number = 10) {
    let params = this.getUserIdParam() || new HttpParams();
    params = params.set('page', page.toString()).set('limit', limit.toString()).set('lowStock', 'true');
    return this.http
      .get<any>(`${this.API_BASE}/api/tech-inventory`, { params })
      .pipe(catchError(this.handleError('getLowStock')));
  }

  updateQty(id: string, qty: number) {
    return this.http
      .put<any>(`${this.API_BASE}/api/tech-inventory/${id}`, { quantity_available: qty })
      .pipe(catchError(this.handleError('updateQty')));
  }

  deleteItem(id: string) {
    const params = this.getUserIdParam();
    return this.http
      .delete<any>(`${this.API_BASE}/api/tech-inventory/${id}`, params ? { params } : {})
      .pipe(catchError(this.handleError('deleteItem')));
  }


getTransactions(page: number = 1, limit: number = 10): Observable<any> {
  let params = this.getUserIdParam() || new HttpParams();
  params = params.set('page', page.toString()).set('limit', limit.toString());

  return this.http
    .get<any>(`${this.API_BASE}/api/transactions`, { params })
    .pipe(catchError(this.handleError('getTransactions')));
}

// Partial refund (item-wise)
partialRefund(payload: any): Observable<any> {
  return this.http
    .post<any>(`${this.API_BASE}/api/transactions/partial-refund`, payload)
    .pipe(catchError(this.handleError('partialRefund')));
}

// Create payment intent for Stripe
createPaymentIntent(invoiceId: string): Observable<any> {
  return this.http
    .post<any>(`${this.API_BASE}/api/create-payment-intent`, { invoiceId })
    .pipe(catchError(this.handleError('createPaymentIntent')));
}

// Confirm payment with backend
confirmPayment(paymentIntentId: string, invoiceId: string): Observable<any> {
  return this.http
    .post<any>(`${this.API_BASE}/api/confirm-payment`, {
      paymentIntentId,
      invoiceId
    })
    .pipe(catchError(this.handleError('confirmPayment')));
}

}
