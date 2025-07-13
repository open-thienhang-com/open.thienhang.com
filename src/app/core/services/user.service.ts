import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from './governance.services';

export interface User {
  _id: string;
  kid: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  role?: string;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  status?: 'active' | 'inactive' | 'pending';
}

export interface UserProfile extends User {
  preferences?: {
    language?: string;
    theme?: string;
    notifications?: boolean;
    timezone?: string;
  };
  permissions?: string[];
  teams?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'https://api.thienhang.com';

  constructor(private http: HttpClient) {}

  // Get all users in current account
  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<any>(`${this.baseUrl}/authentication/users`)
      .pipe(
        map(response => {
          if (response && response.data && Array.isArray(response.data)) {
            return {
              data: response.data,
              total: response.total || response.data.length,
              success: true,
              message: response.message || 'Users retrieved successfully'
            };
          } else {
            return {
              data: [],
              total: 0,
              success: false,
              message: response?.message || 'No users found'
            };
          }
        })
      );
  }

  // Get current user profile
  getCurrentUserProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<UserProfile>(`${this.baseUrl}/authentication/profile`)
      .pipe(
        map(response => {
          if (response) {
            return {
              data: response,
              success: true,
              message: 'Profile retrieved successfully'
            };
          } else {
            return {
              data: null,
              success: false,
              message: 'Profile not found'
            };
          }
        })
      );
  }

  // Update user profile
  updateUserProfile(profileData: Partial<UserProfile>): Observable<ApiResponse<UserProfile>> {
    return this.http.put<UserProfile>(`${this.baseUrl}/authentication/profile`, profileData)
      .pipe(
        map(response => {
          if (response) {
            return {
              data: response,
              success: true,
              message: 'Profile updated successfully'
            };
          } else {
            return {
              data: null,
              success: false,
              message: 'Failed to update profile'
            };
          }
        })
      );
  }

  // Get user by ID
  getUserById(userId: string): Observable<ApiResponse<User>> {
    return this.http.get<User>(`${this.baseUrl}/authentication/users/${userId}`)
      .pipe(
        map(response => {
          if (response) {
            return {
              data: response,
              success: true,
              message: 'User retrieved successfully'
            };
          } else {
            return {
              data: null,
              success: false,
              message: 'User not found'
            };
          }
        })
      );
  }

  // Upload user avatar
  uploadAvatar(file: File): Observable<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<any>(`${this.baseUrl}/authentication/upload-avatar`, formData)
      .pipe(
        map(response => {
          if (response && response.avatarUrl) {
            return {
              data: { avatarUrl: response.avatarUrl },
              success: true,
              message: 'Avatar uploaded successfully'
            };
          } else {
            return {
              data: null,
              success: false,
              message: 'Failed to upload avatar'
            };
          }
        })
      );
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<any>(`${this.baseUrl}/authentication/change-password`, {
      currentPassword,
      newPassword
    })
      .pipe(
        map(response => {
          if (response) {
            return {
              data: response,
              success: true,
              message: 'Password changed successfully'
            };
          } else {
            return {
              data: null,
              success: false,
              message: 'Failed to change password'
            };
          }
        })
      );
  }
}
