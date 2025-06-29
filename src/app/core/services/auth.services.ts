import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, catchError, Observable, of, tap} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  private baseUrl = 'https://api.thienhang.com';
  private userSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  login(data) {
    const url = `${this.baseUrl}/authentication/login`;
    return this.http.post(url, data);
  }

  refreshToken(): Observable<any> {
    const url = `${this.baseUrl}/authentication/refresh-token`;
    return this.http.post(url, null);
  };

  logout() {
    localStorage.removeItem('isLoggedIn');
    this.userSubject.next(null);
    const url = `${this.baseUrl}/authentication/logout`;
    return this.http.post(url, null);
  }

  signUp(data) {
    const url = `${this.baseUrl}/authentication/register`;
    return this.http.post(url, data);
  }

  getCurrentUser() {
    const url = `${this.baseUrl}/authentication/me`;
    return this.http.get(url).pipe(
      tap(user => {
        localStorage.setItem('isLoggedIn', 'true');
        this.userSubject.next(user);
      }),
      catchError(() => {
        localStorage.removeItem('isLoggedIn');
        this.userSubject.next(null);
        return of(null);
      })
    );
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  getUser(): Observable<any> {
    return this.userSubject.asObservable();
  }
}
