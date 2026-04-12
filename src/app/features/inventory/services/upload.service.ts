import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';
import { ApiResponse } from '../models/inventory.models';

export interface UploadResponse {
  file_name: string;
  provider: string;
  url: string;
  thumbnail_url: string | null;
  file_id: string | null;
  content_type: string;
  size: number;
  metadata: {
    key: string;
    public_url: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface SignedUrlResponse {
  success: boolean;
  signed_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private http: HttpClient) {}

  private get uploadUrl(): string {
    return `${getApiBase()}/data-mesh/domains/uploads/idrive`;
  }

  /**
   * Upload a file to IDrive
   */
  uploadImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(this.uploadUrl, formData);
  }

  /**
   * Get a signed URL for a private file key
   */
  getSignedUrl(key: string, expiresIn: number = 3600): Observable<SignedUrlResponse> {
    const url = `${this.uploadUrl}/signed-url?key=${encodeURIComponent(key)}&expires_in=${expiresIn}`;
    return this.http.get<SignedUrlResponse>(url);
  }
}
