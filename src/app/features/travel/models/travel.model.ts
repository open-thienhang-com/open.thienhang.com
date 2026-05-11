export type TripStatus = 'draft' | 'upcoming' | 'in_progress' | 'completed' | string;
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
  budget?: number;
  people_count?: number;
  timezone?: string;
  status?: TripStatus;
  cover_image?: string;
}

export interface TripUpdate extends Partial<TripCreate> {}

export interface ItineraryItem {
  id?: string;
  item_id?: string;
  _id?: string;
  trip_id?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  time?: string;
  title: string;
  description?: string;
  note?: string;
  location?: string;
  activity_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItineraryItemCreate {
  trip_id?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  date?: string;
  time?: string;
  title: string;
  description?: string;
  note?: string;
  location?: string;
  activity_type?: string;
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

/** Blogger Domain Interfaces **/

export interface BlogAuthor {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  posts_count?: number;
  total_views?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  url?: string;
  thumbnail?: string;
  author?: BlogAuthor;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published';
  published_at?: string;
  updated_at?: string;
  view_count?: number;
  comment_count?: number;
  like_count?: number;
}

export interface TravelAnalytics {
  total_posts: number;
  total_views: number;
  total_comments: number;
  engagement_rate: number;
  trending_tags: string[];
  top_categories: { category: string; count: number }[];
}

/** Uploads Domain Interfaces **/

export interface UploadResult {
  url: string;
  provider: 'imgur' | 'supabase' | 'gcs';
  asset_id?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
}

/** OpenSpec Travel Extensions **/

// Member & Onboarding Models
export type TravelRole = 'owner' | 'admin' | 'member' | 'viewer';
export interface TravelMember {
  id: string;
  user_id: string;
  trip_id: string;
  role: TravelRole;
  name: string;
  avatar_url?: string;
  dietary_restrictions?: string[];
  skills?: string[]; // e.g. 'driver', 'navigator'
  tasks?: string[];
  joined_at: string;
  presence?: {
    location?: { lat: number; lng: number };
    last_seen: string;
  };
}

// POI & Route Models
export interface PointOfInterest {
  id: string;
  name: string;
  category: string;
  description?: string;
  lat: number;
  lng: number;
  estimated_duration_minutes: number;
  cover_image?: string;
  google_place_id?: string;
}

// Shared Wallet / Expense Models
export type SplitMethod = 'equal' | 'percentage' | 'shares' | 'exact';
export interface ExpenseSplit {
  user_id: string;
  amount_owed: number;
  shares?: number;
  percentage?: number;
}
export interface Expense {
  id: string;
  trip_id: string;
  paid_by: string; // user_id
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  split_method: SplitMethod;
  splits: ExpenseSplit[];
  created_at: string;
}
export interface WalletSettlement {
  payer_id: string;
  payee_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'resolved';
}

// Trip Gallery (Photo Management) Models
export interface TripPhoto {
  id: string;
  trip_id: string;
  itinerary_item_id?: string; // Optional binding to a specific stop
  uploaded_by: string;
  uploaded_at?: string;
  url: string;
  thumbnail_url?: string;
  metadata?: {
    lat?: number;
    lng?: number;
    captured_at?: string;
  };
  sync_status: 'pending' | 'synced' | 'failed';
}
