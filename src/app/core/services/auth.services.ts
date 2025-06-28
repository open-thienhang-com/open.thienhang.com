import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private baseUrl = 'https://api.thienhang.com';

  constructor(private http: HttpClient) {}

  login(data) {
    const url = `${this.baseUrl}/authentication/login`;
    return this.http.post(url, data);
  }
}
