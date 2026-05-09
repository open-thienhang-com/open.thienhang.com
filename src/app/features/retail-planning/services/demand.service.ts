import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getApiBase } from '../../../core/config/api-config';

export interface DemandRecord {
  _id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  warehouse_id: string;
  warehouse_code: string;
  date: string;
  quantity: number;
  source: string;
  notes?: string;
}

export interface HistoryPoint {
  date: string;
  quantity: number;
  predicted: number;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  ci_lower: number;
  ci_upper: number;
}

export interface DemandForecastResult {
  product_id: string;
  product_name: string;
  warehouse_id: string | null;
  data_points: number;
  history: HistoryPoint[];
  forecast: ForecastPoint[];
  kernel_params: Record<string, number>;
  r2_score: number;
  fitted_at: string;
  error?: string;
}

export interface ProductDemandSummary {
  product_id: string;
  product_name: string;
  product_sku: string;
  category: string;
  total_quantity: number;
  avg_daily: number;
  data_points: number;
  last_30d_avg: number;
  first_date?: string;
  last_date?: string;
}

export interface KernelParams {
  c1?: number;
  l1?: number;
  c2?: number;
  l2?: number;
  p?: number;
  sigma_n?: number;
}

export interface ForecastRequest {
  product_id: string;
  warehouse_id?: string | null;
  horizon_days?: number;
  kernel_params?: KernelParams;
}

@Injectable({ providedIn: 'root' })
export class DemandService {
  private get base(): string {
    return `${getApiBase()}/data-mesh/domains/retail/demand`;
  }

  constructor(private http: HttpClient) {}

  getProductsSummary(warehouseId?: string): Observable<ProductDemandSummary[]> {
    let params = new HttpParams();
    if (warehouseId) params = params.set('warehouse_id', warehouseId);
    return this.http
      .get<any>(`${this.base}/products-summary`, { params })
      .pipe(map(r => Array.isArray(r?.data) ? r.data : []));
  }

  runForecast(req: ForecastRequest): Observable<DemandForecastResult> {
    return this.http
      .post<any>(`${this.base}/forecast`, req)
      .pipe(map(r => r?.data ?? r));
  }

  listRecords(filters: {
    product_id?: string;
    warehouse_id?: string;
    from_date?: string;
    to_date?: string;
    skip?: number;
    limit?: number;
  }): Observable<{ data: DemandRecord[]; total: number }> {
    let params = new HttpParams();
    if (filters.product_id)  params = params.set('product_id', filters.product_id);
    if (filters.warehouse_id) params = params.set('warehouse_id', filters.warehouse_id);
    if (filters.from_date)   params = params.set('from_date', filters.from_date);
    if (filters.to_date)     params = params.set('to_date', filters.to_date);
    if (filters.skip != null) params = params.set('skip', String(filters.skip));
    if (filters.limit != null) params = params.set('limit', String(filters.limit));
    return this.http
      .get<any>(`${this.base}/records`, { params })
      .pipe(map(r => ({ data: r?.data ?? [], total: r?.total ?? 0 })));
  }

  bulkCreate(records: any[]): Observable<any> {
    return this.http.post<any>(`${this.base}/records/bulk`, { records });
  }

  deleteRecord(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/records/${id}`);
  }
}
