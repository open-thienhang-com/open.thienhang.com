import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';

export interface Truck {
  _id: string;
  vehicle_code: string;
  license_plate: string;
  vehicle_type: string;
  status: string;
  warehouse_id: string;
  driver_name: string;
  driver_phone: string;
  max_weight: number;
  max_volume: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type TruckPayload = Omit<Truck, '_id' | 'created_at' | 'updated_at'>;

interface TruckListResponse {
  success: boolean;
  message?: string;
  data: Truck[];
  total?: number;
  page?: number;
  page_size?: number;
}

interface TruckDetailResponse {
  success: boolean;
  message?: string;
  data: Truck;
}

@Injectable({ providedIn: 'root' })
export class TruckService {
  private get baseUrl(): string {
    return `${getApiBase()}/data-mesh/domains/retail/trucks`;
  }

  constructor(private http: HttpClient) {}

  listTrucks(skip = 0, limit = 100): Observable<TruckListResponse> {
    return this.http.get<TruckListResponse>(`${this.baseUrl}?skip=${skip}&limit=${limit}`);
  }

  getTruck(id: string): Observable<TruckDetailResponse> {
    return this.http.get<TruckDetailResponse>(`${this.baseUrl}/${id}`);
  }

  createTruck(payload: TruckPayload): Observable<any> {
    return this.http.post<any>(this.baseUrl, payload);
  }

  updateTruck(id: string, payload: Partial<TruckPayload>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  deleteTruck(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}
