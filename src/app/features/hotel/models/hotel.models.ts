// Hotel Models and Interfaces

// Address Model
export interface Address {
  country: string;
  city: string;
  street: string;
  house_number?: string;
  latitude: number;
  longitude: number;
}

// Property Model
export interface Property {
  id: string;
  name: string;
  description?: string;
  has_pool: boolean;
  has_elevator: boolean;
  total_apartments: number;
  address: Address;
}

// Amenity Model
export interface Amenity {
  id: string;
  name: string;
  description?: string;
  is_available: boolean;
}

// Apartment Model
export interface Apartment {
  id: string;
  property: Property;
  amenities: Amenity[];
  images: string[];
  address: Address;
  hotline: string;
  email: string;
  room_ids: string[];
  title: string;
  description: string;
  price_per_day: number;
  price_per_month: number;
  total_area: number;
  is_furnished: boolean;
  is_garage: boolean;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  is_booked: boolean;
  is_active: boolean;
  is_available_for_booking: boolean;
  maintenance_mode: boolean;
  available_from: string;
  available_until: string;
  currency: string;
  minimum_stay_days: number;
  maximum_stay_days: number;
  check_in_time: string;
  check_out_time: string;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  parties_allowed: boolean;
  cancellation_policy: string;
  free_cancellation_hours: number;
}

// Room Model
export interface Room {
  id: string;
  apartment_id: string;
  name: string;
  room_type: RoomType;
  area: number;
  bed_count: number;
  bed_type: BedType;
  has_window: boolean;
  has_balcony: boolean;
  has_private_bathroom: boolean;
  has_air_conditioning: boolean;
  has_heating: boolean;
  room_order: number;
  max_occupancy: number;
  is_available: boolean;
  maintenance_required: boolean;
  has_tv: boolean;
  has_wifi: boolean;
  has_desk: boolean;
  has_closet: boolean;
  description: string;
  created_at?: string;
}

// Booking Model
export interface Booking {
  id: string;
  apartment_id: string;
  account_id: string;
  check_in: string;
  check_out: string;
  day_price: number;
  month_price: number;
  total_price: number;
  count_of_days: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  is_active: boolean;
  created: string;
  updated: string;
  special_requests: string;
  guest_count: number;
  canceled_at?: string;
}

// Review Model
export interface Review {
  id?: string;
  title: string;
  review: string;
  account_id: string;
  apartment_id: string;
  booking_id: string;
  date_posted: string;
  date_updated?: string | null;
}

// Rating Model
export interface Rating {
  id?: string;
  apartment_id: string;
  booking_id: string;
  account_id: string;
  cleanliness: number;
  location: number;
  value: number;
  facilities: number;
  avg_rating: number;
  comment: string;
  created_at: string;
}

// Enums
export enum RoomType {
  BEDROOM = 'bedroom',
  BATHROOM = 'bathroom',
  KITCHEN = 'kitchen',
  LIVING_ROOM = 'living_room',
  DINING_ROOM = 'dining_room',
  BALCONY = 'balcony',
  STORAGE = 'storage',
  OFFICE = 'office'
}

export enum BedType {
  SINGLE = 'single',
  DOUBLE = 'double',
  QUEEN = 'queen',
  KING = 'king',
  SOFA_BED = 'sofa_bed',
  BUNK_BED = 'bunk_bed'
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  IN_PROCESS = 'in_process',
  CANCELED = 'canceled'
}

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELED = 'canceled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show'
}

// API Response Models
export interface ApiResponse<T> {
  message: string;
  data: T;
  total?: number;
  success?: boolean;
}

export interface ApiListResponse<T> {
  message: string;
  data: T[];
}
