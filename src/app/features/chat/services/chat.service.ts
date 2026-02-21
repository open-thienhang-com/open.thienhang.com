import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';
import {
    ApiResponse,
    ChatDataProducts,
    Conversation,
    Agent,
    ChatAnalytics,
    ChatSummary
} from '../models/chat.model';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private http = inject(HttpClient);
    private apiBase = getApiBase(); // Assuming this returns http://localhost:8080 or similar

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
}
