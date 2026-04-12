import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';
import { 
  Vehicle, 
  VehicleListResponse, 
  VehicleResponse, 
  VehicleCreateRequest, 
  VehicleUpdateRequest 
} from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private get baseUrl(): string {
    return `${getApiBase()}/data-mesh/domains/retail/vehicles`;
  }

  // Signals for state management
  vehicles = signal<Vehicle[]>([]);
  loading = signal<boolean>(false);
  totalVehicles = signal<number>(0);

  constructor(private http: HttpClient) {}

  listVehicles(skip: number = 0, limit: number = 20): Observable<VehicleListResponse> {
    this.loading.set(true);
    return this.http.get<VehicleListResponse>(`${this.baseUrl}?skip=${skip}&limit=${limit}`).pipe(
      tap(res => {
        this.vehicles.set(res.data || []);
        this.totalVehicles.set(res.total || 0);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }

  getVehicle(id: string): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.baseUrl}/${id}`);
  }

  createVehicle(data: VehicleCreateRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.baseUrl, data);
  }

  updateVehicle(id: string, data: VehicleUpdateRequest): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.baseUrl}/${id}`, data);
  }

  deleteVehicle(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  searchWarehouses(keyword: string): Observable<any> {
    const url = `${getApiBase()}/data-mesh/domains/retail/warehouses?keyword=${keyword}&skip=0&limit=20`;
    return this.http.get<any>(url);
  }
}
