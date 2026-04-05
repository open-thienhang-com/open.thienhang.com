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

@Injectable({
  providedIn: 'root'
})
export class TruckService {
  private get baseUrl(): string {
    return `${getApiBase()}/data-mesh/domains/retail/trucks`;
  }

  constructor(private http: HttpClient) {}

  listTrucks(skip: number = 0, limit: number = 20): Observable<TruckListResponse> {
    return this.http.get<TruckListResponse>(`${this.baseUrl}?skip=${skip}&limit=${limit}`);
  }

  getTruck(id: string): Observable<TruckDetailResponse> {
    return this.http.get<TruckDetailResponse>(`${this.baseUrl}/${id}`);
  }

  createTruck(payload: Omit<Truck, '_id' | 'created_at' | 'updated_at'>): Observable<Truck> {
    return this.http.post<Truck>(this.baseUrl, payload);
  }
}
