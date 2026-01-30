// Retail Adapter Models and Interfaces

// Product Model
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost_price: number;
  sku: string;
  images?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Stock Model
export interface Stock {
  id: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  reorder_level: number;
  reorder_quantity: number;
  last_updated: string;
  product?: Product;
  warehouse?: Warehouse;
}

// Warehouse Model
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  current_stock_value: number;
}

// Stock Movement Model
export interface StockMovement {
  id: string;
  product_id: string;
  warehouse_id: string;
  movement_type: MovementType;
  quantity: number;
  reference_id?: string;
  notes?: string;
  timestamp: string;
  created_by?: string;
}

// Order Model
export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  total_amount: number;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// Order Item Model
export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

// Analytics Data Model
export interface AnalyticsData {
  summary: StockSummary;
  data: AnalyticsProduct[];
  alerts: StockAlert[];
}

// Stock Summary Model
export interface StockSummary {
  total_products: number;
  total_quantity: number;
  total_cost_value: number;
  total_selling_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  turnover_rate: number;
}

// Analytics Product Model
export interface AnalyticsProduct {
  product_id: string;
  product_name: string;
  category: string;
  quantity: number;
  cost_value: number;
  selling_value: number;
  margin: number;
  margin_percentage: number;
  turnover_rate: number;
  last_sold: string;
}

// Stock Alert Model
export interface StockAlert {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  reorder_level: number;
  warehouse_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  created_at: string;
}

// Stock Update Request Model
export interface StockUpdateRequest {
  product_id: string;
  warehouse_id: string;
  quantity_change: number;
  movement_type: MovementType;
  reference_id?: string;
  notes?: string;
}

// Stock Update Response Model
export interface StockUpdateResponse {
  success: boolean;
  stock: Stock;
  movement: StockMovement;
}

// Enums
export enum MovementType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  RETURN = 'return',
  DAMAGE = 'damage',
  LOSS = 'loss'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCK = 'overstock',
  EXPIRED = 'expired'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

// API Response Models
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total?: number;
}

export interface ListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

// Request Models
export interface ProductCreateRequest {
  name: string;
  description?: string;
  category: string;
  price: number;
  cost_price: number;
  sku: string;
  images?: string[];
  is_active: boolean;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}
