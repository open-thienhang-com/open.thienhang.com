import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, timer, tap, of } from 'rxjs';
import { retry, catchError, timeout } from 'rxjs/operators';
import { getApiBase } from '../../../core/config/api-config';
import {
  Product, Stock, StockMovement, AnalyticsData, StockAlert,
  StockUpdateRequest, StockUpdateResponse, ListResponse, ApiResponse,
  ProductCreateRequest, ProductUpdateRequest
} from '../models/inventory.models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private get apiBase(): string {
    return getApiBase();
  }
  private get retailDomainUrl(): string {
    return `${this.apiBase}/data-mesh/domains/retail`;
  }

  // Signals for state management
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);
  totalProducts = signal<number>(0);

  constructor(private http: HttpClient) { }

  listProducts(category?: string, skip: number = 0, limit: number = 20): Observable<ListResponse<Product>> {
    this.loading.set(true);
    let url = `${this.retailDomainUrl}/products?skip=${skip}&limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }
    return this.http.get<ListResponse<Product>>(url).pipe(
      tap(res => {
        this.products.set(res.data || []);
        this.totalProducts.set(res.total || 0);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  getProduct(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.retailDomainUrl}/products/${id}`);
  }

  createProduct(data: ProductCreateRequest): Observable<ApiResponse<Product>> {
    const raw: any = (data as any)?.data ?? data;
    const payload: ProductCreateRequest = {
      sku: String(raw?.sku ?? '').trim(),
      name: String(raw?.name ?? '').trim(),
      barcode: String(raw?.barcode ?? raw?.sku ?? '').trim(),
      cost_price: Number(raw?.cost_price ?? 0),
      selling_price: Number(raw?.selling_price ?? raw?.price ?? 0),
      description: raw?.description ?? '',
      category: String(raw?.category ?? '').trim(),
      subcategory: raw?.subcategory ?? '',
      discount_price: Number(raw?.discount_price ?? 0),
      reorder_level: Number(raw?.reorder_level ?? 10),
      maximum_stock: Number(raw?.maximum_stock ?? 0),
      supplier_id: raw?.supplier_id ?? '',
      is_active: raw?.is_active !== false
    };
    return this.http.post<ApiResponse<Product>>(`${this.retailDomainUrl}/products`, payload);
  }

  updateProduct(id: string, data: ProductUpdateRequest): Observable<ApiResponse<Product>> {
    const raw: any = (data as any)?.data ?? data;
    const payload: any = {
      ...raw
    };
    if (payload.price !== undefined && payload.selling_price === undefined) {
      payload.selling_price = payload.price;
    }
    if (!payload.barcode && payload.sku) {
      payload.barcode = payload.sku;
    }
    delete payload.data;
    // Note: this kept using baseUrl which was adapters/retail in the original.
    // Keeping it as is to avoid breaking changes to the URL.
    return this.http.put<ApiResponse<Product>>(`${getApiBase()}/adapters/retail/products/${id}`, payload);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${getApiBase()}/adapters/retail/products/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private get baseUrl(): string {
    return `${getApiBase()}/adapters/retail`;
  }

  // Signals for state management
  stocks = signal<Stock[]>([]);
  loading = signal<boolean>(false);
  totalStocks = signal<number>(0);

  constructor(private http: HttpClient) { }

  listStocks(warehouseId?: string, skip: number = 0, limit: number = 50): Observable<ListResponse<Stock>> {
    this.loading.set(true);
    let url = `${this.baseUrl}/stocks?skip=${skip}&limit=${limit}`;
    if (warehouseId) {
      url += `&warehouse_id=${warehouseId}`;
    }
    return this.http.get<ListResponse<Stock>>(url).pipe(
      tap(res => {
        this.stocks.set(res.data || []);
        this.totalStocks.set(res.total || 0);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
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

  // Order methods (moved from RetailService)
  listOrders(skip: number = 0, limit: number = 20): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${getApiBase()}/data-mesh/domains/retail/orders?skip=${skip}&limit=${limit}`);
  }

  getOrder(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${getApiBase()}/data-mesh/domains/retail/orders/${id}`);
  }

  createOrder(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${getApiBase()}/data-mesh/domains/retail/orders`, data);
  }

  listTransactions(skip: number = 0, limit: number = 20): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(`${getApiBase()}/data-mesh/domains/retail/transactions?skip=${skip}&limit=${limit}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private get baseUrl(): string {
    return `${getApiBase()}/adapters/retail`;
  }

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
export class CategoryService {
  private get baseUrl(): string {
    return `${getApiBase()}/data-mesh/domains/retail/categories`;
  }

  constructor(private http: HttpClient) { }

  listCategories(skip: number = 0, limit: number = 50): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?skip=${skip}&limit=${limit}`);
  }

  getCategory(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    parent_id?: string;
    is_active: boolean;
  }): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  updateCategory(id: string, data: {
    name: string;
    slug: string;
    description?: string;
    parent_id?: string;
    is_active: boolean;
  }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }
}

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private get baseUrl(): string {
    return `${getApiBase()}/data-mesh/domains/retail/warehouses`;
  }

  constructor(private http: HttpClient) { }

  listWarehouses(skip: number = 0, limit: number = 50): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?skip=${skip}&limit=${limit}`);
  }

  getWarehouse(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createWarehouse(data: {
    name: string;
    location: string;
    address: string;
    city: string;
    country: string;
    total_capacity: number;
    is_active: boolean;
  }): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }
}

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private get baseUrl(): string {
    return `${getApiBase()}/data-mesh/domains/retail/partners`;
  }

  constructor(private http: HttpClient) { }

  listPartners(skip: number = 0, limit: number = 50): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}?skip=${skip}&limit=${limit}`);
  }

  getPartner(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createPartner(data: {
    name: string;
    partner_type: string;
    contact_name: string;
    phone: string;
    email: string;
    address: string;
    is_active: boolean;
  }): Observable<any> {
    return this.http.post<any>(this.baseUrl, data);
  }

  updatePartner(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, data);
  }

  // Aliases for Customer components
  listCustomers(skip: number = 0, limit: number = 50): Observable<any> {
    return this.listPartners(skip, limit);
  }

  getCustomer(id: string): Observable<any> {
    return this.getPartner(id);
  }

  createCustomer(data: any): Observable<any> {
    return this.createPartner(data);
  }

  updateCustomer(id: string, data: any): Observable<any> {
    return this.updatePartner(id, data);
  }
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  // Added stub as per tasks.md requirement for future use
  private get baseUrl(): string {
    return `${getApiBase()}/data-mesh/domains/retail/suppliers`;
  }
  constructor(private http: HttpClient) { }
  listSuppliers(): Observable<any> { return of([]); }
}
