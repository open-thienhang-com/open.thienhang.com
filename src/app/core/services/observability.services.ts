import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from './governance.services';

export interface Metric {
  id: string;
  name: string;
  description?: string;
  type: string;
  unit?: string;
  values: MetricValue[];
  metadata?: any;
}

export interface MetricValue {
  timestamp: Date;
  value: number;
  dimensions?: Record<string, string>;
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  isPublic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardLayout {
  type: string;
  settings?: any;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: any;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealthStatus[];
  lastChecked: Date;
}

export interface ServiceHealthStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  lastChecked: Date;
  metrics?: any;
}

export interface Alert {
  id: string;
  name: string;
  description?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  message: string;
  timestamp: Date;
  entity?: {
    id: string;
    type: string;
    name?: string;
  };
  metadata?: any;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  condition: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  enabled: boolean;
  notifications?: {
    channels: string[];
    message?: string;
  };
  cooldown?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  actor: {
    id: string;
    type: string;
    name?: string;
  };
  resource: {
    id: string;
    type: string;
    name?: string;
  };
  timestamp: Date;
  status: 'success' | 'failure';
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface PerformanceMetrics {
  entityId: string;
  entityType: string;
  period: string;
  metrics: {
    [key: string]: {
      current: number;
      previous?: number;
      change?: number;
      trend?: 'up' | 'down' | 'stable';
    };
  };
  timestamp: Date;
}

export interface UsageAnalytics {
  period: string;
  metrics: {
    [key: string]: number;
  };
  breakdown?: {
    [key: string]: {
      [subKey: string]: number;
    };
  };
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class ObservabilityServices {
  private baseUrl = 'https://api.thienhang.com';

  constructor(private http: HttpClient) { }

  // Monitoring
  getMetrics(params?: any): Observable<ApiResponse<Metric[]>> {
    const url = `${this.baseUrl}/observability/metrics`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Metric[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getMetric(metricName: string, timeRange?: string): Observable<ApiResponse<Metric>> {
    const url = `${this.baseUrl}/observability/metric/${metricName}`;
    let httpParams = new HttpParams();
    if (timeRange) {
      httpParams = httpParams.set('timeRange', timeRange);
    }
    return this.http.get<Metric>(url, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  createCustomMetric(data: Partial<Metric>): Observable<ApiResponse<Metric>> {
    const url = `${this.baseUrl}/observability/metric`;
    return this.http.post<Metric>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getDashboards(): Observable<ApiResponse<Dashboard[]>> {
    const url = `${this.baseUrl}/observability/dashboards`;
    return this.http.get<Dashboard[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getDashboard(id: string): Observable<ApiResponse<Dashboard>> {
    const url = `${this.baseUrl}/observability/dashboard/${id}`;
    return this.http.get<Dashboard>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createDashboard(data: Partial<Dashboard>): Observable<ApiResponse<Dashboard>> {
    const url = `${this.baseUrl}/observability/dashboard`;
    return this.http.post<Dashboard>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateDashboard(id: string, data: Partial<Dashboard>): Observable<ApiResponse<Dashboard>> {
    const url = `${this.baseUrl}/observability/dashboard/${id}`;
    return this.http.put<Dashboard>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteDashboard(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/observability/dashboard/${id}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Health Checks
  getHealthStatus(): Observable<ApiResponse<HealthStatus>> {
    const url = `${this.baseUrl}/observability/health`;
    return this.http.get<HealthStatus>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getServiceHealth(serviceName: string): Observable<ApiResponse<ServiceHealthStatus>> {
    const url = `${this.baseUrl}/observability/health/${serviceName}`;
    return this.http.get<ServiceHealthStatus>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  performHealthCheck(serviceName: string): Observable<ApiResponse<ServiceHealthStatus>> {
    const url = `${this.baseUrl}/observability/health/${serviceName}/check`;
    return this.http.post<ServiceHealthStatus>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Alerting
  getAlerts(params?: any): Observable<ApiResponse<Alert[]>> {
    const url = `${this.baseUrl}/observability/alerts`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<Alert[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getAlert(id: string): Observable<ApiResponse<Alert>> {
    const url = `${this.baseUrl}/observability/alert/${id}`;
    return this.http.get<Alert>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  createAlert(data: Partial<Alert>): Observable<ApiResponse<Alert>> {
    const url = `${this.baseUrl}/observability/alert`;
    return this.http.post<Alert>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateAlert(id: string, data: Partial<Alert>): Observable<ApiResponse<Alert>> {
    const url = `${this.baseUrl}/observability/alert/${id}`;
    return this.http.put<Alert>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteAlert(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/observability/alert/${id}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  acknowledgeAlert(id: string): Observable<ApiResponse<Alert>> {
    const url = `${this.baseUrl}/observability/alert/${id}/acknowledge`;
    return this.http.post<Alert>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  resolveAlert(id: string): Observable<ApiResponse<Alert>> {
    const url = `${this.baseUrl}/observability/alert/${id}/resolve`;
    return this.http.post<Alert>(url, {})
      .pipe(map(response => this.wrapResponse(response)));
  }

  getAlertRules(): Observable<ApiResponse<AlertRule[]>> {
    const url = `${this.baseUrl}/observability/alert-rules`;
    return this.http.get<AlertRule[]>(url)
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  createAlertRule(data: Partial<AlertRule>): Observable<ApiResponse<AlertRule>> {
    const url = `${this.baseUrl}/observability/alert-rule`;
    return this.http.post<AlertRule>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  updateAlertRule(id: string, data: Partial<AlertRule>): Observable<ApiResponse<AlertRule>> {
    const url = `${this.baseUrl}/observability/alert-rule/${id}`;
    return this.http.put<AlertRule>(url, data)
      .pipe(map(response => this.wrapResponse(response)));
  }

  deleteAlertRule(id: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/observability/alert-rule/${id}`;
    return this.http.delete<any>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Audit Logs
  getAuditLogs(params?: any): Observable<ApiResponse<AuditLog[]>> {
    const url = `${this.baseUrl}/observability/audit-logs`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<AuditLog[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getAuditLog(id: string): Observable<ApiResponse<AuditLog>> {
    const url = `${this.baseUrl}/observability/audit-log/${id}`;
    return this.http.get<AuditLog>(url)
      .pipe(map(response => this.wrapResponse(response)));
  }

  getUserAuditLogs(userId: string, params?: any): Observable<ApiResponse<AuditLog[]>> {
    const url = `${this.baseUrl}/observability/audit-logs/user/${userId}`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<AuditLog[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getResourceAuditLogs(resourceType: string, resourceId: string, params?: any): Observable<ApiResponse<AuditLog[]>> {
    const url = `${this.baseUrl}/observability/audit-logs/resource/${resourceType}/${resourceId}`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<AuditLog[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  exportAuditLogs(params?: any): Observable<Blob> {
    const url = `${this.baseUrl}/observability/audit-logs/export`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get(url, { params: httpParams, responseType: 'blob' });
  }

  // Performance Monitoring
  getPerformanceMetrics(entityId: string, entityType: string, timeRange?: string): Observable<ApiResponse<PerformanceMetrics>> {
    const url = `${this.baseUrl}/observability/performance/${entityType}/${entityId}`;
    let httpParams = new HttpParams();
    if (timeRange) {
      httpParams = httpParams.set('timeRange', timeRange);
    }
    return this.http.get<PerformanceMetrics>(url, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  getSystemPerformance(timeRange?: string): Observable<ApiResponse<PerformanceMetrics>> {
    const url = `${this.baseUrl}/observability/performance/system`;
    let httpParams = new HttpParams();
    if (timeRange) {
      httpParams = httpParams.set('timeRange', timeRange);
    }
    return this.http.get<PerformanceMetrics>(url, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  // Usage Analytics
  getUsageAnalytics(params?: any): Observable<ApiResponse<UsageAnalytics>> {
    const url = `${this.baseUrl}/observability/usage`;
    const httpParams = this.buildHttpParams(params);
    return this.http.get<UsageAnalytics>(url, { params: httpParams })
      .pipe(map(response => this.wrapResponse(response)));
  }

  getTopUsers(timeRange?: string): Observable<ApiResponse<any[]>> {
    const url = `${this.baseUrl}/observability/usage/top-users`;
    let httpParams = new HttpParams();
    if (timeRange) {
      httpParams = httpParams.set('timeRange', timeRange);
    }
    return this.http.get<any[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  getTopResources(timeRange?: string): Observable<ApiResponse<any[]>> {
    const url = `${this.baseUrl}/observability/usage/top-resources`;
    let httpParams = new HttpParams();
    if (timeRange) {
      httpParams = httpParams.set('timeRange', timeRange);
    }
    return this.http.get<any[]>(url, { params: httpParams })
      .pipe(map(response => this.wrapArrayResponse(response)));
  }

  // Helper method to build HttpParams from object
  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
              httpParams = httpParams.append(key, value.toString());
            });
          } else {
            httpParams = httpParams.set(key, params[key].toString());
          }
        }
      });
    }
    return httpParams;
  }

  // Helper method to wrap a single object response to match the API response format
  private wrapResponse<T>(data: T): ApiResponse<T> {
    return { data, success: true };
  }

  // Helper method to wrap an array response to match the API response format
  private wrapArrayResponse<T>(data: T[]): ApiResponse<T[]> {
    return { 
      data: data || [], 
      total: Array.isArray(data) ? data.length : 0,
      success: true 
    };
  }
}
