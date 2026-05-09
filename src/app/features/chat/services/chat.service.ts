import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { getApiBase } from '../../../core/config/api-config';
import {
    ApiResponse,
    ChatDataProducts,
    Conversation,
    Agent,
    ChatAnalytics,
    ChatSummary,
    TelegramAssignPayload,
    TelegramBotProfile,
    TelegramBroadcast,
    TelegramCommand,
    TelegramConversation,
    TelegramCreateBroadcastPayload,
    TelegramCreateTemplatePayload,
    TelegramDashboard,
    TelegramSendDocumentPayload,
    TelegramSendMessagePayload,
    TelegramSendPhotoPayload,
    TelegramSendTemplatePayload,
    TelegramSettings,
    TelegramStatusPayload,
    TelegramTemplate,
    TelegramWebhook,
    ConversationPage,
    CustomerSummary,
    ProductSearchResult,
    UnifiedTemplate,
    UnifiedTemplateCreate,
    UnifiedTemplateUpdate,
    Label,
    LabelCreate,
    InternalNote,
    QuickReply,
    QuickReplyCreate,
    SlaPolicy,
    UnreadSummary,
    AgentPresence,
    AgentInfo,
    CustomerOrder,
    BroadcastCampaign,
    BroadcastCreate,
    BroadcastEstimate
} from '../models/chat.model';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private http = inject(HttpClient);

    // Base URL for chat domain
    private get chatBaseUrl(): string {
        return `${getApiBase()}/data-mesh/domains/cmc`;
    }

    getChatDataProducts(): Observable<ApiResponse<ChatDataProducts>> {
        return this.http.get<ApiResponse<ChatDataProducts>>(`${this.chatBaseUrl}/`);
    }

    getConversations(limit: number = 10, offset: number = 0, platform?: string): Observable<ApiResponse<Conversation[]>> {
        let params = new HttpParams()
            .set('limit', limit.toString())
            .set('offset', offset.toString());
        
        if (platform) {
            params = params.set('platform', platform);
        }
            
        return this.http.get<ApiResponse<Conversation[]>>(`${this.chatBaseUrl}/conversations`, { params });
    }

    getConversationDetail(id: string): Observable<ApiResponse<Conversation>> {
        return this.http.get<ApiResponse<Conversation>>(`${this.chatBaseUrl}/conversations/${id}`);
    }

    getAgents(limit: number = 10): Observable<ApiResponse<Agent[]>> {
        const params = new HttpParams().set('limit', limit.toString());
        return this.http.get<ApiResponse<Agent[]>>(`${this.chatBaseUrl}/agents`, { params });
    }

    getAnalytics(period: string = '7d'): Observable<ApiResponse<ChatAnalytics>> {
        const params = new HttpParams().set('period', period);
        return this.http.get<ApiResponse<ChatAnalytics>>(`${this.chatBaseUrl}/analytics`, { params });
    }

    getSummary(): Observable<ApiResponse<ChatSummary>> {
        return this.http.get<ApiResponse<ChatSummary>>(`${this.chatBaseUrl}/summary`);
    }

    getTelegramProfile(): Observable<ApiResponse<TelegramBotProfile>> {
        return this.http.get<ApiResponse<TelegramBotProfile>>(`${this.chatBaseUrl}/telegram/profile`);
    }

    getTelegramDashboard(): Observable<ApiResponse<TelegramDashboard>> {
        return this.http.get<ApiResponse<TelegramDashboard>>(`${this.chatBaseUrl}/telegram/dashboard`);
    }

    getTelegramConversations(skip: number = 0, limit: number = 20): Observable<ApiResponse<TelegramConversation[]>> {
        const params = new HttpParams()
            .set('skip', skip.toString())
            .set('limit', limit.toString());
        return new Observable<ApiResponse<TelegramConversation[]>>(observer => {
            this.http.get<ApiResponse<TelegramConversation[]>>(`${this.chatBaseUrl}/telegram/conversations`, { params }).subscribe({
                next: (response) => {
                    observer.next({
                        ...response,
                        data: (response.data || []).map(item => this.normalizeTelegramConversation(item))
                    });
                    observer.complete();
                },
                error: (error) => observer.error(error)
            });
        });
    }

    getTelegramConversationDetail(id: string, messageSkip = 0, messageLimit = 50): Observable<ApiResponse<TelegramConversation>> {
        if (!id) {
            return throwError(() => new Error('Telegram conversation id is required'));
        }
        const params = new HttpParams()
            .set('message_skip', messageSkip.toString())
            .set('message_limit', messageLimit.toString());
        return new Observable<ApiResponse<TelegramConversation>>(observer => {
            this.http.get<ApiResponse<TelegramConversation>>(`${this.chatBaseUrl}/telegram/conversations/${id}`, { params }).subscribe({
                next: (response) => {
                    observer.next({
                        ...response,
                        data: this.normalizeTelegramConversation(response.data)
                    });
                    observer.complete();
                },
                error: (error) => observer.error(error)
            });
        });
    }

    assignTelegramConversation(id: string, payload: TelegramAssignPayload): Observable<ApiResponse<TelegramConversation>> {
        if (!id) {
            return throwError(() => new Error('Telegram conversation id is required'));
        }
        return new Observable<ApiResponse<TelegramConversation>>(observer => {
            this.http.post<ApiResponse<TelegramConversation>>(`${this.chatBaseUrl}/telegram/conversations/${id}/assign`, payload).subscribe({
                next: (response) => {
                    observer.next({
                        ...response,
                        data: this.normalizeTelegramConversation(response.data)
                    });
                    observer.complete();
                },
                error: (error) => observer.error(error)
            });
        });
    }

    updateTelegramConversationStatus(id: string, payload: TelegramStatusPayload): Observable<ApiResponse<TelegramConversation>> {
        if (!id) {
            return throwError(() => new Error('Telegram conversation id is required'));
        }
        return new Observable<ApiResponse<TelegramConversation>>(observer => {
            this.http.post<ApiResponse<TelegramConversation>>(`${this.chatBaseUrl}/telegram/conversations/${id}/status`, payload).subscribe({
                next: (response) => {
                    observer.next({
                        ...response,
                        data: this.normalizeTelegramConversation(response.data)
                    });
                    observer.complete();
                },
                error: (error) => observer.error(error)
            });
        });
    }

    getTelegramTemplates(): Observable<ApiResponse<TelegramTemplate[]>> {
        return this.http.get<ApiResponse<TelegramTemplate[]>>(`${this.chatBaseUrl}/telegram/templates`);
    }

    createTelegramTemplate(payload: TelegramCreateTemplatePayload): Observable<ApiResponse<TelegramTemplate>> {
        return this.http.post<ApiResponse<TelegramTemplate>>(`${this.chatBaseUrl}/telegram/templates`, payload);
    }

    getTelegramSettings(): Observable<ApiResponse<TelegramSettings>> {
        return this.http.get<ApiResponse<TelegramSettings>>(`${this.chatBaseUrl}/telegram/settings`);
    }

    getTelegramCommands(): Observable<ApiResponse<TelegramCommand[]>> {
        return this.http.get<ApiResponse<TelegramCommand[]>>(`${this.chatBaseUrl}/telegram/commands`);
    }

    getTelegramWebhookStatus(): Observable<ApiResponse<TelegramWebhook>> {
        return this.http.get<ApiResponse<TelegramWebhook>>(`${this.chatBaseUrl}/telegram/webhook/status`);
    }

    setTelegramWebhook(url: string, secretToken?: string): Observable<ApiResponse<TelegramWebhook>> {
        return this.http.post<ApiResponse<TelegramWebhook>>(`${this.chatBaseUrl}/telegram/webhook/set`, { url, secret_token: secretToken });
    }

    getTelegramBroadcasts(): Observable<ApiResponse<TelegramBroadcast[]>> {
        return this.http.get<ApiResponse<TelegramBroadcast[]>>(`${this.chatBaseUrl}/telegram/broadcasts`);
    }

    createTelegramBroadcast(payload: TelegramCreateBroadcastPayload): Observable<ApiResponse<TelegramBroadcast>> {
        return this.http.post<ApiResponse<TelegramBroadcast>>(`${this.chatBaseUrl}/telegram/broadcasts`, payload);
    }

    sendTelegramMessage(payload: TelegramSendMessagePayload): Observable<ApiResponse<unknown>> {
        return this.http.post<ApiResponse<unknown>>(`${this.chatBaseUrl}/telegram/messages/send`, payload);
    }

    sendTelegramPhoto(payload: TelegramSendPhotoPayload): Observable<ApiResponse<unknown>> {
        return this.http.post<ApiResponse<unknown>>(`${this.chatBaseUrl}/telegram/messages/send-photo`, payload);
    }

    sendTelegramDocument(payload: TelegramSendDocumentPayload): Observable<ApiResponse<unknown>> {
        return this.http.post<ApiResponse<unknown>>(`${this.chatBaseUrl}/telegram/messages/send-document`, payload);
    }

    getTelegramSendTemplates(): Observable<ApiResponse<TelegramTemplate[]>> {
        return new Observable<ApiResponse<TelegramTemplate[]>>(observer => {
            this.http.get<ApiResponse<TelegramTemplate[]>>(`${this.chatBaseUrl}/telegram/templates`).subscribe({
                next: (response) => {
                    observer.next({
                        ...response,
                        data: (response.data || []).map(item => this.normalizeTelegramTemplate(item))
                    });
                    observer.complete();
                },
                error: (error) => observer.error(error)
            });
        });
    }

    sendTelegramTemplate(payload: TelegramSendTemplatePayload): Observable<ApiResponse<unknown>> {
        return this.http.post<ApiResponse<unknown>>(`${this.chatBaseUrl}/telegram/messages/send-template`, payload);
    }

    private normalizeTelegramConversation(conversation: TelegramConversation | any): TelegramConversation {
        if (!conversation) {
            return conversation;
        }

        return {
            ...conversation,
            id: conversation.id || conversation.conversation_id || conversation._id,
            messages: (conversation.messages || []).map((message: any) => ({
                ...message,
                id: message.id || message.message_id || message._id
            }))
        };
    }

    private normalizeTelegramTemplate(template: TelegramTemplate | any): TelegramTemplate {
        if (!template) {
            return template;
        }

        return {
            ...template,
            id: template.id || template.template_id || template._id
        };
    }

    // ── Paginated conversations ──────────────────────────────────────────────

    getConversationsPage(skip: number = 0, limit: number = 20, platform?: string, status?: string): Observable<ConversationPage> {
        let params = new HttpParams()
            .set('skip', skip.toString())
            .set('limit', limit.toString());
        if (platform && platform !== 'all') params = params.set('platform', platform);
        if (status && status !== 'all') params = params.set('status', status);
        return new Observable<ConversationPage>(observer => {
            this.http.get<ApiResponse<TelegramConversation[]>>(`${this.chatBaseUrl}/telegram/conversations`, { params }).subscribe({
                next: (response) => {
                    const items = (response.data || []).map(item => this.normalizeTelegramConversation(item));
                    observer.next({ items, has_more: items.length >= limit, skip });
                    observer.complete();
                },
                error: (error) => observer.error(error)
            });
        });
    }

    // ── Customer linking ─────────────────────────────────────────────────────

    searchRetailCustomers(keyword: string, limit: number = 8): Observable<ApiResponse<CustomerSummary[]>> {
        const params = new HttpParams().set('search', keyword).set('limit', limit.toString());
        return this.http.get<ApiResponse<CustomerSummary[]>>(`${getApiBase()}/retail/customers`, { params });
    }

    getRetailCustomer(customerId: string): Observable<ApiResponse<CustomerSummary>> {
        return this.http.get<ApiResponse<CustomerSummary>>(`${getApiBase()}/retail/customers/${customerId}`);
    }

    linkConversationToCustomer(conversationId: string, customerId: string | null): Observable<ApiResponse<unknown>> {
        return this.http.patch<ApiResponse<unknown>>(
            `${this.chatBaseUrl}/conversations/${conversationId}/customer-link`,
            { customer_id: customerId }
        );
    }

    // ── Product search ───────────────────────────────────────────────────────

    private normalizeProduct(p: any): ProductSearchResult {
        const primary = (p.images || []).find((i: any) => i.is_primary) || p.images?.[0];
        return {
            ...p,
            id: p.id || p._id,
            image_url: p.image_url || p.thumbnail?.url || primary?.url || undefined,
        };
    }

    getProductsForChat(skip: number = 0, limit: number = 20): Observable<ApiResponse<ProductSearchResult[]>> {
        const params = new HttpParams().set('limit', limit.toString()).set('skip', skip.toString());
        return this.http.get<any>(`${getApiBase()}/retail/products`, { params }).pipe(
            map(res => ({ ...res, data: (res.data || []).map((p: any) => this.normalizeProduct(p)) }))
        );
    }

    searchProductsForChat(keyword: string, limit: number = 10): Observable<ApiResponse<ProductSearchResult[]>> {
        const params = new HttpParams().set('search', keyword).set('limit', limit.toString()).set('skip', '0');
        return this.http.get<any>(`${getApiBase()}/retail/products`, { params }).pipe(
            map(res => ({ ...res, data: (res.data || []).map((p: any) => this.normalizeProduct(p)) }))
        );
    }

    // ── Unified template management ──────────────────────────────────────────

    getUnifiedTemplates(channel: string = '', skip: number = 0, limit: number = 20): Observable<ApiResponse<UnifiedTemplate[]>> {
        let params = new HttpParams().set('skip', skip.toString()).set('limit', limit.toString());
        if (channel) params = params.set('channel', channel);
        return this.http.get<ApiResponse<UnifiedTemplate[]>>(`${this.cmcBaseUrl}/templates`, { params });
    }

    createUnifiedTemplate(payload: UnifiedTemplateCreate): Observable<ApiResponse<UnifiedTemplate>> {
        return this.http.post<ApiResponse<UnifiedTemplate>>(`${this.cmcBaseUrl}/templates`, payload);
    }

    updateUnifiedTemplate(id: string, payload: UnifiedTemplateUpdate): Observable<ApiResponse<UnifiedTemplate>> {
        return this.http.put<ApiResponse<UnifiedTemplate>>(`${this.cmcBaseUrl}/templates/${id}`, payload);
    }

    deleteUnifiedTemplate(id: string): Observable<ApiResponse<unknown>> {
        return this.http.delete<ApiResponse<unknown>>(`${this.cmcBaseUrl}/templates/${id}`);
    }

    bulkToggleTemplates(ids: string[], enabled: boolean): Observable<ApiResponse<unknown>> {
        return this.http.post<ApiResponse<unknown>>(`${this.cmcBaseUrl}/templates/bulk-update`, { template_ids: ids, enabled });
    }

    private get cmcBaseUrl(): string {
        return `${getApiBase()}/data-mesh/domains/cmc`;
    }

    getCmcTelegramTemplates(skip: number = 0, limit: number = 50): Observable<ApiResponse<TelegramTemplate[]>> {
        const params = new HttpParams()
            .set('skip', skip.toString())
            .set('limit', limit.toString());
        return this.http.get<ApiResponse<TelegramTemplate[]>>(`${this.cmcBaseUrl}/telegram/templates`, { params });
    }

    getCmcFacebookTemplates(skip: number = 0, limit: number = 50): Observable<ApiResponse<any[]>> {
        const params = new HttpParams()
            .set('skip', skip.toString())
            .set('limit', limit.toString());
        return this.http.get<ApiResponse<any[]>>(`${this.cmcBaseUrl}/facebook/templates`, { params });
    }

    getCmcEmailTemplates(skip: number = 0, limit: number = 50): Observable<ApiResponse<any[]>> {
        const params = new HttpParams()
            .set('skip', skip.toString())
            .set('limit', limit.toString());
        return this.http.get<ApiResponse<any[]>>(`${this.cmcBaseUrl}/email/templates`, { params });
    }

    getCmcSmsTemplates(skip: number = 0, limit: number = 50): Observable<ApiResponse<any[]>> {
        const params = new HttpParams()
            .set('skip', skip.toString())
            .set('limit', limit.toString());
        return this.http.get<ApiResponse<any[]>>(`${this.cmcBaseUrl}/sms/templates`, { params });
    }

    // ── Labels ───────────────────────────────────────────────────────────────

    getLabels(): Observable<ApiResponse<Label[]>> {
        return this.http.get<ApiResponse<Label[]>>(`${this.cmcBaseUrl}/settings/labels`);
    }

    createLabel(payload: LabelCreate): Observable<ApiResponse<Label>> {
        return this.http.post<ApiResponse<Label>>(`${this.cmcBaseUrl}/settings/labels`, payload);
    }

    updateLabel(id: string, payload: Partial<LabelCreate>): Observable<ApiResponse<Label>> {
        return this.http.put<ApiResponse<Label>>(`${this.cmcBaseUrl}/settings/labels/${id}`, payload);
    }

    deleteLabel(id: string): Observable<ApiResponse<unknown>> {
        return this.http.delete<ApiResponse<unknown>>(`${this.cmcBaseUrl}/settings/labels/${id}`);
    }

    patchConversationLabels(conversationId: string, labels: string[]): Observable<ApiResponse<unknown>> {
        return this.http.patch<ApiResponse<unknown>>(`${this.cmcBaseUrl}/conversations/${conversationId}/labels`, { labels });
    }

    // ── Internal Notes ────────────────────────────────────────────────────────

    addInternalNote(conversationId: string, content: string): Observable<ApiResponse<InternalNote>> {
        return this.http.post<ApiResponse<InternalNote>>(`${this.cmcBaseUrl}/conversations/${conversationId}/notes`, { content });
    }

    deleteInternalNote(conversationId: string, noteId: string): Observable<ApiResponse<unknown>> {
        return this.http.delete<ApiResponse<unknown>>(`${this.cmcBaseUrl}/conversations/${conversationId}/notes/${noteId}`);
    }

    // ── Read Status ───────────────────────────────────────────────────────────

    markConversationRead(conversationId: string): Observable<ApiResponse<unknown>> {
        return this.http.patch<ApiResponse<unknown>>(`${this.cmcBaseUrl}/conversations/${conversationId}/read`, {});
    }

    getUnreadSummary(): Observable<ApiResponse<UnreadSummary>> {
        return this.http.get<ApiResponse<UnreadSummary>>(`${this.cmcBaseUrl}/conversations/unread-summary`);
    }

    markAllRead(): Observable<ApiResponse<unknown>> {
        return this.http.post<ApiResponse<unknown>>(`${this.cmcBaseUrl}/conversations/mark-all-read`, {});
    }

    // ── Quick Replies ─────────────────────────────────────────────────────────

    getQuickReplies(limit: number = 200): Observable<ApiResponse<QuickReply[]>> {
        const params = new HttpParams().set('limit', limit.toString());
        return this.http.get<ApiResponse<QuickReply[]>>(`${this.cmcBaseUrl}/settings/quick-replies`, { params });
    }

    createQuickReply(payload: QuickReplyCreate): Observable<ApiResponse<QuickReply>> {
        return this.http.post<ApiResponse<QuickReply>>(`${this.cmcBaseUrl}/settings/quick-replies`, payload);
    }

    updateQuickReply(id: string, payload: Partial<QuickReplyCreate>): Observable<ApiResponse<QuickReply>> {
        return this.http.put<ApiResponse<QuickReply>>(`${this.cmcBaseUrl}/settings/quick-replies/${id}`, payload);
    }

    deleteQuickReply(id: string): Observable<ApiResponse<unknown>> {
        return this.http.delete<ApiResponse<unknown>>(`${this.cmcBaseUrl}/settings/quick-replies/${id}`);
    }

    // ── Agent Presence ────────────────────────────────────────────────────────

    setAgentPresence(status: 'online' | 'busy' | 'away'): Observable<ApiResponse<AgentPresence>> {
        return this.http.put<ApiResponse<AgentPresence>>(`${this.cmcBaseUrl}/agents/me/presence`, { status });
    }

    getOnlineAgents(status: string = 'online,busy'): Observable<ApiResponse<AgentInfo[]>> {
        const params = new HttpParams().set('status', status);
        return this.http.get<ApiResponse<AgentInfo[]>>(`${this.cmcBaseUrl}/agents`, { params });
    }

    // ── SLA ───────────────────────────────────────────────────────────────────

    getSlaSettings(): Observable<ApiResponse<SlaPolicy[]>> {
        return this.http.get<ApiResponse<SlaPolicy[]>>(`${this.cmcBaseUrl}/settings/sla`);
    }

    createSlaPolicy(payload: Omit<SlaPolicy, 'id'>): Observable<ApiResponse<SlaPolicy>> {
        return this.http.post<ApiResponse<SlaPolicy>>(`${this.cmcBaseUrl}/settings/sla`, payload);
    }

    updateSlaPolicy(id: string, responseMinutes: number): Observable<ApiResponse<SlaPolicy>> {
        return this.http.put<ApiResponse<SlaPolicy>>(`${this.cmcBaseUrl}/settings/sla/${id}`, { response_minutes: responseMinutes });
    }

    deleteSlaPolicy(id: string): Observable<ApiResponse<unknown>> {
        return this.http.delete<ApiResponse<unknown>>(`${this.cmcBaseUrl}/settings/sla/${id}`);
    }

    // ── Customer 360 ──────────────────────────────────────────────────────────

    getCustomerOrders(customerId: string, limit: number = 5): Observable<ApiResponse<CustomerOrder[]>> {
        const params = new HttpParams().set('customer_id', customerId).set('limit', limit.toString()).set('sort', '-created_at');
        return this.http.get<ApiResponse<CustomerOrder[]>>(`${getApiBase()}/retail/orders`, { params });
    }

    getCustomerChatHistory(customerId: string, limit: number = 5): Observable<ApiResponse<TelegramConversation[]>> {
        const params = new HttpParams().set('customer_id', customerId).set('limit', limit.toString());
        return this.http.get<ApiResponse<TelegramConversation[]>>(`${this.cmcBaseUrl}/conversations`, { params });
    }

    // ── Broadcast Campaigns ───────────────────────────────────────────────────

    getBroadcastCampaigns(skip: number = 0, limit: number = 20): Observable<ApiResponse<BroadcastCampaign[]>> {
        const params = new HttpParams().set('skip', skip.toString()).set('limit', limit.toString());
        return this.http.get<ApiResponse<BroadcastCampaign[]>>(`${this.cmcBaseUrl}/broadcasts`, { params });
    }

    createBroadcastCampaign(payload: BroadcastCreate): Observable<ApiResponse<BroadcastCampaign>> {
        return this.http.post<ApiResponse<BroadcastCampaign>>(`${this.cmcBaseUrl}/broadcasts`, payload);
    }

    estimateBroadcastAudience(audienceFilter: BroadcastCreate['audience_filter']): Observable<ApiResponse<BroadcastEstimate>> {
        return this.http.post<ApiResponse<BroadcastEstimate>>(`${this.cmcBaseUrl}/broadcasts/estimate`, { audience_filter: audienceFilter });
    }

    cancelBroadcastCampaign(id: string): Observable<ApiResponse<unknown>> {
        return this.http.post<ApiResponse<unknown>>(`${this.cmcBaseUrl}/broadcasts/${id}/cancel`, {});
    }

    getBroadcastStats(id: string): Observable<ApiResponse<BroadcastCampaign['stats']>> {
        return this.http.get<ApiResponse<BroadcastCampaign['stats']>>(`${this.cmcBaseUrl}/broadcasts/${id}/stats`);
    }
}
