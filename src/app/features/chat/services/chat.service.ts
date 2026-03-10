import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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
    TelegramWebhook
} from '../models/chat.model';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private http = inject(HttpClient);
    private apiBase = getApiBase();

    // Base URL for chat domain
    private chatBaseUrl = `${this.apiBase}/data-mesh/domains/chat`;

    getChatDataProducts(): Observable<ApiResponse<ChatDataProducts>> {
        return this.http.get<ApiResponse<ChatDataProducts>>(`${this.chatBaseUrl}/`);
    }

    getConversations(limit: number = 10, offset: number = 0): Observable<ApiResponse<Conversation[]>> {
        const params = new HttpParams()
            .set('limit', limit.toString())
            .set('offset', offset.toString());
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

    getTelegramConversationDetail(id: string): Observable<ApiResponse<TelegramConversation>> {
        if (!id) {
            return throwError(() => new Error('Telegram conversation id is required'));
        }
        return new Observable<ApiResponse<TelegramConversation>>(observer => {
            this.http.get<ApiResponse<TelegramConversation>>(`${this.chatBaseUrl}/telegram/conversations/${id}`).subscribe({
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
}
