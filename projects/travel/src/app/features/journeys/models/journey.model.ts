export type TripStatus = 'draft' | 'upcoming' | 'in_progress' | 'completed' | string;

export interface Trip {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  destination: string;
  budget: number;
  people_count: number;
  timezone: string;
  status: TripStatus;
  detail_image_urls: string[];
  thumbnail_image_urls: string[];
  created_at: string;
  updated_at: string;
  general_information?: {
    landmarks?: Landmark[];
    notes?: string | null;
  };
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  /** Calendar date this stop happens on, e.g. '2026-01-02'. */
  day: string;
  start_time?: string;
  end_time?: string;
  title: string;
  location?: string;
  note?: string;
  activity_type?: string;
}

export interface BudgetItem {
  id: string;
  trip_id: string;
  category: string;
  amount: number;
  currency: string;
  spent_on?: string;
  note?: string;
}

export interface Landmark {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  note?: string;
}

export interface TripDetail extends Trip {
  itinerary: ItineraryItem[];
  budget_items: BudgetItem[];
}

export interface ApiListResponse<T> {
  data: T[];
  message?: string;
  total?: number;
}

export interface ApiDetailResponse<T> {
  data: T;
  message?: string;
}
