import { Component, Input, OnChanges, SimpleChanges, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChatService } from '../../../services/chat.service';
import { TelegramConversation, UnifiedTemplate, CustomerSummary } from '../../../models/chat.model';

@Component({
    selector: 'app-template-send-panel',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule, ProgressSpinnerModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <div class="template-send-panel p-3">
            @if (!conversation) {
                <div class="text-center text-gray-400 py-8">Select a conversation to send a template</div>
            } @else {
                <!-- Search -->
                <div class="mb-3">
                    <input pInputText [(ngModel)]="searchQuery" placeholder="Search templates..." class="w-full text-sm"/>
                </div>

                <!-- All channels toggle -->
                <div class="mb-3 flex align-items-center gap-2">
                    <input type="checkbox" [(ngModel)]="showAllChannels" (ngModelChange)="loadTemplates()" id="allCh"/>
                    <label for="allCh" class="text-sm text-gray-600">All channels</label>
                </div>

                @if (loading()) {
                    <div class="text-center py-4"><p-progressSpinner [style]="{width:'30px',height:'30px'}"></p-progressSpinner></div>
                } @else if (filteredTemplates().length === 0) {
                    <div class="text-center text-gray-400 text-sm py-4">No templates found</div>
                } @else if (!selectedTemplate()) {
                    <!-- Template list -->
                    <div class="template-list" style="max-height:300px;overflow-y:auto;">
                        @for (tpl of filteredTemplates(); track tpl.id) {
                            <div class="template-item p-2 border-round cursor-pointer hover:surface-hover mb-1"
                                 style="border:1px solid #e5e7eb;"
                                 (click)="selectTemplate(tpl)">
                                <div class="font-semibold text-sm">{{ tpl.name }}</div>
                                <div class="text-xs text-gray-500">{{ tpl.channel }} · {{ tpl.category }}</div>
                                <div class="text-xs text-gray-400 mt-1" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ tpl.content | slice:0:60 }}...</div>
                            </div>
                        }
                    </div>
                } @else {
                    <!-- Variable form + preview -->
                    <div class="selected-template">
                        <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-sm mb-2" (click)="selectedTemplate.set(null)" label="Back"></button>
                        <div class="font-semibold mb-2">{{ selectedTemplate()!.name }}</div>

                        @for (variable of selectedTemplate()!.variables; track variable) {
                            <div class="mb-2">
                                <label class="text-xs text-gray-600 block mb-1">{{ variable }}</label>
                                <input pInputText [(ngModel)]="variableValues()[variable]" [placeholder]="variable" class="w-full text-sm"
                                       (ngModelChange)="updateVariable(variable, $event)"/>
                            </div>
                        }

                        <!-- Preview -->
                        <div class="preview-box p-2 border-round mt-3 mb-3 text-sm" style="background:#f9fafb;border:1px solid #e5e7eb;white-space:pre-wrap;">{{ previewContent() }}</div>

                        <button pButton label="Send Template" icon="pi pi-send" class="w-full p-button-sm"
                                [disabled]="sending() || !allVariablesFilled()"
                                [loading]="sending()"
                                (click)="sendTemplate()"></button>
                    </div>
                }
            }
        </div>
    `,
    styles: [`
        .template-item:hover { background: var(--surface-hover); }
    `]
})
export class TemplateSendPanelComponent implements OnChanges {
    @Input() conversation: TelegramConversation | null = null;
    @Input() linkedCustomer: CustomerSummary | null = null;

    private chatService = inject(ChatService);
    private messageService = inject(MessageService);

    templates = signal<UnifiedTemplate[]>([]);
    loading = signal(false);
    sending = signal(false);
    selectedTemplate = signal<UnifiedTemplate | null>(null);
    variableValues = signal<Record<string, string>>({});
    searchQuery = '';
    showAllChannels = false;

    filteredTemplates = computed(() => {
        const q = this.searchQuery.toLowerCase();
        return this.templates().filter(t =>
            !q || t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
        );
    });

    previewContent = computed(() => {
        const tpl = this.selectedTemplate();
        if (!tpl) return '';
        let content = tpl.content;
        const vals = this.variableValues();
        for (const [key, val] of Object.entries(vals)) {
            content = content.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), val || `[${key}]`);
        }
        // Replace remaining unfilled vars
        content = content.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k) => `[${k}]`);
        return content;
    });

    allVariablesFilled = computed(() => {
        const tpl = this.selectedTemplate();
        if (!tpl || tpl.variables.length === 0) return true;
        const vals = this.variableValues();
        return tpl.variables.every(v => vals[v]?.trim());
    });

    ngOnChanges(changes: SimpleChanges) {
        if (changes['conversation'] && this.conversation) {
            this.loadTemplates();
            this.selectedTemplate.set(null);
        }
    }

    loadTemplates() {
        if (!this.conversation) return;
        const channel = this.showAllChannels ? '' : this.conversation.platform;
        this.loading.set(true);
        this.chatService.getUnifiedTemplates(channel, 0, 100).subscribe({
            next: r => {
                // filter enabled only
                const enabled = (r.data || []).filter((t: any) => t.enabled !== false);
                this.templates.set(enabled);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    selectTemplate(tpl: UnifiedTemplate) {
        this.selectedTemplate.set(tpl);
        // Pre-fill from linked customer
        const vals: Record<string, string> = {};
        tpl.variables.forEach(v => {
            if (this.linkedCustomer) {
                if (v === 'customer_name' || v === 'name') vals[v] = this.linkedCustomer.name || '';
                else if (v === 'customer_phone' || v === 'phone') vals[v] = this.linkedCustomer.phone || '';
            }
            if (!vals[v]) vals[v] = '';
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
}
