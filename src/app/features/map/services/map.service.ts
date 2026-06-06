import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';
import { AddressExtractResponse } from '../models/map.models';

@Injectable({ providedIn: 'root' })
export class MapService {
  private get mapDomainUrl(): string {
    return `${getApiBase()}/map`;
  }

  constructor(private http: HttpClient) { }

  /** Public endpoint — no auth required. */
  extractAddress(text: string): Observable<AddressExtractResponse> {
    return this.http.post<AddressExtractResponse>(`${this.mapDomainUrl}/address/extract`, { text });
  }
}
