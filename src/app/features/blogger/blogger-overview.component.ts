import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';

import {
  BloggerService,
  BloggerOverview,
  BloggerVersion,
  BloggerQuality,
  BloggerCost,
  BloggerFeaturesResponse
} from './services/blogger.service';

export type BloggerSection = 'blog' | 'narrative' | 'quality' | 'features' | 'governance' | 'blogs';

export interface SidebarSection {
  key: BloggerSection;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-blogger-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TabViewModule,
    TagModule,
    ProgressBarModule,
    ChartModule,
    TableModule,
    ToastModule,
    SkeletonModule
  ],
  providers: [MessageService],
  templateUrl: './blogger-overview.component.html',
  styleUrls: ['./blogger-overview.component.scss']
})
export class BloggerOverviewComponent implements OnInit {
  private bloggerService = inject(BloggerService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);

  overview: BloggerOverview | null = null;
  loadingOverview = false;
  overviewError: string | null = null;

  activeSection: BloggerSection = 'blog';
  sections: SidebarSection[] = [
    { key: 'blog', label: 'Blog Feed', icon: 'pi pi-megaphone', description: 'Real-time blog insights and published content' },
    { key: 'blogs', label: 'Blogs Management', icon: 'pi pi-briefcase', description: 'Manage blog properties and metadata' },
    { key: 'narrative', label: 'Overview', icon: 'pi pi-info-circle', description: 'Domain identity and purpose narrative' },
    { key: 'quality', label: 'Quality Assessment', icon: 'pi pi-shield', description: 'Data freshness and accuracy metrics' },
    { key: 'features', label: 'Feature Registry', icon: 'pi pi-list', description: 'Available endpoints and capabilities' },
    { key: 'governance', label: 'Governance', icon: 'pi pi-lock', description: 'Compliance and data sovereignty' }
  ];

  blogPosts: any[] = [];
  loadingBlog = false;
  blogError: string | null = null;
  totalBlogPosts = 0;

  version: BloggerVersion | null = null;
  loadingVersion = false;
  versionError: string | null = null;

  quality: BloggerQuality | null = null;
  loadingQuality = false;
  qualityError: string | null = null;

  cost: BloggerCost | null = null;
  loadingCost = false;
  costError: string | null = null;

  features: BloggerFeaturesResponse['data'] | null = null;
  loadingFeatures = false;
  featuresError: string | null = null;

  blogs: any[] = [];
  filteredBlogs: any[] = [];
  loadingBlogs = false;
  blogsError: string | null = null;
  totalBlogs = 0;

  // Modern UI properties
  viewMode: 'grid' | 'table' = 'grid';
  searchTerm = '';
  filters = {
    language: ''
  };
  languageOptions: any[] = [];

  costChartData: any;
  costChartOptions: any;

  ngOnInit() {
    this.loadAllData();
    this.initChartOptions();

    // Listen to query params for section switching
    this.route.queryParams.subscribe(params => {
      if (params['section']) {
        const section = params['section'] as BloggerSection;
        if (this.sections.some(s => s.key === section)) {
          this.activeSection = section;
        }
      }
    });
  }

  loadAllData() {
    this.loadOverview();
    this.loadVersion();
    this.loadQuality();
    this.loadCost();
    this.loadFeatures();
    this.loadBlogPosts();
    this.loadBlogs();
  }

  get activeSectionMeta(): SidebarSection {
    return this.sections.find(s => s.key === this.activeSection) || this.sections[0];
  }

  switchSection(key: BloggerSection) {
    this.activeSection = key;
  }

  loadBlogPosts() {
    this.loadingBlog = true;
    this.blogError = null;
    this.bloggerService.getBloggers('published', 10, 0).subscribe({
      next: (res) => {
        this.blogPosts = res.data;
        this.totalBlogPosts = res.total;
        this.loadingBlog = false;
      },
      error: (err) => {
        this.blogError = 'Failed to load blog posts.';
        this.loadingBlog = false;
      }
    });
  }

  loadBlogs() {
    this.loadingBlogs = true;
    this.blogsError = null;
    this.bloggerService.getBlogs().subscribe({
      next: (res) => {
        this.blogs = res.data;
        this.totalBlogs = res.total;
        this.extractLanguageOptions(res.data);
        this.applyFilters();
        this.loadingBlogs = false;
      },
      error: (err) => {
        this.blogsError = 'Failed to load blogs list.';
        this.loadingBlogs = false;
      }
    });
  }

  extractLanguageOptions(blogs: any[]) {
    const langs = new Set<string>();
    blogs.forEach(blog => {
      if (blog.locale?.language) {
        langs.add(blog.locale.language);
      }
    });
    this.languageOptions = [
      { label: 'All Languages', value: '' },
      ...Array.from(langs).map(lang => ({
        label: lang.toUpperCase(),
        value: lang
      }))
    ];
  }

  applyFilters() {
    this.filteredBlogs = this.blogs.filter(blog => {
      const matchesSearch = !this.searchTerm ||
        blog.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (blog.description && blog.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        blog.url.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesLang = !this.filters.language || blog.locale?.language === this.filters.language;

      return matchesSearch && matchesLang;
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filters.language = '';
    this.applyFilters();
  }

  setViewMode(mode: 'grid' | 'table') {
    this.viewMode = mode;
  }

  get activeFilterCount(): number {
    return (this.searchTerm ? 1 : 0) + (this.filters.language ? 1 : 0);
  }

  get hasSearchOrFilters(): boolean {
    return !!this.searchTerm || !!this.filters.language;
  }

  loadOverview() {
    this.loadingOverview = true;
    this.overviewError = null;
    this.bloggerService.getBloggerOverview().subscribe({
      next: (res) => { this.overview = res.data; this.loadingOverview = false; },
      error: (err) => { this.overviewError = 'Failed to load overview data.'; this.loadingOverview = false; }
    });
  }

  loadVersion() {
    this.loadingVersion = true;
    this.versionError = null;
    this.bloggerService.getBloggerVersion().subscribe({
      next: (res) => { this.version = res.data; this.loadingVersion = false; },
      error: (err) => { this.versionError = 'Failed to load version data.'; this.loadingVersion = false; }
    });
  }

  loadQuality() {
    this.loadingQuality = true;
    this.qualityError = null;
    this.bloggerService.getBloggerQuality().subscribe({
      next: (res) => { this.quality = res.data; this.loadingQuality = false; },
      error: (err) => { this.qualityError = 'Failed to load quality data.'; this.loadingQuality = false; }
    });
  }

  loadCost() {
    this.loadingCost = true;
    this.costError = null;
    this.bloggerService.getBloggerCost().subscribe({
      next: (res) => {
        this.cost = res.data;
        this.setupCostChart(res.data);
        this.loadingCost = false;
      },
      error: (err) => { this.costError = 'Failed to load cost data.'; this.loadingCost = false; }
    });
  }

  loadFeatures() {
    this.loadingFeatures = true;
    this.featuresError = null;
    this.bloggerService.getBloggerFeatures().subscribe({
      next: (res) => { this.features = res.data; this.loadingFeatures = false; },
      error: (err) => { this.featuresError = 'Failed to load features data.'; this.loadingFeatures = false; }
    });
  }

  setupCostChart(costData: BloggerCost) {
    const documentStyle = getComputedStyle(document.documentElement);
    const labels = Object.keys(costData.cost_breakdown);
    const data = Object.values(costData.cost_breakdown);

    this.costChartData = {
        labels: labels.map(l => l.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
        datasets: [{
            data: data,
            backgroundColor: [
                documentStyle.getPropertyValue('--blue-500'),
                documentStyle.getPropertyValue('--green-500'),
                documentStyle.getPropertyValue('--yellow-500'),
                documentStyle.getPropertyValue('--cyan-500'),
                documentStyle.getPropertyValue('--pink-500'),
                documentStyle.getPropertyValue('--indigo-500'),
            ],
            hoverBackgroundColor: [
                documentStyle.getPropertyValue('--blue-400'),
                documentStyle.getPropertyValue('--green-400'),
                documentStyle.getPropertyValue('--yellow-400'),
                documentStyle.getPropertyValue('--cyan-400'),
                documentStyle.getPropertyValue('--pink-400'),
                documentStyle.getPropertyValue('--indigo-400'),
            ]
        }]
    };
  }

  fallbackText(value?: string | null, fallback = '-'): string {
    return value || fallback;
  }

  numberOrFallback(value?: number | null): number | string {
    return typeof value === 'number' ? value : '-';
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    this.costChartOptions = {
        plugins: {
            legend: {
                labels: { color: textColor },
                position: 'bottom'
            }
        }
    };
  }
}
