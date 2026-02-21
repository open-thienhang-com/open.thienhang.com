import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { Conversation } from '../../models/chat.model';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-chat-conversations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    TableModule,
    TagModule,
    DropdownModule,
    InputTextModule,
    SkeletonModule
  ],
  template: `
    <div class="bg-gray-50 min-h-screen p-6">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <i class="pi pi-comments text-white text-xl"></i>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Conversations</h1>
              <p class="text-gray-600 m-0">Monitor live conversations and agent assignment status</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <p-button icon="pi pi-refresh" severity="info" [outlined]="true" [rounded]="true" (onClick)="loadConversations()" class="hidden sm:inline-flex"></p-button>
            <p-button icon="pi pi-filter" severity="secondary" [outlined]="!showFilters" [rounded]="true" (onClick)="showFilters = !showFilters" class="hidden sm:inline-flex"></p-button>
            <p-button label="Dashboard" icon="pi pi-home" severity="secondary" [outlined]="true" [routerLink]="['/chat']" class="hidden sm:inline-flex"></p-button>
            <p-button label="Analytics" icon="pi pi-chart-bar" severity="secondary" [outlined]="true" [routerLink]="['/chat/analytics']" class="hidden sm:inline-flex"></p-button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6" *ngIf="!loading">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm font-medium text-gray-600">Loaded Conversations</p>
          <p class="text-3xl font-bold text-gray-900">{{ filteredConversations.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm font-medium text-gray-600">Open</p>
          <p class="text-3xl font-bold text-blue-600">{{ countByStatus('open') }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm font-medium text-gray-600">Resolved</p>
          <p class="text-3xl font-bold text-green-600">{{ countByStatus('resolved') }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm font-medium text-gray-600">Escalated</p>
          <p class="text-3xl font-bold text-red-600">{{ countEscalated() }}</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6 mb-6" *ngIf="showFilters">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Search</label>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input type="text" pInputText [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Search by user, agent, platform" class="w-full" />
            </span>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Status</label>
            <p-dropdown [options]="statusOptions" [(ngModel)]="selectedStatus" optionLabel="label" optionValue="value" [showClear]="true" placeholder="All statuses" (onChange)="applyFilters()" class="w-full"></p-dropdown>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700">Platform</label>
            <p-dropdown [options]="platformOptions" [(ngModel)]="selectedPlatform" optionLabel="label" optionValue="value" [showClear]="true" placeholder="All platforms" (onChange)="applyFilters()" class="w-full"></p-dropdown>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <p-button label="Clear" icon="pi pi-filter-slash" severity="secondary" [outlined]="true" (onClick)="clearFilters()"></p-button>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6" *ngIf="loading">
        <div class="space-y-4">
          <p-skeleton height="4rem"></p-skeleton>
          <p-skeleton height="4rem"></p-skeleton>
          <p-skeleton height="4rem"></p-skeleton>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm overflow-hidden" *ngIf="!loading">
        <p-table [value]="filteredConversations" [paginator]="true" [rows]="10" styleClass="p-datatable-sm" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} conversations" [showCurrentPageReport]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>Customer</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Agent</th>
              <th>Sentiment</th>
              <th>Messages</th>
              <th>Last Message</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-conversation>
            <tr>
              <td>
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900">{{ conversation.user_name }}</span>
                  <span class="text-xs text-gray-500">{{ conversation.user_id }}</span>
                </div>
              </td>
              <td><p-tag [value]="conversation.platform" severity="info"></p-tag></td>
              <td><p-tag [value]="conversation.status" [severity]="getStatusSeverity(conversation.status)"></p-tag></td>
              <td>{{ conversation.agent || 'Unassigned' }}</td>
              <td><p-tag [value]="conversation.sentiment" [severity]="getSentimentSeverity(conversation.sentiment)"></p-tag></td>
              <td>{{ conversation.message_count }}</td>
              <td class="max-w-80">
                <div class="text-sm text-gray-600 truncate" [title]="conversation.last_message">{{ conversation.last_message }}</div>
                <div class="text-xs text-gray-400">{{ conversation.last_message_time | date:'short' }}</div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class ChatConversationsComponent implements OnInit {
  private chatService = inject(ChatService);
  private router = inject(Router);

  loading = false;
  showFilters = false;
  totalRecords = 0;

  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];

  searchTerm = '';
  selectedStatus: string | null = null;
  selectedPlatform: string | null = null;

  statusOptions = [
    { label: 'Open', value: 'open' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Escalated', value: 'escalated' }
  ];

  platformOptions = [
    { label: 'Web', value: 'web' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'Slack', value: 'slack' },
    { label: 'Email', value: 'email' }
  ];

  ngOnInit() {
    this.loadConversations();
  }

  loadConversations() {
    this.loading = true;
    this.chatService.getConversations(100, 0).subscribe({
      next: (res) => {
        this.conversations = res.data || [];
        this.totalRecords = res.total || this.conversations.length;
        this.syncPlatformOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading conversations', err);
        this.loading = false;
      }
    });
  }

  syncPlatformOptions() {
    const values = Array.from(new Set(this.conversations.map(item => item.platform).filter(Boolean)));
    this.platformOptions = values.map(value => ({ label: this.toTitle(value), value }));
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredConversations = this.conversations.filter((item) => {
      const matchStatus = !this.selectedStatus || item.status === this.selectedStatus;
      const matchPlatform = !this.selectedPlatform || item.platform === this.selectedPlatform;
      const haystack = `${item.user_name} ${item.agent || ''} ${item.platform} ${item.last_message}`.toLowerCase();
      const matchSearch = !term || haystack.includes(term);
      return matchStatus && matchPlatform && matchSearch;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedStatus = null;
    this.selectedPlatform = null;
    this.applyFilters();
  }

  countByStatus(status: string): number {
    return this.filteredConversations.filter(item => item.status === status).length;
  }

  countEscalated(): number {
    return this.filteredConversations.filter(item => item.escalated).length;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch ((status || '').toLowerCase()) {
      case 'resolved':
        return 'success';
      case 'open':
        return 'info';
      case 'pending':
        return 'warn';
      case 'escalated':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getSentimentSeverity(sentiment: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch ((sentiment || '').toLowerCase()) {
      case 'positive':
        return 'success';
      case 'neutral':
        return 'info';
      case 'negative':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  private toTitle(value: string): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  }
}
