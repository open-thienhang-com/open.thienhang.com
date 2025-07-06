import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataProductServices {
  private baseUrl = 'https://api.thienhang.com';

  constructor(private http: HttpClient) { }

  getDataProducts(params): Observable<any> {
    const url = `${this.baseUrl}/data-product`;
    return this.http.get(url, { params });
  }

  getDataProductDetail(id, domain) {
    const url = `${this.baseUrl}/data-product/${domain}/${id}`;
    return this.http.get(url);
  }
}
