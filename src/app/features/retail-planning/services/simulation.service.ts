import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface SimulationRequest {
  plan_id: string;
  model_id?: string;
  from_date: string;
  to_date: string;
  buffer_throughtput?: number;
  persist?: boolean;
  simulation?: {};
}

export interface SimulationResponse {
  id?: string;
  from_date: string;
  to_date: string;
  schedule: {
    [date: string]: {
      plan_id?: string;
      vehicle_trips: VehicleTrip[];
    };
  };
}

export interface VehicleTrip {
  shift_name: string;
  vehicle_id: string;
  number_plate?: string;
  vehicle_payload_capacity_kg?: number;
  total_distance_km?: number;
  ontime_rate_percent?: number;
  ontime_rate?: number;
  drop_rate_percent?: number;
  drop_rate?: number;
  fill_rate_percent?: number;
  fill_rate?: number;
  stops: Stop[];
}

export interface Stop {
  ID?: number;
  name?: string;
  original_stop_name?: string;
  stop_name?: string;
  original_stt?: number;
  sequence?: number;
  stt?: number;
  stop_type?: string;
  planned_checkin_time?: number;
  planned_checkout_time?: number;
  expected_checkin_time?: number;
  expected_checkout_time?: number;
  check_in?: number;
  check_out?: number;
  checkin_time?: number;
  checkout_time?: number;
  actual_checkin_time?: number;
  actual_checkout_time?: number;
  serve_time?: number;
  processing_time?: number;
  transit_time?: number;
  planned_distance_km?: number;
  planned_distance?: number;
  distance_km?: number;
  pickup_weight_kg?: number;
  delivery_weight_kg?: number;
  planned_pickup_weight_kg?: number;
  planned_delivery_weight_kg?: number;
  load_on_truck?: number;
  speed_kmh?: number;
  average_speed?: number;
  drop_rate_percent?: number;
  drop_rate?: number;
  fill_rate_percent?: number;
  fill_rate?: number;
  is_ontime?: boolean;
  ontime_rate_percent?: number;
  ontime_rate?: number;
  extra?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SimulationService {
  private apiBase = 'http://localhost:8081';
  private defaultToken = 'ZCXb4Thq56HgXlQC4IKS4EcghaYt6xxmIoHdazBJgVBRAwYqbLhx9rE3QTuzIqpo';

  constructor(private http: HttpClient) {}

  runSimulation(request: SimulationRequest): Observable<SimulationResponse> {
    const url = `${this.apiBase}/routing-deviation/internal/plan/predict`;
    const token = this.getAuthToken();
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token.startsWith('Bearer') ? token : `Bearer ${token}`
    });

    return this.http.post<{ code?: number; data?: SimulationResponse; message?: string }>(url, request, { headers }).pipe(
      map(response => {
        // Unwrap response if it has a data property
        return response.data || response as SimulationResponse;
      }),
      catchError(error => {
        console.error('[SimulationService] API error:', error);
        return throwError(() => error);
      })
    );
  }

  private getAuthToken(): string {
    try {
      return (window as any).__AUTH_TOKEN__ || 
             (window as any).API_TOKEN || 
             localStorage.getItem('token') || 
             localStorage.getItem('auth_token') || 
             localStorage.getItem('access_token') || 
             this.defaultToken;
    } catch {
      return this.defaultToken;
    }
  }
}
