import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private API_BASE = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getRoles(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/api/products`);
  }

  addEmployee(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/api/products`, payload);
  }

  updateEmployee(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.API_BASE}/api/products/${id}`, payload);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_BASE}/api/products/${id}`);
  }

  category(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/api/product-categories`);
  }


  // leaveMnagement

  getAllLeaves(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/api/leave-management`);
  }

  addLeaves(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/api/leave-management`, payload);
  }

  updateLeaves(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.API_BASE}/api/leave-management/${id}`, payload);
  }


  // tech inventory

 getInventory(page: number = 1, limit: number = 10): Observable<any> {
  return this.http.get<any>(`${this.API_BASE}/api/tech-inventory?page=${page}&limit=${limit}`);
}


  addInventory(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/api/tech-inventory`, payload);
  }

  updateInventory(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.API_BASE}/api/tech-inventory/${id}`, payload);
  }

  deleteInventory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.API_BASE}/api/tech-inventory/${id}`);
  }

  // brands

  getBrands(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/api/tech-inventory-brands`);
  }

  addBrands(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/api/tech-inventory-brands`, payload);
  }

  getcategory(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/api/tech-inventory-category`);
  }

  addCategory(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/api/tech-inventory-category`, payload);
  }

  // suppliers

  allSuppliers(): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/api/tech-inventory-supplier`);
  }

  addSupplier(payload: any): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/api/tech-inventory-supplier`, payload);
  }

  // client

  getClients(): Observable<any> {
  return this.http.get(`${this.API_BASE}/api/tech-inventory-client`);
  }

 addClient(data: any): Observable<any> {
  return this.http.post(`${this.API_BASE}/api/tech-inventory-client`, data);
 }


  // invoice

  getInvoices(): Observable<any> {
  return this.http.get(`${this.API_BASE}/api/invoices`);
}
   createInvoice(data: any): Observable<any> {
    return this.http.post(`${this.API_BASE}/api/invoices`, data);
  }
  
  
}
