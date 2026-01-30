import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retry, catchError, timeout } from 'rxjs/operators';
import {
  Product, Stock, StockMovement, Order, AnalyticsData, StockAlert,
  StockUpdateRequest, StockUpdateResponse, ListResponse, ApiResponse,
  ProductCreateRequest, ProductUpdateRequest
} from '../models/retail.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = '/adapters/retail';

  constructor(private http: HttpClient) { }

  listProducts(category?: string, skip: number = 0, limit: number = 20): Observable<ListResponse<Product>> {
    let url = `${this.baseUrl}/products?skip=${skip}&limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }
    return this.http.get<ListResponse<Product>>(url);
  }

  getProduct(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(data: ProductCreateRequest): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.baseUrl}/products`, data);
  }

  updateProduct(id: string, data: ProductUpdateRequest): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/products/${id}`, data);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/products/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseUrl = '/adapters/retail';

  constructor(private http: HttpClient) { }

  listStocks(warehouseId?: string, skip: number = 0, limit: number = 50): Observable<ListResponse<Stock>> {
    let url = `${this.baseUrl}/stocks?skip=${skip}&limit=${limit}`;
    if (warehouseId) {
      url += `&warehouse_id=${warehouseId}`;
    }
    return this.http.get<ListResponse<Stock>>(url);
  }

  getStock(id: string): Observable<ApiResponse<Stock>> {
    return this.http.get<ApiResponse<Stock>>(`${this.baseUrl}/stocks/${id}`);
  }

  getLowStockProducts(): Observable<ListResponse<Stock>> {
    return this.http.get<ListResponse<Stock>>(`${this.baseUrl}/stocks/low`);
  }

  updateStock(request: StockUpdateRequest): Observable<ApiResponse<StockUpdateResponse>> {
    return this.http.post<ApiResponse<StockUpdateResponse>>(
      `${this.baseUrl}/stocks/update`,
      request
    ).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          if (error.status === 429) {
            // Redis lock timeout - exponential backoff
            const delayMs = Math.pow(2, retryCount) * 1000;
            return timer(delayMs);
          }
          throw error;
        }
      }),
      timeout(30000),
      catchError(error => {
        if (error.status === 429) {
          return throwError(() => new Error('Stock is locked, retrying...'));
        }
        return throwError(() => error);
      })
    );
  }

  getStockMovementHistory(productId: string, skip: number = 0, limit: number = 100): Observable<ListResponse<StockMovement>> {
    return this.http.get<ListResponse<StockMovement>>(
      `${this.baseUrl}/stock-movements/${productId}?skip=${skip}&limit=${limit}`
    );
  }

  getAllWarehouses(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/warehouses`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private baseUrl = '/adapters/retail';

  constructor(private http: HttpClient) { }

  getInventoryAnalytics(): Observable<ApiResponse<AnalyticsData>> {
    return this.http.get<ApiResponse<AnalyticsData>>(`${this.baseUrl}/analytics/inventory`);
  }

  getStockAlerts(): Observable<ListResponse<StockAlert>> {
    return this.http.get<ListResponse<StockAlert>>(`${this.baseUrl}/analytics/alerts`);
  }

  getProductAnalytics(productId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics/products/${productId}`);
  }

  getWarehouseAnalytics(warehouseId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics/warehouses/${warehouseId}`);
  }

  getCategoryAnalytics(): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${this.baseUrl}/analytics/categories`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = '/adapters/retail';

  constructor(private http: HttpClient) { }

  listOrders(skip: number = 0, limit: number = 20): Observable<ListResponse<Order>> {
    return this.http.get<ListResponse<Order>>(`${this.baseUrl}/orders?skip=${skip}&limit=${limit}`);
  }

  getOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}`);
  }

  createOrder(order: any): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.baseUrl}/orders`, order);
  }

  updateOrder(id: string, order: any): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}`, order);
  }

  cancelOrder(id: string): Observable<ApiResponse<Order>> {
    return this.http.patch<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}/cancel`, {});
  }

  deleteOrder(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/orders/${id}`);
  }
}
