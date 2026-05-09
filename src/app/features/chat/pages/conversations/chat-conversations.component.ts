import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ChatService } from '../../services/chat.service';
import { UnifiedTemplateCreate, UnifiedTemplateUpdate } from '../../models/chat.model';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

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

interface TemplateForm {
  name: string;
  code: string;
  channel: string;
  category: string;
  content: string;
  enabled: boolean;
  variablesText: string;
  tagsText: string;
  previewVars: Record<string, string>;
}

@Component({
  selector: 'app-chat-conversations',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    TreeModule, ButtonModule, TableModule, TagModule,
    InputTextModule, SkeletonModule, DialogModule,
    DropdownModule, ConfirmDialogModule, ToastModule
  ],
  providers: [MessageService, ConfirmationService],
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
                <h1 class="text-2xl font-bold text-gray-900">Templates</h1>
                <p class="text-gray-600 m-0">Explore and manage templates across all channels</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <p-button icon="pi pi-refresh" severity="info" [outlined]="true" [rounded]="true" (onClick)="loadTemplates()"></p-button>
              <p-button icon="pi pi-plus" label="Create Template" severity="info" (onClick)="createDialogVisible = true"></p-button>
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
                <th>Actions</th>
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
                <td>
                  <div class="flex items-center gap-1">
                    <button type="button" class="ghost-action text-xs" (click)="openEditDialog(template)">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button type="button" class="ghost-action text-xs text-red-400" (click)="deleteTemplate(template)">
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="8" class="text-center py-8">
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

    <!-- Create Template Dialog -->
    <p-dialog [(visible)]="createDialogVisible" [modal]="true" [style]="{width:'600px'}" header="Create Template" [closable]="true">
      <div class="form-stack p-4">
        <div class="form-grid">
          <div>
            <label class="form-label">Name *</label>
            <input type="text" class="form-input" [(ngModel)]="createForm.name" placeholder="Support Handoff" />
          </div>
          <div>
            <label class="form-label">Channel *</label>
            <p-dropdown [options]="channelOptions" [(ngModel)]="createForm.channel"
                        optionLabel="label" optionValue="value"
                        placeholder="Select channel" class="w-full"></p-dropdown>
          </div>
        </div>
        <div class="form-grid">
          <div>
            <label class="form-label">Code</label>
            <input type="text" class="form-input" [(ngModel)]="createForm.code" placeholder="auto-generated" />
            <p class="form-hint">Unique identifier. Auto-generated from name if empty.</p>
          </div>
          <div>
            <label class="form-label">Category</label>
            <p-dropdown [options]="categoryOptions" [(ngModel)]="createForm.category"
                        optionLabel="label" optionValue="value"
                        class="w-full"></p-dropdown>
          </div>
        </div>
        <div>
          <label class="form-label">Content *</label>
          <textarea class="form-input" rows="5" [(ngModel)]="createForm.content"
                    (ngModelChange)="onContentChange(createForm)"
                    [placeholder]="'Hi {{first_name}}, your request has been received...'"></textarea>
        </div>
        <div class="form-grid">
          <div>
            <label class="form-label">Variables</label>
            <input type="text" class="form-input" [(ngModel)]="createForm.variablesText" placeholder="first_name, store_name" />
            <p class="form-hint">Detected from {{'{{variable}}'}} in content.</p>
          </div>
          <div>
            <label class="form-label">Tags</label>
            <input type="text" class="form-input" [(ngModel)]="createForm.tagsText" placeholder="onboarding, vip" />
          </div>
        </div>

        <!-- Preview -->
        <div *ngIf="createForm.content.trim()" class="template-preview-block">
          <p class="form-label mb-2">Preview</p>
          <div *ngFor="let v of extractVariables(createForm.content)" class="flex items-center gap-2 mb-1">
            <label class="text-xs text-gray-500 w-28 flex-shrink-0">{{ v }}</label>
            <input type="text" class="form-input text-xs flex-1"
                   [ngModel]="createForm.previewVars[v] || ''"
                   (ngModelChange)="createForm.previewVars[v] = $event"
                   [placeholder]="'Value for ' + v" />
          </div>
          <div class="preview-rendered mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap">{{ createPreview }}</div>
        </div>

        <label class="checkbox-row">
          <input type="checkbox" [(ngModel)]="createForm.enabled" />
          <span>Enable immediately</span>
        </label>
      </div>
      <ng-template pTemplate="footer">
        <button pButton type="button" label="Cancel" class="p-button-text" (click)="createDialogVisible = false"></button>
        <button pButton type="button" label="Create" icon="pi pi-check" (click)="createTemplate()" [loading]="creating"></button>
      </ng-template>
    </p-dialog>

    <!-- Edit Template Dialog -->
    <p-dialog [(visible)]="editDialogVisible" [modal]="true" [style]="{width:'600px'}" header="Edit Template" [closable]="true">
      <div class="form-stack p-4" *ngIf="editingTemplate">
        <div class="form-grid">
          <div>
            <label class="form-label">Name</label>
            <input type="text" class="form-input" [(ngModel)]="editForm.name" />
          </div>
          <div>
            <label class="form-label">Channel</label>
            <p-tag [value]="editingTemplate.channel" [severity]="getChannelSeverity(editingTemplate.channel)"></p-tag>
            <p class="form-hint mt-1">Channel cannot be changed after creation.</p>
          </div>
        </div>
        <div>
          <label class="form-label">Category</label>
          <p-dropdown [options]="categoryOptions" [(ngModel)]="editForm.category" optionLabel="label" optionValue="value" class="w-full"></p-dropdown>
        </div>
        <div>
          <label class="form-label">Content</label>
          <textarea class="form-input" rows="5" [(ngModel)]="editForm.content"
                    (ngModelChange)="onContentChange(editForm)"></textarea>
        </div>
        <div class="form-grid">
          <div>
            <label class="form-label">Variables</label>
            <input type="text" class="form-input" [(ngModel)]="editForm.variablesText" />
          </div>
          <div>
            <label class="form-label">Tags</label>
            <input type="text" class="form-input" [(ngModel)]="editForm.tagsText" />
          </div>
        </div>

        <!-- Edit preview -->
        <div *ngIf="editForm.content.trim()" class="template-preview-block">
          <p class="form-label mb-2">Preview</p>
          <div *ngFor="let v of extractVariables(editForm.content)" class="flex items-center gap-2 mb-1">
            <label class="text-xs text-gray-500 w-28 flex-shrink-0">{{ v }}</label>
            <input type="text" class="form-input text-xs flex-1"
                   [ngModel]="editForm.previewVars[v] || ''"
                   (ngModelChange)="editForm.previewVars[v] = $event"
                   [placeholder]="'Value for ' + v" />
          </div>
          <div class="preview-rendered mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700 whitespace-pre-wrap">{{ getEditPreview() }}</div>
        </div>

        <label class="checkbox-row">
          <input type="checkbox" [(ngModel)]="editForm.enabled" />
          <span>Enabled</span>
        </label>
      </div>
      <ng-template pTemplate="footer">
        <button pButton type="button" label="Cancel" class="p-button-text" (click)="editDialogVisible = false"></button>
        <button pButton type="button" label="Save" icon="pi pi-check" (click)="saveEdit()" [loading]="saving"></button>
      </ng-template>
    </p-dialog>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `
})
export class ChatConversationsComponent implements OnInit {
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

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

  readonly channelOptions = [
    { label: 'Telegram', value: 'telegram' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' }
  ];

  readonly categoryOptions = [
    { label: 'Support', value: 'support' },
    { label: 'Onboarding', value: 'onboarding' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Notification', value: 'notification' },
    { label: 'Other', value: 'other' }
  ];

  // ── Create form ─────────────────────────────────────────────────────────────
  createDialogVisible = false;
  createForm: TemplateForm = this._emptyForm();
  creating = false;

  get createPreview(): string {
    return this._renderPreview(this.createForm.content, this.createForm.previewVars);
  }

  // ── Edit form ───────────────────────────────────────────────────────────────
  editDialogVisible = false;
  editingTemplate: CmcTemplate | null = null;
  editForm: TemplateForm = this._emptyForm();
  saving = false;

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

  // ── Create ─────────────────────────────────────────────────────────────────
  createTemplate(): void {
    const f = this.createForm;
    if (!f.name.trim() || !f.channel || !f.content.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Missing fields', detail: 'Name, channel, and content are required.' });
      return;
    }
    this.creating = true;
    const payload: UnifiedTemplateCreate = {
      name: f.name.trim(),
      code: f.code.trim() || this._slugify(f.name),
      channel: f.channel,
      category: f.category || 'support',
      content: f.content.trim(),
      enabled: f.enabled,
      variables: this._parseList(f.variablesText),
      tags: this._parseList(f.tagsText)
    };
    this.chatService.createUnifiedTemplate(payload).subscribe({
      next: () => {
        this.creating = false;
        this.createDialogVisible = false;
        this.createForm = this._emptyForm();
        this.messageService.add({ severity: 'success', summary: 'Created', detail: payload.name });
        this.loadTemplates();
      },
      error: () => {
        this.creating = false;
        this.messageService.add({ severity: 'error', summary: 'Create failed', detail: 'Unable to create template' });
      }
    });
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  openEditDialog(template: CmcTemplate): void {
    this.editingTemplate = template;
    this.editForm = {
      name: template.name,
      code: '',
      channel: template.category,
      category: template.category,
      content: template.content,
      enabled: template.enabled,
      variablesText: (template.variables || []).join(', '),
      tagsText: '',
      previewVars: Object.fromEntries((template.variables || []).map(v => [v, '']))
    };
    this.editDialogVisible = true;
  }

  saveEdit(): void {
    if (!this.editingTemplate) return;
    const f = this.editForm;
    const payload: UnifiedTemplateUpdate = {
      name: f.name.trim(),
      category: f.category,
      content: f.content.trim(),
      enabled: f.enabled,
      variables: this._parseList(f.variablesText),
      tags: this._parseList(f.tagsText)
    };
    this.saving = true;
    this.chatService.updateUnifiedTemplate(this.editingTemplate.id, payload).subscribe({
      next: () => {
        this.saving = false;
        this.editDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: payload.name });
        this.loadTemplates();
      },
      error: () => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Save failed', detail: 'Unable to update template' });
      }
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  deleteTemplate(template: CmcTemplate): void {
    this.confirmationService.confirm({
      message: `Delete "${template.name}"? This cannot be undone.`,
      accept: () => {
        this.chatService.deleteUnifiedTemplate(template.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: template.name });
            this.loadTemplates();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Delete failed', detail: template.name })
        });
      }
    });
  }

  // ── Template preview ───────────────────────────────────────────────────────
  getEditPreview(): string {
    return this._renderPreview(this.editForm.content, this.editForm.previewVars);
  }

  extractVariables(content: string): string[] {
    const matches = content.matchAll(/{{\s*(\w+)\s*}}/g);
    return [...new Set([...matches].map(m => m[1]))];
  }

  onContentChange(form: TemplateForm): void {
    const vars = this.extractVariables(form.content);
    form.variablesText = vars.join(', ');
    const next: Record<string, string> = {};
    for (const v of vars) { next[v] = form.previewVars[v] || ''; }
    form.previewVars = next;
  }

  getChannelSeverity(channel: string): 'info' | 'success' | 'warning' | 'secondary' {
    switch (channel) {
      case 'telegram': return 'info';
      case 'facebook': return 'success';
      case 'email': return 'warning';
      case 'sms': return 'secondary';
      default: return 'secondary';
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  private _emptyForm(): TemplateForm {
    return { name: '', code: '', channel: '', category: 'support', content: '', enabled: true, variablesText: '', tagsText: '', previewVars: {} };
  }

  private _parseList(text: string): string[] {
    return text.split(',').map(s => s.trim()).filter(Boolean);
  }

  private _slugify(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  private _renderPreview(content: string, vars: Record<string, string>): string {
    return Object.entries(vars).reduce(
      (text, [key, val]) => text.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), val || `{{${key}}}`),
      content
    );
  }
}
