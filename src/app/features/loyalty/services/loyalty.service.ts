import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';
import {
  Member, MemberCreate, MemberUpdate,
  Campaign, CampaignCreate, CampaignUpdate,
  Reward, RewardCreate, RewardUpdate,
  Segment, SegmentCreate,
  Strategy, StrategyCreate,
  AutomationRule, AutomationRuleCreate,
  LoyaltyOverview, LoyaltyAnalytics,
} from '../models/loyalty.models';

interface ListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private get baseUrl(): string {
    return `${getApiBase()}/retail`;
  }

  constructor(private http: HttpClient) {}

  // ── Members ──────────────────────────────────────────────────────────────

  listMembers(params: { search?: string; tier?: string; status?: string; skip?: number; limit?: number } = {}): Observable<ListResponse<Member>> {
    const qp = new HttpParams({ fromObject: this.cleanParams(params) });
    return this.http.get<ListResponse<Member>>(`${this.baseUrl}/members`, { params: qp });
  }

  getMember(id: string): Observable<ApiResponse<Member>> {
    return this.http.get<ApiResponse<Member>>(`${this.baseUrl}/members/${id}`);
  }

  createMember(body: MemberCreate): Observable<ApiResponse<Member>> {
    return this.http.post<ApiResponse<Member>>(`${this.baseUrl}/members`, body);
  }

  updateMember(id: string, body: MemberUpdate): Observable<ApiResponse<Member>> {
    return this.http.put<ApiResponse<Member>>(`${this.baseUrl}/members/${id}`, body);
  }

  deleteMember(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/members/${id}`);
  }

  addPoints(id: string, points: number, description: string = ''): Observable<ApiResponse<Member>> {
    return this.http.post<ApiResponse<Member>>(
      `${this.baseUrl}/members/${id}/points/add`,
      null,
      { params: new HttpParams().set('points', points).set('description', description) }
    );
  }

  deductPoints(id: string, points: number, description: string = ''): Observable<ApiResponse<Member>> {
    return this.http.post<ApiResponse<Member>>(
      `${this.baseUrl}/members/${id}/points/deduct`,
      null,
      { params: new HttpParams().set('points', points).set('description', description) }
    );
  }

  getPointsHistory(id: string, skip = 0, limit = 20): Observable<ListResponse<any>> {
    return this.http.get<ListResponse<any>>(
      `${this.baseUrl}/members/${id}/points/history`,
      { params: new HttpParams().set('skip', skip).set('limit', limit) }
    );
  }

  // ── Campaigns ─────────────────────────────────────────────────────────────

  listCampaigns(params: { status?: string; campaign_type?: string; search?: string; skip?: number; limit?: number } = {}): Observable<ListResponse<Campaign>> {
    const qp = new HttpParams({ fromObject: this.cleanParams(params) });
    return this.http.get<ListResponse<Campaign>>(`${this.baseUrl}/campaigns`, { params: qp });
  }

  getCampaign(id: string): Observable<ApiResponse<Campaign>> {
    return this.http.get<ApiResponse<Campaign>>(`${this.baseUrl}/campaigns/${id}`);
  }

  createCampaign(body: CampaignCreate): Observable<ApiResponse<Campaign>> {
    return this.http.post<ApiResponse<Campaign>>(`${this.baseUrl}/campaigns`, body);
  }

  updateCampaign(id: string, body: CampaignUpdate): Observable<ApiResponse<Campaign>> {
    return this.http.put<ApiResponse<Campaign>>(`${this.baseUrl}/campaigns/${id}`, body);
  }

  deleteCampaign(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/campaigns/${id}`);
  }

  activateCampaign(id: string): Observable<ApiResponse<Campaign>> {
    return this.http.post<ApiResponse<Campaign>>(`${this.baseUrl}/campaigns/${id}/activate`, null);
  }

  pauseCampaign(id: string): Observable<ApiResponse<Campaign>> {
    return this.http.post<ApiResponse<Campaign>>(`${this.baseUrl}/campaigns/${id}/pause`, null);
  }

  completeCampaign(id: string): Observable<ApiResponse<Campaign>> {
    return this.http.post<ApiResponse<Campaign>>(`${this.baseUrl}/campaigns/${id}/complete`, null);
  }

  // ── Rewards ───────────────────────────────────────────────────────────────

  listRewards(params: { status?: string; reward_type?: string; category?: string; search?: string; skip?: number; limit?: number } = {}): Observable<ListResponse<Reward>> {
    const qp = new HttpParams({ fromObject: this.cleanParams(params) });
    return this.http.get<ListResponse<Reward>>(`${this.baseUrl}/rewards`, { params: qp });
  }

  getReward(id: string): Observable<ApiResponse<Reward>> {
    return this.http.get<ApiResponse<Reward>>(`${this.baseUrl}/rewards/${id}`);
  }

  createReward(body: RewardCreate): Observable<ApiResponse<Reward>> {
    return this.http.post<ApiResponse<Reward>>(`${this.baseUrl}/rewards`, body);
  }

  updateReward(id: string, body: RewardUpdate): Observable<ApiResponse<Reward>> {
    return this.http.put<ApiResponse<Reward>>(`${this.baseUrl}/rewards/${id}`, body);
  }

  deleteReward(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/rewards/${id}`);
  }

  redeemReward(rewardId: string, memberId: string, quantity = 1): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/rewards/${rewardId}/redeem`, { member_id: memberId, quantity });
  }

  // ── Segments ──────────────────────────────────────────────────────────────

  listSegments(params: { status?: string; segment_type?: string; search?: string; skip?: number; limit?: number } = {}): Observable<ListResponse<Segment>> {
    const qp = new HttpParams({ fromObject: this.cleanParams(params) });
    return this.http.get<ListResponse<Segment>>(`${this.baseUrl}/segments`, { params: qp });
  }

  getSegment(id: string): Observable<ApiResponse<Segment>> {
    return this.http.get<ApiResponse<Segment>>(`${this.baseUrl}/segments/${id}`);
  }

  createSegment(body: SegmentCreate): Observable<ApiResponse<Segment>> {
    return this.http.post<ApiResponse<Segment>>(`${this.baseUrl}/segments`, body);
  }

  updateSegment(id: string, body: Partial<SegmentCreate>): Observable<ApiResponse<Segment>> {
    return this.http.put<ApiResponse<Segment>>(`${this.baseUrl}/segments/${id}`, body);
  }

  deleteSegment(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/segments/${id}`);
  }

  getSegmentMembers(id: string, skip = 0, limit = 50): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/segments/${id}/members`,
      { params: new HttpParams().set('skip', skip).set('limit', limit) }
    );
  }

  // ── Strategies ────────────────────────────────────────────────────────────

  listStrategies(params: { status?: string; strategy_type?: string; search?: string; skip?: number; limit?: number } = {}): Observable<ListResponse<Strategy>> {
    const qp = new HttpParams({ fromObject: this.cleanParams(params) });
    return this.http.get<ListResponse<Strategy>>(`${this.baseUrl}/strategies`, { params: qp });
  }

  getStrategy(id: string): Observable<ApiResponse<Strategy>> {
    return this.http.get<ApiResponse<Strategy>>(`${this.baseUrl}/strategies/${id}`);
  }

  createStrategy(body: StrategyCreate): Observable<ApiResponse<Strategy>> {
    return this.http.post<ApiResponse<Strategy>>(`${this.baseUrl}/strategies`, body);
  }

  updateStrategy(id: string, body: Partial<StrategyCreate>): Observable<ApiResponse<Strategy>> {
    return this.http.put<ApiResponse<Strategy>>(`${this.baseUrl}/strategies/${id}`, body);
  }

  deleteStrategy(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/strategies/${id}`);
  }

  // ── Automation ────────────────────────────────────────────────────────────

  listAutomationRules(params: { status?: string; skip?: number; limit?: number } = {}): Observable<ListResponse<AutomationRule>> {
    const qp = new HttpParams({ fromObject: this.cleanParams(params) });
    return this.http.get<ListResponse<AutomationRule>>(`${this.baseUrl}/automation-rules`, { params: qp });
  }

  getAutomationRule(id: string): Observable<ApiResponse<AutomationRule>> {
    return this.http.get<ApiResponse<AutomationRule>>(`${this.baseUrl}/automation-rules/${id}`);
  }

  createAutomationRule(body: AutomationRuleCreate): Observable<ApiResponse<AutomationRule>> {
    return this.http.post<ApiResponse<AutomationRule>>(`${this.baseUrl}/automation-rules`, body);
  }

  updateAutomationRule(id: string, body: Partial<AutomationRuleCreate>): Observable<ApiResponse<AutomationRule>> {
    return this.http.put<ApiResponse<AutomationRule>>(`${this.baseUrl}/automation-rules/${id}`, body);
  }

  deleteAutomationRule(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/automation-rules/${id}`);
  }

  activateAutomationRule(id: string): Observable<ApiResponse<AutomationRule>> {
    return this.http.post<ApiResponse<AutomationRule>>(`${this.baseUrl}/automation-rules/${id}/activate`, null);
  }

  pauseAutomationRule(id: string): Observable<ApiResponse<AutomationRule>> {
    return this.http.post<ApiResponse<AutomationRule>>(`${this.baseUrl}/automation-rules/${id}/pause`, null);
  }

  // ── Overview & Analytics ──────────────────────────────────────────────────

  getLoyaltyOverview(): Observable<ApiResponse<LoyaltyOverview>> {
    return this.http.get<ApiResponse<LoyaltyOverview>>(`${this.baseUrl}/loyalty/overview`);
  }

  getLoyaltyAnalytics(range: '7d' | '30d' | '90d' = '30d'): Observable<ApiResponse<LoyaltyAnalytics>> {
    return this.http.get<ApiResponse<LoyaltyAnalytics>>(
      `${this.baseUrl}/loyalty/analytics`,
      { params: new HttpParams().set('range', range) }
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private cleanParams(obj: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== null && v !== undefined && v !== '') {
        result[k] = String(v);
      }
    }
    return result;
  }
}
