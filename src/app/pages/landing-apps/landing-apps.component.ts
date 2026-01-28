import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface LandingApp {
  key: string;
  label: string;
  description: string;
  icon: string;
  route: string;
  gradient: string;
}

@Component({
  selector: 'app-landing-apps',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-apps.component.html',
  styleUrls: ['./landing-apps.component.scss'],
})
export class LandingAppsComponent {
  apps: LandingApp[] = [
    {
      key: 'retail',
      label: 'Retail Service',
      description: 'POS, tồn kho, e-commerce cho cửa hàng bán lẻ.',
      icon: 'pi pi-shopping-bag',
      route: '/retail',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      key: 'governance',
      label: 'Governance',
      description: 'Quyền, team, policy & compliance cho dữ liệu.',
      icon: 'pi pi-shield',
      route: '/governance/policies',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      key: 'planning',
      label: 'Planning',
      description: 'Lập kế hoạch vận hành & logistics.',
      icon: 'pi pi-truck',
      route: '/planning',
      gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    },
    {
      key: 'marketplace',
      label: 'Marketplace',
      description: 'Data products & data discovery cho toàn tổ chức.',
      icon: 'pi pi-shopping-cart',
      route: '/marketplace',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      key: 'blogger',
      label: 'Blogger',
      description: 'Quản lý nội dung, bài viết và xuất bản.',
      icon: 'pi pi-pencil',
      route: '/blogger',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
      key: 'hotel',
      label: 'Hotel',
      description: 'Đặt phòng, quản lý khách sạn & vận hành.',
      icon: 'pi pi-building',
      route: '/hotel',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
      key: 'admanager',
      label: 'Ad Manager',
      description: 'Quản lý chiến dịch quảng cáo & báo cáo.',
      icon: 'pi pi-bullhorn',
      route: '/ad-manager',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    },
    {
      key: 'settings',
      label: 'Settings',
      description: 'Cấu hình hệ thống & tuỳ chọn cho workspace.',
      icon: 'pi pi-cog',
      route: '/settings',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
  ];
}

