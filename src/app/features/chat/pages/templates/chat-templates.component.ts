import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ChatService } from '../../services/chat.service';
import { UnifiedTemplate, UnifiedTemplateCreate, UnifiedTemplateUpdate } from '../../models/chat.model';
import { CHAT_WORKSPACE_LINKS } from '../shared/chat-workspace.config';

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
  selector: 'app-chat-templates',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CheckboxModule, ConfirmDialogModule, DialogModule,
    DropdownModule, InputTextModule, PaginatorModule,
    SkeletonModule, TabViewModule, TagModule, ToastModule
  ],
  templateUrl: './chat-templates.component.html',
  styleUrl: './chat-templates.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class ChatTemplatesComponent implements OnInit {
  private chatService = inject(ChatService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  readonly workspaceLinks = CHAT_WORKSPACE_LINKS;

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly selectedChannel = signal('');
  readonly templates = signal<UnifiedTemplate[]>([]);
  readonly loading = signal(false);
  readonly total = signal(0);
  readonly skip = signal(0);
  readonly limit = 20;

  // ── Static data ────────────────────────────────────────────────────────────
  readonly channelTabs = [
    { label: 'All', value: '' },
    { label: 'Telegram', value: 'telegram' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Email', value: 'email' },
    { label: 'SMS', value: 'sms' }
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

  // ── Form state ─────────────────────────────────────────────────────────────
  createForm: TemplateForm = this._emptyForm();
  creating = false;

  editDialogVisible = false;
  editingTemplate: UnifiedTemplate | null = null;
  editForm: TemplateForm = this._emptyForm();
  saving = false;

  // ── Bulk select ────────────────────────────────────────────────────────────
  selectedIds: Set<string> = new Set();
  bulkProcessing = false;

  get createPreview(): string {
    return this._renderPreview(this.createForm.content, this.createForm.previewVars);
  }

  ngOnInit(): void {
    this.loadTemplates();
  }

  loadTemplates(): void {
    this.loading.set(true);
    this.selectedIds = new Set();
    this.chatService.getUnifiedTemplates(this.selectedChannel(), this.skip(), this.limit).subscribe({
      next: (res) => {
        this.templates.set(res.data || []);
        this.total.set(res.total ?? (res.data?.length ?? 0));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Load failed', detail: 'Unable to load templates' });
      }
    });
  }

  setChannel(channel: string): void {
    this.selectedChannel.set(channel);
    this.skip.set(0);
    this.loadTemplates();
  }

  onPageChange(event: any): void {
    this.skip.set(event.first);
    this.loadTemplates();
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
      next: (res) => {
        this.templates.update(list => [res.data, ...list]);
        this.total.update(n => n + 1);
        this.creating = false;
        this.createForm = this._emptyForm();
        this.messageService.add({ severity: 'success', summary: 'Created', detail: res.data.name });
      },
      error: () => {
        this.creating = false;
        this.messageService.add({ severity: 'error', summary: 'Create failed', detail: 'Unable to create template' });
      }
    });
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  openEditDialog(template: UnifiedTemplate): void {
    this.editingTemplate = template;
    this.editForm = {
      name: template.name,
      code: template.code,
      channel: template.channel,
      category: template.category,
      content: template.content,
      enabled: template.enabled,
      variablesText: (template.variables || []).join(', '),
      tagsText: (template.tags || []).join(', '),
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
      next: (res) => {
        this.templates.update(list => list.map(t => t.id === res.data.id ? res.data : t));
        this.saving = false;
        this.editDialogVisible = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: res.data.name });
      },
      error: () => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Save failed', detail: 'Unable to update template' });
      }
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  deleteTemplate(template: UnifiedTemplate): void {
    this.confirmationService.confirm({
      message: `Delete "${template.name}"? This cannot be undone.`,
      accept: () => {
        this.chatService.deleteUnifiedTemplate(template.id).subscribe({
          next: () => {
            this.templates.update(list => list.filter(t => t.id !== template.id));
            this.total.update(n => Math.max(0, n - 1));
            this.selectedIds.delete(template.id);
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: template.name });
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Delete failed', detail: template.name })
        });
      }
    });
  }

  // ── Bulk select ────────────────────────────────────────────────────────────
  toggleAll(checked: boolean): void {
    if (checked) {
      this.selectedIds = new Set(this.templates().map(t => t.id));
    } else {
      this.selectedIds = new Set();
    }
  }

  toggleOne(id: string, checked: boolean): void {
    const next = new Set(this.selectedIds);
    checked ? next.add(id) : next.delete(id);
    this.selectedIds = next;
  }

  get allSelected(): boolean {
    return this.templates().length > 0 && this.selectedIds.size === this.templates().length;
  }

  get someSelected(): boolean {
    return this.selectedIds.size > 0;
  }

  bulkEnable(): void { this._bulkToggle(true); }
  bulkDisable(): void { this._bulkToggle(false); }
  emptySet(): Set<string> { return new Set(); }

  private _bulkToggle(enabled: boolean): void {
    if (!this.selectedIds.size) return;
    this.bulkProcessing = true;
    this.chatService.bulkToggleTemplates([...this.selectedIds], enabled).subscribe({
      next: () => {
        this.templates.update(list => list.map(t => this.selectedIds.has(t.id) ? { ...t, enabled } : t));
        this.selectedIds = new Set();
        this.bulkProcessing = false;
        this.messageService.add({ severity: 'success', summary: enabled ? 'Enabled' : 'Disabled', detail: 'Selected templates updated' });
      },
      error: () => {
        this.bulkProcessing = false;
        this.messageService.add({ severity: 'error', summary: 'Bulk update failed', detail: 'Could not update selected templates' });
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

  // ── Nav helpers ────────────────────────────────────────────────────────────
  isWorkspaceLinkActive(route: string): boolean {
    if (route === '/chat') return this.router.url === '/cmc' || this.router.url === '/cmc/telegram-workspace';
    return this.router.url === route;
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
