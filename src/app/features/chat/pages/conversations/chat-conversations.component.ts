import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ChatService } from '../../services/chat.service';
import {
  TelegramRichTemplate, TelegramConversation,
  UnifiedTemplateCreate, UnifiedTemplateUpdate
} from '../../models/chat.model';
import { TelegramPreviewComponent } from '../../components/telegram-preview/telegram-preview.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface CmcTemplate {
  id: string;
  template_id: string;
  name: string;
  category: string;
  content: string;
  channel?: string;
  enabled: boolean;
  variables: string[];
  updated_at: string;
  created_at: string;
}

interface ChannelNode { id: string; name: string; icon: string; count: number; }

interface TemplateForm {
  name: string; code: string; channel: string; category: string;
  content: string; enabled: boolean; variablesText: string;
  tagsText: string; previewVars: Record<string, string>;
}

@Component({
  selector: 'app-chat-conversations',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    TelegramPreviewComponent,
    ButtonModule, TableModule, TagModule,
    InputTextModule, SkeletonModule, DialogModule,
    DropdownModule, ConfirmDialogModule, ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
<div class="gallery-shell">
  <!-- SIDEBAR -->
  <aside class="gallery-sidebar">
    <div class="sidebar-section">
      <div class="sidebar-title">Channels</div>
      @for (ch of channels; track ch.id) {
        <div class="sidebar-item" [class.active]="selectedChannel === ch.id" (click)="selectChannel(ch.id)">
          <i [class]="ch.icon + ' sidebar-icon'"></i>
          <span class="flex-1">{{ ch.name }}</span>
          <span class="sidebar-badge">{{ ch.count }}</span>
        </div>
      }
    </div>
    @if (selectedChannel === 'telegram') {
      <div class="sidebar-section">
        <div class="sidebar-title">Categories</div>
        <div class="sidebar-item" [class.active]="!categoryFilter()" (click)="categoryFilter.set('')">
          <span class="flex-1">All</span>
          <span class="sidebar-badge">{{ richTemplates().length }}</span>
        </div>
        @for (cat of richCategories(); track cat) {
          <div class="sidebar-item" [class.active]="categoryFilter() === cat" (click)="categoryFilter.set(cat)">
            <span class="flex-1">{{ cat }}</span>
            <span class="sidebar-badge">{{ categoryCounts()[cat] || 0 }}</span>
          </div>
        }
      </div>
    }
  </aside>

  <!-- MAIN -->
  <div class="gallery-main">
    <!-- Header -->
    <div class="gallery-header">
      <div>
        <h1 class="gallery-title">Template Gallery</h1>
        <p class="gallery-subtitle">Explore and manage message templates</p>
      </div>
      <div class="header-actions">
        @if (selectedChannel === 'telegram') {
          <button class="btn-seed" (click)="seedTemplates()" [disabled]="seeding()">
            <i [class]="seeding() ? 'pi pi-spin pi-spinner' : 'pi pi-download'"></i>
            {{ seeding() ? 'Initializing...' : 'Initialize Templates' }}
          </button>
        }
        <div class="search-box">
          <i class="pi pi-search search-icon"></i>
          <input type="text" [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)"
                 placeholder="Search templates..." class="search-input" />
        </div>
        @if (selectedChannel !== 'telegram') {
          <button class="btn-create" (click)="createDialogVisible = true">
            <i class="pi pi-plus"></i> New Template
          </button>
        }
      </div>
    </div>

    <!-- TELEGRAM: card gallery + detail panel -->
    @if (selectedChannel === 'telegram') {
      <div class="telegram-view">
        <div class="card-grid-area">
          @if (loading) {
            <div class="card-grid">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="template-card skeleton-card">
                  <div class="sk-line sk-badge"></div>
                  <div class="sk-line sk-name"></div>
                  <div class="sk-line sk-desc"></div>
                </div>
              }
            </div>
          } @else if (filteredRich().length === 0) {
            <div class="empty-state">
              <i class="pi pi-inbox empty-icon"></i>
              <p class="empty-title">No templates found</p>
              <p class="empty-sub">Click "Initialize Templates" to load 26 built-in Telegram templates</p>
              <button class="btn-seed" (click)="seedTemplates()" [disabled]="seeding()">
                <i class="pi pi-download"></i> Initialize Templates
              </button>
            </div>
          } @else {
            <div class="card-grid">
              @for (tpl of filteredRich(); track tpl.id) {
                <div class="template-card" [class.card-selected]="selectedRich()?.id === tpl.id" (click)="selectRich(tpl)">
                  <div class="card-badges">
                    <span class="type-badge" [style.background]="getMsgTypeColor(tpl.message_type)">
                      <i [class]="getMsgTypeIcon(tpl.message_type)"></i>
                      {{ tpl.message_type }}
                    </span>
                    <span class="cat-badge">{{ tpl.category }}</span>
                    @if (tpl.is_builtin) { <span class="builtin-icon" title="Built-in">🔒</span> }
                  </div>
                  <div class="card-name">{{ tpl.name }}</div>
                  <div class="card-desc">{{ tpl.description || getPayloadSnippet(tpl) }}</div>
                  @if (tpl.variables?.length) {
                    <div class="card-vars">
                      @for (v of tpl.variables.slice(0,3); track v) {
                        <span class="var-chip">{{ '{' + '{' + v + '}' + '}' }}</span>
                      }
                      @if (tpl.variables.length > 3) {
                        <span class="var-chip var-more">+{{ tpl.variables.length - 3 }}</span>
                      }
                    </div>
                  }
                  <div class="card-footer">
                    <span class="enabled-label" [class.enabled]="tpl.enabled">
                      <i class="pi pi-circle-fill" style="font-size:0.4rem"></i>
                      {{ tpl.enabled ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Detail panel -->
        @if (selectedRich()) {
          <div class="detail-panel">
            <div class="detail-header">
              <div class="detail-header-info">
                <span class="type-badge-sm" [style.background]="getMsgTypeColor(selectedRich()!.message_type)">
                  {{ selectedRich()!.message_type }}
                </span>
                <span class="detail-name">{{ selectedRich()!.name }}</span>
              </div>
              <button class="close-btn" (click)="selectedRich.set(null)"><i class="pi pi-times"></i></button>
            </div>

            <div class="detail-tabs">
              <button class="tab-btn" [class.tab-active]="detailTab() === 'preview'" (click)="detailTab.set('preview')">Preview</button>
              <button class="tab-btn" [class.tab-active]="detailTab() === 'variables'" (click)="detailTab.set('variables')">
                Variables
                @if (selectedRich()!.variables?.length) {
                  <span class="tab-count">{{ selectedRich()!.variables.length }}</span>
                }
              </button>
              <button class="tab-btn" [class.tab-active]="detailTab() === 'info'" (click)="detailTab.set('info')">Info</button>
            </div>

            <div class="detail-body">
              @if (detailTab() === 'preview') {
                <div class="preview-wrap">
                  <app-telegram-preview [template]="selectedRich()" [variables]="varValues()"></app-telegram-preview>
                </div>
              }
              @if (detailTab() === 'variables') {
                <div class="vars-tab">
                  @if (!selectedRich()!.variables?.length) {
                    <p class="no-vars">This template has no variables</p>
                  } @else {
                    @for (v of selectedRich()!.variables; track v) {
                      <div class="var-row">
                        <label class="var-label">{{ '{' + '{' + v + '}' + '}' }}</label>
                        <input type="text" class="var-input"
                               [ngModel]="varValues()[v] || ''"
                               (ngModelChange)="updateVar(v, $event)"
                               [placeholder]="'Enter ' + v" />
                      </div>
                    }
                    <p class="vars-hint">Changes update the Preview tab in real-time.</p>
                  }
                </div>
              }
              @if (detailTab() === 'info') {
                <div class="info-tab">
                  <div class="info-row"><span class="info-label">Template ID</span><span class="info-val mono">{{ selectedRich()!.template_id }}</span></div>
                  <div class="info-row"><span class="info-label">Type</span><span class="info-val">{{ selectedRich()!.message_type }}</span></div>
                  <div class="info-row"><span class="info-label">Category</span><span class="info-val">{{ selectedRich()!.category }}</span></div>
                  <div class="info-row"><span class="info-label">Built-in</span><span class="info-val">{{ selectedRich()!.is_builtin ? 'Yes' : 'No' }}</span></div>
                  <div class="info-row"><span class="info-label">Priority</span><span class="info-val">{{ selectedRich()!.priority }}</span></div>
                  @if (selectedRich()!.tags?.length) {
                    <div class="info-row">
                      <span class="info-label">Tags</span>
                      <span class="info-val">
                        @for (tag of selectedRich()!.tags; track tag) {
                          <span class="info-tag">{{ tag }}</span>
                        }
                      </span>
                    </div>
                  }
                  @if (selectedRich()!.created_at) {
                    <div class="info-row"><span class="info-label">Created</span><span class="info-val">{{ selectedRich()!.created_at | date:'medium' }}</span></div>
                  }
                  <div class="info-row"><span class="info-label">Updated</span><span class="info-val">{{ selectedRich()!.updated_at | date:'medium' }}</span></div>
                </div>
              }
            </div>

            <div class="detail-footer">
              <button class="btn-send" (click)="openConvPicker()" [disabled]="sending()">
                <i class="pi pi-send"></i> Send to customer
              </button>
              @if (!selectedRich()!.is_builtin) {
                <button class="btn-delete" (click)="deleteRich(selectedRich()!)"><i class="pi pi-trash"></i></button>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- OTHER CHANNELS: table view -->
    @if (selectedChannel !== 'telegram') {
      <div class="p-4">
        <div class="flex gap-3 mb-4">
          <div style="position:relative;flex:1">
            <i class="pi pi-search" style="position:absolute;left:0.6rem;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:0.85rem"></i>
            <input type="text" pInputText [(ngModel)]="v1SearchTerm" (input)="applyFilters()"
                   placeholder="Search templates..." style="width:100%;padding-left:2rem" />
          </div>
          <select [(ngModel)]="v1CategoryFilter" (change)="applyFilters()" class="p-2 rounded border border-gray-300 text-sm">
            <option value="">All Categories</option>
            @for (cat of v1Categories; track cat) { <option [value]="cat">{{ cat }}</option> }
          </select>
        </div>
        @if (loading) {
          <div class="space-y-2">
            @for (i of [1,2,3]; track i) { <p-skeleton height="3rem"></p-skeleton> }
          </div>
        } @else {
          <p-table [value]="filteredTemplates" [paginator]="true" [rows]="10" styleClass="p-datatable-sm"
                   currentPageReportTemplate="Showing {first} to {last} of {totalRecords} templates"
                   [showCurrentPageReport]="true">
            <ng-template pTemplate="header">
              <tr>
                <th>Template ID</th><th>Name</th><th>Category</th>
                <th>Content</th><th>Variables</th><th>Status</th>
                <th>Updated</th><th>Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-template>
              <tr class="hover:bg-gray-50">
                <td><span class="font-mono text-xs text-gray-600">{{ template.template_id }}</span></td>
                <td><span class="font-medium">{{ template.name }}</span></td>
                <td><p-tag [value]="template.category" severity="info"></p-tag></td>
                <td class="max-w-xs"><div class="text-sm text-gray-600 truncate">{{ template.content }}</div></td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    @for (v of template.variables; track v) {
                      <span class="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs">{{ '{' + '{' + v + '}' + '}' }}</span>
                    }
                  </div>
                </td>
                <td><p-tag [value]="template.enabled ? 'Enabled' : 'Disabled'" [severity]="template.enabled ? 'success' : 'danger'"></p-tag></td>
                <td class="text-xs text-gray-500">{{ template.updated_at | date:'short' }}</td>
                <td>
                  <div class="flex gap-1">
                    <button class="icon-btn" (click)="openEditDialog(template)"><i class="pi pi-pencil"></i></button>
                    <button class="icon-btn icon-btn-danger" (click)="deleteTemplate(template)"><i class="pi pi-trash"></i></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr><td colspan="8" class="text-center py-8 text-gray-400">No templates found</td></tr>
            </ng-template>
          </p-table>
        }
      </div>
    }
  </div>
</div>

<!-- Conversation picker dialog -->
<p-dialog [(visible)]="convPickerVisible" header="Send to Customer" [modal]="true" [style]="{width:'460px'}">
  <div class="conv-picker">
    <div class="conv-search-box mb-3">
      <i class="pi pi-search"></i>
      <input type="text" [(ngModel)]="convSearchTerm" placeholder="Search conversations..." class="conv-search-input" />
    </div>
    @if (loadingConvs()) {
      <div class="text-center py-6"><p-progressSpinner [style]="{width:'32px',height:'32px'}"></p-progressSpinner></div>
    } @else if (filteredConvs.length === 0) {
      <div class="text-center text-gray-400 py-6 text-sm">No conversations found</div>
    } @else {
      <div class="conv-list">
        @for (conv of filteredConvs; track conv.id) {
          <div class="conv-item" (click)="sendToConv(conv)">
            <div class="conv-avatar">{{ (conv.user_name || '?')[0].toUpperCase() }}</div>
            <div class="conv-info">
              <div class="conv-name">{{ conv.user_name }}</div>
              <div class="conv-last">{{ conv.last_message }}</div>
            </div>
            @if (sending()) {
              <i class="pi pi-spin pi-spinner" style="color:#3b82f6;font-size:0.9rem"></i>
            } @else {
              <i class="pi pi-send" style="color:#3b82f6;font-size:0.8rem"></i>
            }
          </div>
        }
      </div>
    }
  </div>
</p-dialog>

<!-- Create dialog (non-Telegram) -->
<p-dialog [(visible)]="createDialogVisible" [modal]="true" [style]="{width:'600px'}" header="Create Template">
  <div class="form-stack p-4">
    <div class="form-grid">
      <div>
        <label class="form-label">Name *</label>
        <input type="text" class="form-input" [(ngModel)]="createForm.name" placeholder="Support Handoff" />
      </div>
      <div>
        <label class="form-label">Channel *</label>
        <p-dropdown [options]="channelOptions" [(ngModel)]="createForm.channel" optionLabel="label" optionValue="value" placeholder="Select channel" class="w-full"></p-dropdown>
      </div>
    </div>
    <div class="form-grid">
      <div>
        <label class="form-label">Code</label>
        <input type="text" class="form-input" [(ngModel)]="createForm.code" placeholder="auto-generated" />
      </div>
      <div>
        <label class="form-label">Category</label>
        <p-dropdown [options]="categoryOptions" [(ngModel)]="createForm.category" optionLabel="label" optionValue="value" class="w-full"></p-dropdown>
      </div>
    </div>
    <div>
      <label class="form-label">Content *</label>
      <textarea class="form-input" rows="4" [(ngModel)]="createForm.content" (ngModelChange)="onContentChange(createForm)"></textarea>
    </div>
    <div class="form-grid">
      <div>
        <label class="form-label">Variables</label>
        <input type="text" class="form-input" [(ngModel)]="createForm.variablesText" placeholder="first_name, store_name" />
      </div>
      <div>
        <label class="form-label">Tags</label>
        <input type="text" class="form-input" [(ngModel)]="createForm.tagsText" placeholder="onboarding, vip" />
      </div>
    </div>
    <label class="checkbox-row">
      <input type="checkbox" [(ngModel)]="createForm.enabled" /><span>Enable immediately</span>
    </label>
  </div>
  <ng-template pTemplate="footer">
    <button pButton type="button" label="Cancel" class="p-button-text" (click)="createDialogVisible = false"></button>
    <button pButton type="button" label="Create" icon="pi pi-check" (click)="createTemplate()" [loading]="creating"></button>
  </ng-template>
</p-dialog>

<!-- Edit dialog (non-Telegram) -->
<p-dialog [(visible)]="editDialogVisible" [modal]="true" [style]="{width:'600px'}" header="Edit Template">
  <div class="form-stack p-4" *ngIf="editingTemplate">
    <div class="form-grid">
      <div>
        <label class="form-label">Name</label>
        <input type="text" class="form-input" [(ngModel)]="editForm.name" />
      </div>
      <div>
        <label class="form-label">Channel</label>
        <p-tag [value]="editingTemplate.channel || selectedChannel" [severity]="getChannelSeverity(editingTemplate.channel || selectedChannel)"></p-tag>
      </div>
    </div>
    <div>
      <label class="form-label">Category</label>
      <p-dropdown [options]="categoryOptions" [(ngModel)]="editForm.category" optionLabel="label" optionValue="value" class="w-full"></p-dropdown>
    </div>
    <div>
      <label class="form-label">Content</label>
      <textarea class="form-input" rows="4" [(ngModel)]="editForm.content" (ngModelChange)="onContentChange(editForm)"></textarea>
    </div>
    <div class="form-grid">
      <div><label class="form-label">Variables</label><input type="text" class="form-input" [(ngModel)]="editForm.variablesText" /></div>
      <div><label class="form-label">Tags</label><input type="text" class="form-input" [(ngModel)]="editForm.tagsText" /></div>
    </div>
    <label class="checkbox-row"><input type="checkbox" [(ngModel)]="editForm.enabled" /><span>Enabled</span></label>
  </div>
  <ng-template pTemplate="footer">
    <button pButton type="button" label="Cancel" class="p-button-text" (click)="editDialogVisible = false"></button>
    <button pButton type="button" label="Save" icon="pi pi-check" (click)="saveEdit()" [loading]="saving"></button>
  </ng-template>
</p-dialog>

<p-confirmDialog></p-confirmDialog>
<p-toast></p-toast>
  `,
  styles: [`
    .gallery-shell { display:flex; height:100vh; background:#f8fafc; overflow:hidden; }

    .gallery-sidebar {
      width:14rem; min-width:14rem; background:#fff;
      border-right:1px solid #e5e7eb; overflow-y:auto;
      padding:1rem 0.5rem; display:flex; flex-direction:column; gap:1.5rem;
    }
    .sidebar-section { display:flex; flex-direction:column; gap:0.2rem; }
    .sidebar-title {
      font-size:0.68rem; font-weight:700; text-transform:uppercase;
      letter-spacing:0.08em; color:#9ca3af; padding:0 0.5rem; margin-bottom:0.25rem;
    }
    .sidebar-item {
      display:flex; align-items:center; gap:0.5rem;
      padding:0.45rem 0.75rem; border-radius:0.5rem; cursor:pointer;
      font-size:0.85rem; color:#374151; transition:background 0.12s;
    }
    .sidebar-item:hover { background:#f3f4f6; }
    .sidebar-item.active { background:#eff6ff; color:#2563eb; font-weight:600; }
    .sidebar-icon { font-size:0.95rem; }
    .sidebar-badge {
      font-size:0.68rem; background:#e5e7eb; color:#6b7280;
      border-radius:999px; padding:0.1rem 0.45rem; min-width:1.2rem; text-align:center;
    }
    .sidebar-item.active .sidebar-badge { background:#bfdbfe; color:#1d4ed8; }

    .gallery-main { flex:1; display:flex; flex-direction:column; overflow:hidden; }

    .gallery-header {
      background:#fff; border-bottom:1px solid #e5e7eb;
      padding:0.875rem 1.5rem; display:flex; align-items:center;
      justify-content:space-between; gap:1rem; flex-shrink:0;
    }
    .gallery-title { font-size:1.15rem; font-weight:700; color:#111827; margin:0; }
    .gallery-subtitle { font-size:0.78rem; color:#6b7280; margin:0; }

    .header-actions { display:flex; align-items:center; gap:0.75rem; }

    .btn-seed {
      display:flex; align-items:center; gap:0.4rem;
      padding:0.45rem 0.875rem; background:#0ea5e9; color:#fff;
      border:none; border-radius:0.5rem; font-size:0.82rem; font-weight:600;
      cursor:pointer; transition:background 0.12s; white-space:nowrap;
    }
    .btn-seed:hover { background:#0284c7; }
    .btn-seed:disabled { opacity:0.6; cursor:default; }

    .search-box { position:relative; display:flex; align-items:center; }
    .search-icon { position:absolute; left:0.6rem; color:#9ca3af; font-size:0.82rem; z-index:1; }
    .search-input {
      padding:0.4rem 0.75rem 0.4rem 2rem; border:1px solid #d1d5db;
      border-radius:0.5rem; font-size:0.85rem; width:210px; outline:none;
    }
    .search-input:focus { border-color:#3b82f6; }

    .btn-create {
      display:flex; align-items:center; gap:0.4rem;
      padding:0.45rem 0.875rem; background:#3b82f6; color:#fff;
      border:none; border-radius:0.5rem; font-size:0.82rem; font-weight:600; cursor:pointer;
    }
    .btn-create:hover { background:#2563eb; }

    /* Telegram view */
    .telegram-view { display:flex; flex:1; overflow:hidden; }

    .card-grid-area { flex:1; overflow-y:auto; padding:1.25rem; }

    .card-grid {
      display:grid;
      grid-template-columns:repeat(auto-fill, minmax(230px, 1fr));
      gap:0.875rem;
    }

    .template-card {
      background:#fff; border:1.5px solid #e5e7eb; border-radius:0.75rem;
      padding:0.875rem; cursor:pointer; transition:all 0.15s;
      display:flex; flex-direction:column; gap:0.45rem;
    }
    .template-card:hover { border-color:#93c5fd; box-shadow:0 2px 8px rgba(59,130,246,0.1); transform:translateY(-1px); }
    .template-card.card-selected { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }

    .card-badges { display:flex; align-items:center; gap:0.35rem; flex-wrap:wrap; }

    .type-badge {
      display:inline-flex; align-items:center; gap:0.22rem;
      padding:0.12rem 0.45rem; border-radius:999px;
      font-size:0.65rem; font-weight:700; color:#fff;
      text-transform:uppercase; letter-spacing:0.04em;
    }
    .type-badge i { font-size:0.55rem; }

    .cat-badge {
      padding:0.12rem 0.45rem; border-radius:999px;
      font-size:0.65rem; font-weight:600;
      background:#f3f4f6; color:#6b7280; text-transform:capitalize;
    }
    .builtin-icon { font-size:0.75rem; }

    .card-name {
      font-size:0.875rem; font-weight:600; color:#111827;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .card-desc {
      font-size:0.75rem; color:#6b7280;
      overflow:hidden; display:-webkit-box;
      -webkit-line-clamp:2; -webkit-box-orient:vertical;
    }

    .card-vars { display:flex; flex-wrap:wrap; gap:0.22rem; }
    .var-chip {
      padding:0.08rem 0.35rem; background:#ede9fe; color:#7c3aed;
      border-radius:0.25rem; font-size:0.62rem; font-family:monospace;
    }
    .var-more { background:#e5e7eb; color:#6b7280; }

    .card-footer { display:flex; align-items:center; margin-top:0.15rem; }
    .enabled-label { display:inline-flex; align-items:center; gap:0.3rem; font-size:0.68rem; color:#9ca3af; }
    .enabled-label.enabled { color:#16a34a; }

    /* Skeleton */
    .skeleton-card { pointer-events:none; }
    .sk-line { border-radius:0.25rem; background:#e5e7eb; animation:pulse 1.5s ease-in-out infinite; margin-bottom:0.5rem; }
    .sk-badge { height:1.1rem; width:65%; }
    .sk-name { height:0.9rem; width:90%; }
    .sk-desc { height:1.8rem; width:100%; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }

    /* Empty state */
    .empty-state {
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      padding:4rem 2rem; text-align:center; gap:0.75rem;
    }
    .empty-icon { font-size:3rem; color:#d1d5db; }
    .empty-title { font-size:1.05rem; font-weight:600; color:#374151; margin:0; }
    .empty-sub { font-size:0.82rem; color:#9ca3af; max-width:280px; margin:0; }

    /* Detail panel */
    .detail-panel {
      width:22rem; min-width:22rem; background:#fff;
      border-left:1px solid #e5e7eb; display:flex; flex-direction:column; overflow:hidden;
    }
    .detail-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:0.75rem 1rem; border-bottom:1px solid #e5e7eb; gap:0.5rem;
    }
    .detail-header-info { display:flex; align-items:center; gap:0.5rem; min-width:0; }
    .type-badge-sm {
      padding:0.08rem 0.4rem; border-radius:999px;
      font-size:0.6rem; font-weight:700; color:#fff;
      text-transform:uppercase; flex-shrink:0;
    }
    .detail-name {
      font-size:0.875rem; font-weight:600; color:#111827;
      white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    }
    .close-btn {
      width:1.6rem; height:1.6rem; border:1px solid #e5e7eb; background:#f9fafb;
      border-radius:0.375rem; cursor:pointer; display:flex; align-items:center;
      justify-content:center; color:#6b7280; flex-shrink:0; font-size:0.75rem;
    }
    .close-btn:hover { background:#f3f4f6; }

    .detail-tabs { display:flex; border-bottom:1px solid #e5e7eb; padding:0 0.75rem; }
    .tab-btn {
      padding:0.55rem 0.65rem; font-size:0.78rem; font-weight:500; color:#6b7280;
      border:none; background:none; cursor:pointer; border-bottom:2px solid transparent;
      display:flex; align-items:center; gap:0.3rem;
    }
    .tab-btn:hover { color:#374151; }
    .tab-btn.tab-active { color:#3b82f6; border-bottom-color:#3b82f6; font-weight:600; }
    .tab-count {
      background:#eff6ff; color:#3b82f6; border-radius:999px;
      padding:0.04rem 0.3rem; font-size:0.62rem;
    }

    .detail-body { flex:1; overflow-y:auto; }

    .preview-wrap { padding:1rem; display:flex; justify-content:center; }

    .vars-tab { padding:1rem; display:flex; flex-direction:column; gap:0.75rem; }
    .no-vars { color:#9ca3af; font-size:0.82rem; text-align:center; padding:2rem 0; }
    .var-row { display:flex; flex-direction:column; gap:0.22rem; }
    .var-label { font-size:0.72rem; font-weight:600; color:#7c3aed; font-family:monospace; }
    .var-input {
      padding:0.38rem 0.55rem; border:1px solid #d1d5db;
      border-radius:0.375rem; font-size:0.85rem; outline:none; width:100%;
    }
    .var-input:focus { border-color:#7c3aed; box-shadow:0 0 0 2px rgba(124,58,237,0.1); }
    .vars-hint { font-size:0.7rem; color:#9ca3af; }

    .info-tab { padding:1rem; display:flex; flex-direction:column; gap:0.55rem; }
    .info-row { display:flex; align-items:flex-start; gap:0.5rem; font-size:0.8rem; }
    .info-label { width:5.5rem; flex-shrink:0; color:#9ca3af; font-weight:500; }
    .info-val { color:#374151; display:flex; flex-wrap:wrap; gap:0.25rem; }
    .info-val.mono { font-family:monospace; font-size:0.72rem; }
    .info-tag { padding:0.08rem 0.35rem; background:#f3f4f6; border-radius:0.25rem; font-size:0.7rem; color:#6b7280; }

    .detail-footer {
      border-top:1px solid #e5e7eb; padding:0.75rem 1rem;
      display:flex; gap:0.5rem; align-items:center;
    }
    .btn-send {
      flex:1; display:flex; align-items:center; justify-content:center; gap:0.4rem;
      padding:0.5rem 1rem; background:#3b82f6; color:#fff; border:none;
      border-radius:0.5rem; font-size:0.82rem; font-weight:600; cursor:pointer;
    }
    .btn-send:hover { background:#2563eb; }
    .btn-send:disabled { opacity:0.5; cursor:default; }
    .btn-delete {
      width:2rem; height:2rem; display:flex; align-items:center; justify-content:center;
      background:#fef2f2; color:#ef4444; border:1px solid #fecaca;
      border-radius:0.375rem; cursor:pointer; font-size:0.82rem;
    }
    .btn-delete:hover { background:#fee2e2; }

    /* Conversation picker */
    .conv-search-box {
      display:flex; align-items:center; gap:0.5rem;
      padding:0.38rem 0.6rem; border:1px solid #d1d5db; border-radius:0.5rem;
    }
    .conv-search-input { border:none; outline:none; font-size:0.875rem; width:100%; }
    .conv-list {
      max-height:320px; overflow-y:auto;
      display:flex; flex-direction:column; gap:0.25rem;
    }
    .conv-item {
      display:flex; align-items:center; gap:0.75rem; padding:0.6rem;
      border-radius:0.5rem; cursor:pointer; border:1px solid #f3f4f6;
      transition:background 0.12s;
    }
    .conv-item:hover { background:#eff6ff; border-color:#bfdbfe; }
    .conv-avatar {
      width:2.1rem; height:2.1rem; border-radius:50%; background:#3b82f6; color:#fff;
      display:flex; align-items:center; justify-content:center;
      font-weight:700; font-size:0.85rem; flex-shrink:0;
    }
    .conv-info { flex:1; min-width:0; }
    .conv-name { font-weight:600; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .conv-last { font-size:0.72rem; color:#9ca3af; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    /* V1 table */
    .icon-btn {
      width:1.75rem; height:1.75rem; display:flex; align-items:center; justify-content:center;
      border:1px solid #e5e7eb; background:#f9fafb; border-radius:0.375rem;
      cursor:pointer; color:#6b7280; font-size:0.78rem;
    }
    .icon-btn:hover { background:#f3f4f6; }
    .icon-btn-danger { color:#f87171; }
    .icon-btn-danger:hover { background:#fef2f2; }

    /* Forms */
    .form-stack { display:flex; flex-direction:column; gap:1rem; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .form-label { font-size:0.78rem; font-weight:600; color:#374151; display:block; margin-bottom:0.22rem; }
    .form-input {
      width:100%; padding:0.42rem 0.6rem; border:1px solid #d1d5db;
      border-radius:0.375rem; font-size:0.875rem; outline:none; box-sizing:border-box;
    }
    .form-input:focus { border-color:#3b82f6; }
    .checkbox-row { display:flex; align-items:center; gap:0.5rem; font-size:0.875rem; cursor:pointer; }
  `]
})
export class ChatConversationsComponent implements OnInit {
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  // ── Telegram v2 signals ─────────────────────────────────────────────────────
  readonly richTemplates = signal<TelegramRichTemplate[]>([]);
  readonly selectedRich = signal<TelegramRichTemplate | null>(null);
  readonly varValues = signal<Record<string, string>>({});
  readonly categoryFilter = signal('');
  readonly searchTerm = signal('');
  readonly detailTab = signal<'preview' | 'variables' | 'info'>('preview');
  readonly conversations = signal<TelegramConversation[]>([]);
  readonly seeding = signal(false);
  readonly sending = signal(false);
  readonly loadingConvs = signal(false);

  convPickerVisible = false;
  convSearchTerm = '';

  readonly filteredRich = computed(() => {
    const cat = this.categoryFilter();
    const term = this.searchTerm().toLowerCase();
    return this.richTemplates().filter(t => {
      const matchCat = !cat || t.category === cat;
      const matchSearch = !term ||
        t.name.toLowerCase().includes(term) ||
        (t.description || '').toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  });

  readonly richCategories = computed(() => {
    const cats = new Set(this.richTemplates().map(t => t.category).filter(Boolean));
    return Array.from(cats).sort();
  });

  readonly categoryCounts = computed(() => {
    const counts: Record<string, number> = {};
    for (const t of this.richTemplates()) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  });

  get filteredConvs(): TelegramConversation[] {
    const term = this.convSearchTerm.toLowerCase();
    return this.conversations().filter(c =>
      !term ||
      (c.user_name || '').toLowerCase().includes(term) ||
      (c.username || '').toLowerCase().includes(term)
    );
  }

  // ── V1 state ────────────────────────────────────────────────────────────────
  loading = false;
  totalRecords = 0;
  v1SearchTerm = '';
  v1CategoryFilter = '';
  templates: CmcTemplate[] = [];
  filteredTemplates: CmcTemplate[] = [];
  v1Categories: string[] = [];

  selectedChannel = 'telegram';

  channels: ChannelNode[] = [
    { id: 'telegram', name: 'Telegram', icon: 'pi pi-telegram', count: 0 },
    { id: 'facebook', name: 'Facebook', icon: 'pi pi-facebook', count: 0 },
    { id: 'email', name: 'Email', icon: 'pi pi-envelope', count: 0 },
    { id: 'sms', name: 'SMS', icon: 'pi pi-comment', count: 0 },
  ];

  readonly channelOptions = [
    { label: 'Telegram', value: 'telegram' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' },
  ];

  readonly categoryOptions = [
    { label: 'Support', value: 'support' },
    { label: 'Onboarding', value: 'onboarding' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Notification', value: 'notification' },
    { label: 'Other', value: 'other' },
  ];

  // ── V1 dialogs ──────────────────────────────────────────────────────────────
  createDialogVisible = false;
  createForm: TemplateForm = this._emptyForm();
  creating = false;

  editDialogVisible = false;
  editingTemplate: CmcTemplate | null = null;
  editForm: TemplateForm = this._emptyForm();
  saving = false;

  ngOnInit() { this.loadTemplates(); }

  selectChannel(channelId: string) {
    this.selectedChannel = channelId;
    this.selectedRich.set(null);
    this.categoryFilter.set('');
    this.searchTerm.set('');
    this.loadTemplates();
  }

  loadTemplates() {
    this.loading = true;
    if (this.selectedChannel === 'telegram') {
      this.chatService.getTelegramRichTemplates(0, 100).subscribe({
        next: (res: any) => {
          const items: TelegramRichTemplate[] = res.data || res || [];
          this.richTemplates.set(items);
          const ch = this.channels.find(c => c.id === 'telegram');
          if (ch) ch.count = items.length;
          this.loading = false;
        },
        error: () => { this.richTemplates.set([]); this.loading = false; }
      });
    } else {
      const obs = this.selectedChannel === 'facebook'
        ? this.chatService.getCmcFacebookTemplates(0, 100)
        : this.selectedChannel === 'email'
          ? this.chatService.getCmcEmailTemplates(0, 100)
          : this.chatService.getCmcSmsTemplates(0, 100);

      obs.subscribe({
        next: (res: any) => {
          this.templates = (res.data || []).map((t: any) => this._normalizeV1(t));
          this.totalRecords = res.total || this.templates.length;
          this._syncV1Categories();
          this.applyFilters();
          const ch = this.channels.find(c => c.id === this.selectedChannel);
          if (ch) ch.count = this.totalRecords;
          this.loading = false;
        },
        error: () => { this.templates = []; this.filteredTemplates = []; this.loading = false; }
      });
    }
  }

  // ── Telegram v2 actions ─────────────────────────────────────────────────────
  selectRich(tpl: TelegramRichTemplate) {
    this.selectedRich.set(tpl);
    this.detailTab.set('preview');
    const vals: Record<string, string> = {};
    for (const v of (tpl.variables || [])) vals[v] = '';
    this.varValues.set(vals);
  }

  updateVar(key: string, value: string) {
    this.varValues.update(v => ({ ...v, [key]: value }));
  }

  seedTemplates() {
    this.seeding.set(true);
    this.chatService.seedTelegramRichTemplates().subscribe({
      next: () => {
        this.seeding.set(false);
        this.messageService.add({ severity: 'success', summary: 'Done', detail: '26 templates initialized' });
        this.loadTemplates();
      },
      error: () => {
        this.seeding.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to seed templates' });
      }
    });
  }

  openConvPicker() {
    this.convPickerVisible = true;
    this.convSearchTerm = '';
    if (this.conversations().length === 0) this._loadConversations();
  }

  private _loadConversations() {
    this.loadingConvs.set(true);
    this.chatService.getTelegramConversations(0, 100).subscribe({
      next: (res: any) => {
        this.conversations.set(res.data || res || []);
        this.loadingConvs.set(false);
      },
      error: () => this.loadingConvs.set(false)
    });
  }

  sendToConv(conv: TelegramConversation) {
    const tpl = this.selectedRich();
    if (!tpl || this.sending()) return;
    this.sending.set(true);
    this.chatService.sendTelegramRichTemplate(tpl.template_id, conv.chat_id, this.varValues()).subscribe({
      next: () => {
        this.sending.set(false);
        this.convPickerVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Sent', detail: `Sent to ${conv.user_name}` });
      },
      error: () => {
        this.sending.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send template' });
      }
    });
  }

  deleteRich(tpl: TelegramRichTemplate) {
    this.confirmationService.confirm({
      message: `Delete "${tpl.name}"? This cannot be undone.`,
      accept: () => {
        this.chatService.deleteUnifiedTemplate(tpl.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: tpl.name });
            this.selectedRich.set(null);
            this.loadTemplates();
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Delete failed', detail: tpl.name })
        });
      }
    });
  }

  getPayloadSnippet(tpl: TelegramRichTemplate): string {
    const p = tpl.payload;
    if (!p) return '';
    return p.text || p.caption || p.question || p.invoice_title || '';
  }

  getMsgTypeColor(type: string): string {
    const m: Record<string, string> = {
      text: '#3b82f6', photo: '#22c55e', video: '#a855f7',
      audio: '#eab308', voice: '#eab308', document: '#f97316',
      animation: '#06b6d4', sticker: '#06b6d4', poll: '#6366f1',
      location: '#ef4444', venue: '#ef4444', contact: '#14b8a6',
      dice: '#ec4899', media_group: '#84cc16', invoice: '#f59e0b', forward: '#8b5cf6',
    };
    return m[type] || '#6b7280';
  }

  getMsgTypeIcon(type: string): string {
    const m: Record<string, string> = {
      text: 'pi pi-comment', photo: 'pi pi-image', video: 'pi pi-play-circle',
      audio: 'pi pi-volume-up', voice: 'pi pi-volume-up', document: 'pi pi-file',
      animation: 'pi pi-play', sticker: 'pi pi-star', poll: 'pi pi-chart-bar',
      location: 'pi pi-map-marker', venue: 'pi pi-map-marker', contact: 'pi pi-user',
      dice: 'pi pi-circle-fill', media_group: 'pi pi-th-large', invoice: 'pi pi-ticket',
      forward: 'pi pi-arrow-right',
    };
    return m[type] || 'pi pi-comment';
  }

  // ── V1 helpers ──────────────────────────────────────────────────────────────
  private _normalizeV1(t: any): CmcTemplate {
    return {
      id: t.id || t._id || '',
      template_id: t.template_id || '',
      name: t.name || '',
      category: t.category || '',
      content: t.content || '',
      channel: t.channel || '',
      enabled: t.enabled ?? true,
      variables: t.variables || [],
      updated_at: t.updated_at || '',
      created_at: t.created_at || '',
    };
  }

  private _syncV1Categories() {
    const cats = new Set(this.templates.map(t => t.category).filter(Boolean));
    this.v1Categories = Array.from(cats);
  }

  applyFilters() {
    const term = this.v1SearchTerm.trim().toLowerCase();
    this.filteredTemplates = this.templates.filter(t => {
      const matchCat = !this.v1CategoryFilter || t.category === this.v1CategoryFilter;
      const hay = `${t.name} ${t.template_id} ${t.content} ${t.category}`.toLowerCase();
      return matchCat && (!term || hay.includes(term));
    });
  }

  createTemplate() {
    const f = this.createForm;
    if (!f.name.trim() || !f.channel || !f.content.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Missing fields', detail: 'Name, channel, and content are required.' });
      return;
    }
    this.creating = true;
    const payload: UnifiedTemplateCreate = {
      name: f.name.trim(), code: f.code.trim() || this._slugify(f.name),
      channel: f.channel, category: f.category || 'support',
      content: f.content.trim(), enabled: f.enabled,
      variables: this._parseList(f.variablesText), tags: this._parseList(f.tagsText),
    };
    this.chatService.createUnifiedTemplate(payload).subscribe({
      next: () => {
        this.creating = false; this.createDialogVisible = false;
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

  openEditDialog(template: CmcTemplate) {
    this.editingTemplate = template;
    this.editForm = {
      name: template.name, code: '',
      channel: template.channel || this.selectedChannel,
      category: template.category, content: template.content, enabled: template.enabled,
      variablesText: (template.variables || []).join(', '), tagsText: '',
      previewVars: Object.fromEntries((template.variables || []).map(v => [v, ''])),
    };
    this.editDialogVisible = true;
  }

  saveEdit() {
    if (!this.editingTemplate) return;
    const f = this.editForm;
    const payload: UnifiedTemplateUpdate = {
      name: f.name.trim(), category: f.category, content: f.content.trim(),
      enabled: f.enabled, variables: this._parseList(f.variablesText), tags: this._parseList(f.tagsText),
    };
    this.saving = true;
    this.chatService.updateUnifiedTemplate(this.editingTemplate.id, payload).subscribe({
      next: () => {
        this.saving = false; this.editDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: payload.name });
        this.loadTemplates();
      },
      error: () => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Save failed', detail: 'Unable to update template' });
      }
    });
  }

  deleteTemplate(template: CmcTemplate) {
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

  onContentChange(form: TemplateForm) {
    const vars = this._extractVars(form.content);
    form.variablesText = vars.join(', ');
    const next: Record<string, string> = {};
    for (const v of vars) next[v] = form.previewVars[v] || '';
    form.previewVars = next;
  }

  getChannelSeverity(channel: string): 'info' | 'success' | 'warning' | 'secondary' {
    return channel === 'telegram' ? 'info'
      : channel === 'facebook' ? 'success'
      : channel === 'email' ? 'warning' : 'secondary';
  }

  private _emptyForm(): TemplateForm {
    return { name: '', code: '', channel: '', category: 'support', content: '', enabled: true, variablesText: '', tagsText: '', previewVars: {} };
  }
  private _parseList(text: string): string[] { return text.split(',').map(s => s.trim()).filter(Boolean); }
  private _slugify(name: string): string { return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''); }
  private _extractVars(content: string): string[] {
    return [...new Set([...content.matchAll(/{{\s*(\w+)\s*}}/g)].map(m => m[1]))];
  }
}
