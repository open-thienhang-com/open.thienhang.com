import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileServices {
  private baseUrl = 'https://api.thienhang.com';

  constructor(private http: HttpClient) { }

  getProfile(): Observable<any> {
    const url = `${this.baseUrl}/authentication/me`;
    return this.http.get(url, { headers: { accept: 'application/json' } });
  }
}
