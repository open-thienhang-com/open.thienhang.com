import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';
import { LoyaltyMember, LoyaltyReward, LoyaltyCampaign } from '../models/loyalty.models';

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private get apiBase(): string {
    return getApiBase();
  }
  // Placeholder service for loyalty operations

  constructor(private http: HttpClient) { }

  listMembers(): Observable<LoyaltyMember[]> {
    return of([]);
  }

  listRewards(): Observable<LoyaltyReward[]> {
    return of([]);
  }

  listCampaigns(): Observable<LoyaltyCampaign[]> {
    return of([]);
  }
}
