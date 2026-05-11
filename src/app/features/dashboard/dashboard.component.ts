import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { CarouselModule } from 'primeng/carousel';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { MockArticlesService, ArticleMock } from '../blog/mock-articles.service';
import { AppSwitcherService } from '../../core/services/app-switcher.service';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  tags?: string[];
  featured?: boolean;
  image?: string;
}

interface AppTile {
  key: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    CarouselModule,
    ChipModule,
    DividerModule,
    BadgeModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  apps: AppTile[] = [
    { key: 'retail', label: 'Retail Service', icon: 'pi pi-shopping-bag', color: '#f97316', description: 'Manage inventory, POS, and e-commerce' },
    { key: 'catalog', label: 'Data Catalog', icon: 'pi pi-search', color: '#06b6d4', description: 'Explore and discover data assets' },
    { key: 'governance', label: 'Governance', icon: 'pi pi-shield', color: '#8b5cf6', description: 'Policies, roles, and compliance' },
    { key: 'marketplace', label: 'Marketplace', icon: 'pi pi-shopping-cart', color: '#ec4899', description: 'Browse and publish data products' },
    { key: 'blogger', label: 'Blogger', icon: 'pi pi-pencil', color: '#10b981', description: 'Write and manage blog posts' },
    { key: 'hotel', label: 'Hotel', icon: 'pi pi-building', color: '#6366f1', description: 'Hotel management system' },
    { key: 'admanager', label: 'Ad Manager', icon: 'pi pi-bullhorn', color: '#f59e0b', description: 'Create and track ad campaigns' },
    { key: 'settings', label: 'Settings', icon: 'pi pi-cog', color: '#64748b', description: 'Configure your workspace' }
  ];

  user = {
    name: 'Thien Hang',
    email: 'hang@thienhang.com',
    role: 'Product Manager',
    avatar: null as string | null,
    stats: {
      posts: 24,
      projects: 8,
      datasets: 156
    }
  };

  articles: Article[] = [];
  featuredArticles: Article[] = [];

  responsiveOptions = [
    { breakpoint: '1400px', numVisible: 1, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 1, numScroll: 1 },
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 }
  ];

  constructor(
    private mock: MockArticlesService,
    private appSwitcher: AppSwitcherService
  ) { }

  ngOnInit() {
    const raw = this.mock.getAll();
    this.articles = raw.map(r => ({
      id: r.id,
      title: r.title,
      excerpt: r.excerpt,
      author: r.author,
      date: r.date,
      tags: r.tags,
      featured: !!r.featured,
      image: r.image
    }));

    this.featuredArticles = this.articles.filter(a => a.featured).slice(0, 3);
  }

  initials(name: string) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  navigateToApp(appKey: string) {
    this.appSwitcher.selectApp(appKey as any);
  }
}
