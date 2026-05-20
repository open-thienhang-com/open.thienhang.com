import { Component, Input, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChatService } from '../../../services/chat.service';
import { TelegramConversation, TelegramRichTemplate, UnifiedTemplate, CustomerSummary } from '../../../models/chat.model';
import { TelegramPreviewComponent } from '../../../components/telegram-preview/telegram-preview.component';

@Component({
    selector: 'app-template-send-panel',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule, ProgressSpinnerModule, TelegramPreviewComponent],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="tsp p-3">
            @if (!conversation) {
                <div class="tsp-empty">Select a conversation to send a template</div>
            } @else {
                <!-- Search -->
                <div class="tsp-search mb-2">
                    <i class="pi pi-search tsp-search-icon"></i>
                    <input pInputText [(ngModel)]="searchQuery" placeholder="Search templates..." class="tsp-search-input"/>
                </div>

                @if (isRichChannel()) {
                    <!-- Telegram v2 rich templates -->
                    @if (loading()) {
                        <div class="text-center py-4"><p-progressSpinner [style]="{width:'28px',height:'28px'}"></p-progressSpinner></div>
                    } @else if (!selectedRich()) {
                        <!-- Template list -->
                        <div class="tsp-list">
                            @if (filteredRich().length === 0) {
                                <div class="tsp-empty">No templates found</div>
                            } @else {
                                @for (tpl of filteredRich(); track tpl.id) {
                                    <div class="tsp-item" (click)="selectRich(tpl)">
                                        <div class="tsp-type-dot" [style.background]="getMsgTypeColor(tpl.message_type)"></div>
                                        <div class="tsp-item-body">
                                            <div class="tsp-item-name">{{ tpl.name }}</div>
                                            <div class="tsp-item-meta">{{ tpl.message_type }} · {{ tpl.category }}</div>
                                        </div>
                                    </div>
                                }
                            }
                        </div>
                    } @else {
                        <!-- Rich template detail: variable fill + preview -->
                        <div class="tsp-detail">
                            <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-sm mb-2" (click)="selectedRich.set(null)" label="Back"></button>
                            <div class="tsp-detail-name mb-2">{{ selectedRich()!.name }}</div>

                            @if (selectedRich()!.variables?.length) {
                                <div class="tsp-vars mb-3">
                                    @for (v of selectedRich()!.variables; track v) {
                                        <div class="tsp-var-row">
                                            <label class="tsp-var-label">{{ '{' + '{' + v + '}' + '}' }}</label>
                                            <input pInputText
                                                   [ngModel]="richVarValues()[v] || ''"
                                                   (ngModelChange)="updateRichVar(v, $event)"
                                                   [placeholder]="'Enter ' + v" class="w-full text-sm"/>
                                        </div>
                                    }
                                </div>
                            }

                            <!-- Rich preview -->
                            <div class="tsp-rich-preview mb-3">
                                <app-telegram-preview [template]="selectedRich()" [variables]="richVarValues()"></app-telegram-preview>
                            </div>

                            <button pButton label="Send Template" icon="pi pi-send" class="w-full p-button-sm"
                                    [disabled]="sendingRich()"
                                    [loading]="sendingRich()"
                                    (click)="sendRichTemplate()"></button>
                        </div>
                    }
                } @else {
                    <!-- V1 unified templates (Facebook / Email / SMS) -->
                    <div class="mb-2 flex align-items-center gap-2">
                        <input type="checkbox" [(ngModel)]="showAllChannels" (ngModelChange)="loadTemplates()" id="allCh"/>
                        <label for="allCh" class="text-sm text-gray-600">All channels</label>
                    </div>

                    @if (loading()) {
                        <div class="text-center py-4"><p-progressSpinner [style]="{width:'28px',height:'28px'}"></p-progressSpinner></div>
                    } @else if (!selectedTemplate()) {
                        <div class="tsp-list">
                            @if (filteredTemplates().length === 0) {
                                <div class="tsp-empty">No templates found</div>
                            } @else {
                                @for (tpl of filteredTemplates(); track tpl.id) {
                                    <div class="tsp-item" (click)="selectTemplate(tpl)">
                                        <div class="tsp-item-body">
                                            <div class="tsp-item-name">{{ tpl.name }}</div>
                                            <div class="tsp-item-meta">{{ tpl.channel }} · {{ tpl.category }}</div>
                                            <div class="tsp-item-preview">{{ tpl.content | slice:0:60 }}...</div>
                                        </div>
                                    </div>
                                }
                            }
                        </div>
                    } @else {
                        <div class="tsp-detail">
                            <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-sm mb-2" (click)="selectedTemplate.set(null)" label="Back"></button>
                            <div class="tsp-detail-name mb-2">{{ selectedTemplate()!.name }}</div>

                            @for (variable of selectedTemplate()!.variables; track variable) {
                                <div class="tsp-var-row mb-2">
                                    <label class="tsp-var-label">{{ variable }}</label>
                                    <input pInputText [ngModel]="variableValues()[variable]"
                                           (ngModelChange)="updateVariable(variable, $event)"
                                           [placeholder]="variable" class="w-full text-sm"/>
                                </div>
                            }

                            <div class="tsp-v1-preview mb-3">{{ previewContent() }}</div>

                            <button pButton label="Send Template" icon="pi pi-send" class="w-full p-button-sm"
                                    [disabled]="sending() || !allVariablesFilled()"
                                    [loading]="sending()"
                                    (click)="sendTemplate()"></button>
                        </div>
                    }
                }
            }
        </div>
    `,
    styles: [`
        .tsp { height:100%; }
        .tsp-empty { text-align:center; color:#9ca3af; font-size:0.82rem; padding:1.5rem 0; }

        .tsp-search { position:relative; display:flex; align-items:center; }
        .tsp-search-icon { position:absolute; left:0.5rem; color:#9ca3af; font-size:0.8rem; }
        .tsp-search-input { width:100%; padding-left:1.75rem !important; font-size:0.85rem; }

        .tsp-list { max-height:320px; overflow-y:auto; display:flex; flex-direction:column; gap:0.25rem; }

        .tsp-item {
            display:flex; align-items:flex-start; gap:0.5rem;
            padding:0.5rem 0.6rem; border-radius:0.5rem; cursor:pointer;
            border:1px solid #e5e7eb; transition:background 0.12s;
        }
        .tsp-item:hover { background:#eff6ff; border-color:#bfdbfe; }

        .tsp-type-dot { width:0.5rem; height:0.5rem; border-radius:50%; margin-top:0.35rem; flex-shrink:0; }

        .tsp-item-body { flex:1; min-width:0; }
        .tsp-item-name { font-weight:600; font-size:0.82rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .tsp-item-meta { font-size:0.7rem; color:#6b7280; }
        .tsp-item-preview { font-size:0.7rem; color:#9ca3af; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:0.1rem; }

        .tsp-detail { display:flex; flex-direction:column; }
        .tsp-detail-name { font-weight:600; font-size:0.9rem; color:#111827; }

        .tsp-vars { display:flex; flex-direction:column; gap:0.5rem; }
        .tsp-var-row { display:flex; flex-direction:column; gap:0.15rem; }
        .tsp-var-label { font-size:0.7rem; font-weight:600; color:#7c3aed; font-family:monospace; }

        .tsp-rich-preview { display:flex; justify-content:center; }

        .tsp-v1-preview {
            background:#f9fafb; border:1px solid #e5e7eb; border-radius:0.5rem;
            padding:0.6rem; font-size:0.8rem; color:#374151; white-space:pre-wrap;
            max-height:120px; overflow-y:auto;
        }
    `]
})
export class TemplateSendPanelComponent implements OnChanges {
    @Input() conversation: TelegramConversation | null = null;
    @Input() linkedCustomer: CustomerSummary | null = null;

    private chatService = inject(ChatService);
    private messageService = inject(MessageService);

    // ── Shared ────────────────────────────────────────────────────────────────
    loading = signal(false);
    searchQuery = '';
    showAllChannels = false;

    // ── Telegram v2 ───────────────────────────────────────────────────────────
    richTemplates = signal<TelegramRichTemplate[]>([]);
    selectedRich = signal<TelegramRichTemplate | null>(null);
    richVarValues = signal<Record<string, string>>({});
    sendingRich = signal(false);

    readonly filteredRich = computed(() => {
        const q = this.searchQuery.toLowerCase();
        return this.richTemplates().filter(t =>
            !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
        );
    });

    // ── V1 (Facebook/Email/SMS) ───────────────────────────────────────────────
    templates = signal<UnifiedTemplate[]>([]);
    selectedTemplate = signal<UnifiedTemplate | null>(null);
    variableValues = signal<Record<string, string>>({});
    sending = signal(false);

    readonly filteredTemplates = computed(() => {
        const q = this.searchQuery.toLowerCase();
        return this.templates().filter(t =>
            !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
        );
    });

    readonly previewContent = computed(() => {
        const tpl = this.selectedTemplate();
        if (!tpl) return '';
        let content = tpl.content;
        const vals = this.variableValues();
        for (const [key, val] of Object.entries(vals)) {
            content = content.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), val || `[${key}]`);
        }
        return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k) => `[${k}]`);
    });

    readonly allVariablesFilled = computed(() => {
        const tpl = this.selectedTemplate();
        if (!tpl || tpl.variables.length === 0) return true;
        const vals = this.variableValues();
        return tpl.variables.every(v => vals[v]?.trim());
    });

    readonly isRichChannel = computed(() => this.conversation?.platform === 'telegram');

    ngOnChanges(changes: SimpleChanges) {
        if (changes['conversation'] && this.conversation) {
            this.selectedRich.set(null);
            this.selectedTemplate.set(null);
            this.loadTemplates();
        }
    }

    loadTemplates() {
        if (!this.conversation) return;
        this.loading.set(true);

        if (this.isRichChannel()) {
            this.chatService.getTelegramRichTemplates(0, 100).subscribe({
                next: (res: any) => {
                    const items: TelegramRichTemplate[] = (res.data || res || []).filter((t: TelegramRichTemplate) => t.enabled !== false);
                    this.richTemplates.set(items);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
        } else {
            const channel = this.showAllChannels ? '' : (this.conversation?.platform || '');
            this.chatService.getUnifiedTemplates(channel, 0, 100).subscribe({
                next: (r: any) => {
                    this.templates.set((r.data || []).filter((t: any) => t.enabled !== false));
                    this.loading.set(false);
                },
                error: () => this.loading.set(false)
            });
        }
    }

    // ── Rich template actions ─────────────────────────────────────────────────
    selectRich(tpl: TelegramRichTemplate) {
        this.selectedRich.set(tpl);
        const vals: Record<string, string> = {};
        for (const v of (tpl.variables || [])) {
            if (this.linkedCustomer) {
                if (v === 'customer_name' || v === 'name') { vals[v] = this.linkedCustomer.name || ''; continue; }
                if (v === 'customer_phone' || v === 'phone') { vals[v] = this.linkedCustomer.phone || ''; continue; }
            }
            vals[v] = '';
        }
        this.richVarValues.set(vals);
    }

    updateRichVar(key: string, value: string) {
        this.richVarValues.update(v => ({ ...v, [key]: value }));
    }

    sendRichTemplate() {
        const tpl = this.selectedRich();
        const conv = this.conversation;
        if (!tpl || !conv) return;
        this.sendingRich.set(true);
        this.chatService.sendTelegramRichTemplate(tpl.template_id, conv.chat_id, this.richVarValues()).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sent', detail: 'Template sent successfully' });
                this.selectedRich.set(null);
                this.sendingRich.set(false);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send template' });
                this.sendingRich.set(false);
            }
        });
    }

    // ── V1 template actions ───────────────────────────────────────────────────
    selectTemplate(tpl: UnifiedTemplate) {
        this.selectedTemplate.set(tpl);
        const vals: Record<string, string> = {};
        tpl.variables.forEach(v => {
            if (this.linkedCustomer) {
                if (v === 'customer_name' || v === 'name') { vals[v] = this.linkedCustomer.name || ''; return; }
                if (v === 'customer_phone' || v === 'phone') { vals[v] = this.linkedCustomer.phone || ''; return; }
            }
            vals[v] = '';
        });
        this.variableValues.set(vals);
    }

    updateVariable(key: string, value: string) {
        this.variableValues.update(v => ({ ...v, [key]: value }));
    }

    sendTemplate() {
        const tpl = this.selectedTemplate();
        const conv = this.conversation;
        if (!tpl || !conv) return;
        this.sending.set(true);
        const payload = {
            chat_id: conv.chat_id,
            template_id: tpl.id,
            variables: this.variableValues(),
            disable_notification: false,
        };
        this.chatService.sendTelegramTemplate(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Sent', detail: 'Template sent successfully' });
                this.selectedTemplate.set(null);
                this.sending.set(false);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send template' });
                this.sending.set(false);
            }
        });
    }

    getMsgTypeColor(type: string): string {
        const m: Record<string, string> = {
            text: '#3b82f6', photo: '#22c55e', video: '#a855f7',
            audio: '#eab308', voice: '#eab308', document: '#f97316',
            animation: '#06b6d4', sticker: '#06b6d4', poll: '#6366f1',
            location: '#ef4444', venue: '#ef4444', contact: '#14b8a6',
            dice: '#ec4899', media_group: '#84cc16', invoice: '#f59e0b',
        };
        return m[type] || '#6b7280';
    }
}
