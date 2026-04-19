import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChatService } from '../../services/chat.service';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TreeNode } from 'primeng/api';

interface CmcTemplate {
  id: string;
  template_id: string;
  name: string;
  category: string;
  content: string;
  enabled: boolean;
  variables: string[];
  updated_at: string;
  created_at: string;
}

interface ChannelNode {
  id: string;
  name: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-chat-conversations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TreeModule,
    ButtonModule,
    TableModule,
    TagModule,
    InputTextModule,
    SkeletonModule
  ],
  template: `
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar: Channel Tree -->
      <aside class="min-w-[16rem] bg-white border-r border-gray-200 flex flex-col py-6 px-2">
        <h3 class="text-lg font-bold text-gray-800 mb-4 px-2">Channels</h3>
        <div class="space-y-1">
          <div *ngFor="let channel of channels" 
               class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
               [class.bg-blue-50]="selectedChannel === channel.id"
               [class.text-blue-700]="selectedChannel === channel.id"
               [class.hover:bg-gray-100]="selectedChannel !== channel.id"
               (click)="selectChannel(channel.id)">
            <i [class]="channel.icon + ' text-xl'"></i>
            <span class="flex-1 font-medium">{{ channel.name }}</span>
            <span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{{ channel.count }}</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col gap-6 p-6">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <i [class]="getChannelIcon(selectedChannel) + ' text-white text-xl'"></i>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">Templates Explorer</h1>
                <p class="text-gray-600 m-0">Explore and manage templates across all channels</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <p-button icon="pi pi-refresh" severity="info" [outlined]="true" [rounded]="true" (onClick)="loadTemplates()"></p-button>
              
            </div>
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex gap-4 items-center">
            <span class="p-input-icon-left flex-1">
              <i class="pi pi-search"></i>
              <input type="text" pInputText [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="Search templates..." class="w-full" />
            </span>
            <select [(ngModel)]="categoryFilter" (change)="applyFilters()" class="p-2 rounded border border-gray-300">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
            </select>
          </div>
        </div>

        <!-- Loading Skeleton -->
        <div class="bg-white rounded-lg shadow-sm p-6" *ngIf="loading">
          <div class="space-y-4">
            <p-skeleton height="4rem"></p-skeleton>
            <p-skeleton height="4rem"></p-skeleton>
            <p-skeleton height="4rem"></p-skeleton>
          </div>
        </div>

        <!-- Templates Table -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden" *ngIf="!loading">
          <p-table [value]="filteredTemplates" [paginator]="true" [rows]="10" styleClass="p-datatable-sm" currentPageReportTemplate="Showing {first} to {last} of {totalRecords} templates" [showCurrentPageReport]="true">
            <ng-template pTemplate="header">
              <tr>
                <th>Template ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Content</th>
                <th>Variables</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-template>
              <tr class="cursor-pointer hover:bg-gray-50">
                <td>
                  <span class="font-mono text-sm text-gray-600">{{ template.template_id }}</span>
                </td>
                <td>
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-900">{{ template.name }}</span>
                    <span class="text-xs text-gray-500">{{ template.id }}</span>
                  </div>
                </td>
                <td><p-tag [value]="template.category" severity="info"></p-tag></td>
                <td class="max-w-xs">
                  <div class="text-sm text-gray-600 truncate" [title]="template.content">{{ template.content }}</div>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let variable of template.variables" class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                      {{ '{{' + variable + '}}' }}
                    </span>
                    <span *ngIf="!template.variables || template.variables.length === 0" class="text-gray-400 text-xs">No variables</span>
                  </div>
                </td>
                <td><p-tag [value]="template.enabled ? 'Enabled' : 'Disabled'" [severity]="template.enabled ? 'success' : 'danger'"></p-tag></td>
                <td class="text-sm text-gray-500">{{ template.updated_at | date:'short' }}</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="text-center py-8">
                  <div class="flex flex-col items-center">
                    <i class="pi pi-inbox text-4xl text-gray-300 mb-2"></i>
                    <p class="text-gray-500">No templates found for {{ getChannelName(selectedChannel) }}</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </main>
    </div>
  `
})
export class ChatConversationsComponent implements OnInit {
  private chatService = inject(ChatService);

  loading = false;
  totalRecords = 0;
  searchTerm = '';
  categoryFilter = '';

  templates: CmcTemplate[] = [];
  filteredTemplates: CmcTemplate[] = [];
  categories: string[] = [];

  selectedChannel = 'telegram';

  channels: ChannelNode[] = [
    { id: 'telegram', name: 'Telegram', icon: 'pi pi-telegram', count: 0 },
    { id: 'facebook', name: 'Facebook', icon: 'pi pi-facebook', count: 0 },
    { id: 'email', name: 'Email', icon: 'pi pi-envelope', count: 0 },
    { id: 'sms', name: 'SMS', icon: 'pi pi-comment', count: 0 }
  ];

  ngOnInit() {
    this.loadTemplates();
  }

  selectChannel(channelId: string) {
    this.selectedChannel = channelId;
    this.loadTemplates();
  }

  loadTemplates() {
    this.loading = true;
    const skip = 0;
    const limit = 50;

    let observable;
    switch (this.selectedChannel) {
      case 'telegram':
        observable = this.chatService.getCmcTelegramTemplates(skip, limit);
        break;
      case 'facebook':
        observable = this.chatService.getCmcFacebookTemplates(skip, limit);
        break;
      case 'email':
        observable = this.chatService.getCmcEmailTemplates(skip, limit);
        break;
      case 'sms':
        observable = this.chatService.getCmcSmsTemplates(skip, limit);
        break;
      default:
        observable = this.chatService.getCmcTelegramTemplates(skip, limit);
    }

    observable.subscribe({
      next: (res) => {
        this.templates = (res.data || []).map(t => this.normalizeTemplate(t));
        this.totalRecords = res.total || this.templates.length;
        this.syncCategories();
        this.applyFilters();
        this.updateChannelCount();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading templates', err);
        this.templates = [];
        this.filteredTemplates = [];
        this.loading = false;
      }
    });
  }

  private normalizeTemplate(t: any): CmcTemplate {
    return {
      id: t.id || t._id || '',
      template_id: t.template_id || '',
      name: t.name || '',
      category: t.category || '',
      content: t.content || '',
      enabled: t.enabled ?? true,
      variables: t.variables || [],
      updated_at: t.updated_at || '',
      created_at: t.created_at || ''
    };
  }

  syncCategories() {
    const cats = new Set(this.templates.map(t => t.category).filter(Boolean));
    this.categories = Array.from(cats);
  }

  updateChannelCount() {
    const channel = this.channels.find(c => c.id === this.selectedChannel);
    if (channel) {
      channel.count = this.totalRecords;
    }
  }

  applyFilters() {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredTemplates = this.templates.filter(t => {
      const matchCategory = !this.categoryFilter || t.category === this.categoryFilter;
      const haystack = `${t.name} ${t.template_id} ${t.content} ${t.category}`.toLowerCase();
      const matchSearch = !term || haystack.includes(term);
      return matchCategory && matchSearch;
    });
  }

  getChannelName(id: string): string {
    const channel = this.channels.find(c => c.id === id);
    return channel ? channel.name : id;
  }

  getChannelIcon(id: string): string {
    const channel = this.channels.find(c => c.id === id);
    return channel ? channel.icon : 'pi pi-comments';
  }
}
