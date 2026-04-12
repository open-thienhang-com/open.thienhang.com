export interface Vehicle {
  _id: string;
  vehicle_code: string;
  license_plate: string;
  vehicle_type: string;
  status: 'active' | 'inactive' | string;
  warehouse_id: string;
  driver_name: string;
  driver_phone: string;
  max_weight: number;
  max_volume: number;
  is_active: boolean;
  telnet?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleListResponse {
  success: boolean;
  message: string;
  data: Vehicle[];
  total: number;
  page: number;
  page_size: number;
}

export interface VehicleResponse {
  success: boolean;
  message: string;
  data: Vehicle;
}

export type VehicleCreateRequest = Omit<Vehicle, '_id' | 'created_at' | 'updated_at'>;
export type VehicleUpdateRequest = Partial<VehicleCreateRequest>;
