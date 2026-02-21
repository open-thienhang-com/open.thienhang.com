export type TripStatus = 'upcoming' | 'in_progress' | 'completed' | string;
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | string;
export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | string;

export interface ApiListResponse<T> {
  data?: T[];
  total?: number;
  message?: string;
  success?: boolean;
}

export interface Trip {
  _id?: string;
  id?: string;
  trip_id?: string;
  name?: string;
  title: string;
  destination?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  people_count?: number;
  timezone?: string;
  status?: TripStatus;
  cover_image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TripCreate {
  title: string;
  destination?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: TripStatus;
  cover_image?: string;
}

export interface TripUpdate extends Partial<TripCreate> {}

export interface ItineraryItem {
  id?: string;
  item_id?: string;
  trip_id?: string;
  date?: string;
  time?: string;
  title: string;
  description?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItineraryItemCreate {
  date?: string;
  time?: string;
  title: string;
  description?: string;
  location?: string;
}

export interface ItineraryItemUpdate extends Partial<ItineraryItemCreate> {}

export interface Booking {
  id?: string;
  booking_id?: string;
  trip_id?: string;
  type?: string;
  provider?: string;
  reference_code?: string;
  amount?: number;
  currency?: string;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
  notes?: string;
}

export interface BookingCreate {
  type?: string;
  provider?: string;
  reference_code?: string;
  amount?: number;
  currency?: string;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
  notes?: string;
}

export interface BookingUpdate extends Partial<BookingCreate> {}

export interface BudgetItem {
  id?: string;
  item_id?: string;
  trip_id?: string;
  category?: string;
  title?: string;
  planned_amount?: number;
  actual_amount?: number;
  currency?: string;
  notes?: string;
}

export interface BudgetItemCreate {
  category?: string;
  title?: string;
  planned_amount?: number;
  actual_amount?: number;
  currency?: string;
  notes?: string;
}

export interface BudgetItemUpdate extends Partial<BudgetItemCreate> {}

export interface TripNotification {
  id?: string;
  notification_id?: string;
  trip_id?: string;
  type?: string;
  channel?: string;
  title?: string;
  message?: string;
  status?: string;
  send_at?: string;
}

export interface NotificationCreate {
  type?: string;
  channel?: string;
  title?: string;
  message?: string;
  status?: string;
  send_at?: string;
}

export interface NotificationUpdate extends Partial<NotificationCreate> {}

export interface Asset {
  id?: string;
  asset_id?: string;
  name?: string;
  type?: string;
  domain?: string;
  status?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AssetCreate {
  name: string;
  type?: string;
  domain?: string;
  description?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface AssetUpdate extends Partial<AssetCreate> {}
