// Loyalty Models — aligned with backend Pydantic models

export type MemberTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'terminated';
export type CampaignType = 'welcome' | 'birthday' | 'purchase' | 'referral' | 'retention' | 'reengagement' | 'seasonal' | 'promotion';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type RewardType = 'discount' | 'coupon' | 'free_product' | 'free_shipping' | 'points' | 'gift_card' | 'experience';
export type RewardStatus = 'active' | 'inactive' | 'expired' | 'redeemed';
export type StrategyType = 'points_earning' | 'points_redemption' | 'tier_upgrade' | 'vip_access' | 'custom';
export type SegmentType = 'demographic' | 'behavioral' | 'purchase' | 'engagement' | 'custom';
export type AutomationTriggerType = 'member_join' | 'birthday' | 'tier_upgrade' | 'inactivity_60d' | 'inactivity_180d' | 'points_expiry_warning' | 'high_spend' | 'referral_success';
export type AutomationActionType = 'grant_points' | 'send_notification' | 'apply_multiplier' | 'enroll_campaign' | 'assign_tag';

export interface TierInfo {
  current_tier: MemberTier;
  tier_progress: number;
  points_to_next_tier: number;
  tier_benefits: string[];
  tier_achieved_at?: string;
}

export interface Member {
  id?: string;
  _id?: string;
  member_id: string;
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  tier: MemberTier;
  status: MemberStatus;
  points_balance: number;
  lifetime_points: number;
  total_purchases: number;
  purchase_count: number;
  referral_code?: string;
  tier_info: TierInfo;
  tags: string[];
  created_at: string;
  updated_at?: string;
  last_activity_at?: string;
}

export interface MemberCreate {
  email: string;
  phone?: string;
  full_name: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  referral_code?: string;
  tags?: string[];
}

export interface MemberUpdate {
  email?: string;
  phone?: string;
  full_name?: string;
  avatar_url?: string;
  status?: MemberStatus;
  tags?: string[];
}

export interface PointsTransaction {
  transaction_id: string;
  member_id: string;
  points: number;
  transaction_type: string;
  description?: string;
  balance_after: number;
  created_at: string;
}

export interface CampaignReward {
  reward_type: string;
  points_awarded?: number;
  discount_percentage?: number;
  bonus_multiplier?: number;
}

export interface Campaign {
  id?: string;
  _id?: string;
  campaign_id: string;
  name: string;
  description?: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  start_date: string;
  end_date?: string;
  channels: string[];
  reward?: CampaignReward;
  segment_ids: string[];
  stats: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface CampaignCreate {
  name: string;
  description?: string;
  campaign_type: CampaignType;
  start_date: string;
  end_date?: string;
  channels?: string[];
  reward?: CampaignReward;
  segment_ids?: string[];
}

export interface CampaignUpdate {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  end_date?: string;
  channels?: string[];
}

export interface Reward {
  id?: string;
  _id?: string;
  reward_id: string;
  name: string;
  description?: string;
  reward_type: RewardType;
  category: string;
  points_required: number;
  value_amount?: number;
  status: RewardStatus;
  redemptions_count: number;
  remaining_quantity?: number;
  valid_from?: string;
  valid_until?: string;
  applicable_tiers: string[];
  tags: string[];
  created_at: string;
}

export interface RewardCreate {
  name: string;
  description?: string;
  reward_type: RewardType;
  category?: string;
  points_required: number;
  value_amount?: number;
  valid_from?: string;
  valid_until?: string;
  applicable_tiers?: string[];
  tags?: string[];
}

export interface RewardUpdate {
  name?: string;
  description?: string;
  reward_type?: RewardType;
  category?: string;
  points_required?: number;
  status?: RewardStatus;
}

export interface SegmentCondition {
  field: string;
  operator: string;
  value: any;
  conjunction?: string;
}

export interface SegmentRuleGroup {
  group_id: string;
  conditions: SegmentCondition[];
  conjunction?: string;
}

export interface Segment {
  id?: string;
  _id?: string;
  segment_id: string;
  name: string;
  description?: string;
  segment_type: SegmentType;
  status: string;
  member_count: number;
  rule_groups: SegmentRuleGroup[];
  refresh_frequency: string;
  last_refreshed_at?: string;
  tags: string[];
  created_at: string;
}

export interface SegmentCreate {
  name: string;
  description?: string;
  segment_type: SegmentType;
  rule_groups?: SegmentRuleGroup[];
  tags?: string[];
}

export interface StrategyTierBonus {
  tier: string;
  multiplier: number;
  bonus_points: number;
  additional_benefits: string[];
}

export interface Strategy {
  id?: string;
  _id?: string;
  strategy_id: string;
  name: string;
  description?: string;
  strategy_type: StrategyType;
  status: string;
  points_multiplier: number;
  base_points: number;
  tier_bonuses: StrategyTierBonus[];
  applicable_tiers: string[];
  min_purchase_amount: number;
  valid_from?: string;
  valid_until?: string;
  tags: string[];
  created_at: string;
}

export interface StrategyCreate {
  name: string;
  description?: string;
  strategy_type: StrategyType;
  points_multiplier?: number;
  base_points?: number;
  tier_bonuses?: StrategyTierBonus[];
  applicable_tiers?: string[];
  min_purchase_amount?: number;
}

export interface AutomationRule {
  id?: string;
  _id?: string;
  rule_id: string;
  name: string;
  description?: string;
  trigger_type: AutomationTriggerType;
  trigger_config: Record<string, any>;
  action_type: AutomationActionType;
  action_config: Record<string, any>;
  status: 'active' | 'paused' | 'draft';
  priority: number;
  fired_count: number;
  last_fired_at?: string;
  created_at?: string;
}

export interface AutomationRuleCreate {
  name: string;
  description?: string;
  trigger_type: AutomationTriggerType;
  trigger_config?: Record<string, any>;
  action_type: AutomationActionType;
  action_config?: Record<string, any>;
  status?: string;
}

export interface LoyaltyOverview {
  total_members: number;
  active_members: number;
  new_members_this_month: number;
  tier_breakdown: Record<MemberTier, number>;
  total_points_in_circulation: number;
  points_redeemed_this_month: number;
  active_campaigns_count: number;
  retention_rate: number;
}

export interface TierBreakdownItem {
  label: string;
  count: number;
  tier: string;
}

export interface LoyaltyAnalytics {
  participation_rate: number;
  redemption_rate: number;
  avg_points_per_member: number;
  retention_rate: number;
  churn_rate: number;
  new_member_growth: number;
  campaign_roi: number;
  tier_breakdown: TierBreakdownItem[];
  top_campaigns: any[];
  range: string;
}

// Legacy aliases for backward compatibility
export interface LoyaltyMember extends Member {}
export interface LoyaltyReward extends Reward {}
export interface LoyaltyCampaign extends Campaign {}
