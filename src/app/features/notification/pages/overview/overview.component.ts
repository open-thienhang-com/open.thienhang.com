import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-notification-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    DividerModule,
    TagModule
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class NotificationOverviewComponent implements OnInit {
  
  businessValues = [
    {
      icon: 'pi pi-bolt',
      title: 'Real-time Delivery',
      description: 'Hỗ trợ đa kênh Email, SMS, Webhook với độ trễ thấp',
      color: '#3b82f6'
    },
    {
      icon: 'pi pi-shield',
      title: 'Reliability & DLQ',
      description: 'Cơ chế tự động retry và hàng đợi thư chết (Dead Letter Queue)',
      color: '#10b981'
    },
    {
      icon: 'pi pi-sliders-h',
      title: 'Intelligent Throttling',
      description: 'Quản lý lưu lượng và giới hạn tốc độ (Rate Limiting) thông minh',
      color: '#f59e0b'
    },
    {
      icon: 'pi pi-search',
      title: 'Comprehensive Audit',
      description: 'Truy vết toàn bộ lịch sử gửi tin và phản hồi từ nhà cung cấp',
      color: '#8b5cf6'
    }
  ];

  businessFlows = [
    {
      step: '1',
      title: 'Quản lý mẫu (Template Explorer)',
      icon: 'pi pi-copy',
      description: 'Tập trung quản lý nội dung đa ngôn ngữ trên toàn bộ các kênh',
      features: [
        'Hỗ trợ placeholders động {{name}}',
        'Phiên bản hóa (Versioning) các mẫu tin',
        'Preview nội dung theo từng thiết bị (Email/SMS)'
      ],
      route: '/notification/explorer',
      color: '#fa709a'
    },
    {
      step: '2',
      title: 'Gửi tin (Notification Composer)',
      icon: 'pi pi-send',
      description: 'Giao diện trực quan để thử nghiệm và gửi thông báo',
      features: [
        'Chọn mẫu hoặc nhập nội dung trực tiếp',
        'Tự động chọn kênh (Smart Channel Selection)',
        'Gửi tin hàng loạt (Bulk sending)'
      ],
      route: '/notification/composer',
      color: '#30cfd0'
    },
    {
      step: '3',
      title: 'Truy vết (Audit Trail)',
      icon: 'pi pi-history',
      description: 'Giám sát hành trình của từng thông báo',
      features: [
        'Trạng thái: Pending, Sent, Delivered, Failed',
        'Phân tích lỗi chi tiết từ nhà cung cấp (Provider rejection)',
        'Thống kê hiệu suất theo kênh'
      ],
      route: '/notification/audit',
      color: '#330867'
    }
  ];

  integrations = [
    { name: 'Email Providers', items: ['SendGrid', 'Amazon SES', 'Mailgun'], icon: 'pi pi-envelope' },
    { name: 'SMS Gateways', items: ['Twilio', 'Infobip', 'ESMS'], icon: 'pi pi-comment' },
    { name: 'Push & Webhooks', items: ['Firebase (FCM)', 'Custom Webhooks'], icon: 'pi pi-globe' }
  ];

  systemHealth = [
    { name: 'API Gateway', status: 'Online', latency: '45ms', color: 'success' },
    { name: 'Email Worker', status: 'Active', latency: '1.2s', color: 'success' },
    { name: 'SMS Provider', status: 'Active', latency: '0.8s', color: 'success' },
    { name: 'Redis Cache', status: 'Optimized', latency: '2ms', color: 'info' }
  ];

  deliveryStats = [
    { label: 'Today', value: '124,502', trend: '+12%', color: 'blue' },
    { label: 'Success Rate', value: '98.4%', trend: 'Stable', color: 'emerald' },
    { label: 'DLQ Count', value: '42', trend: '-5%', color: 'rose' },
    { label: 'Avg Latency', value: '1.4s', trend: '-200ms', color: 'amber' }
  ];

  ngOnInit(): void {
  }
}
