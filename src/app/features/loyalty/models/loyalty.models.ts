// Loyalty Models and Interfaces

export interface LoyaltyMember {
  id: string;
  customer_id: string;
  full_name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  joined_at: string;
  status: 'active' | 'inactive';
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface LoyaltyCampaign {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  point_multiplier: number;
  is_active: boolean;
}
