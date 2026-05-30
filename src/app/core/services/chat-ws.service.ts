import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { getApiBase } from '../config/api-config';

// ── Event types ───────────────────────────────────────────────────────────────

export interface WsNewMessageEvent {
  type: 'new_message';
  conversation_id: string;
  message: {
    sender: string;
    sender_name: string;
    content: string;
    timestamp: string;
    message_type: string;
    delivery_status: string;
  };
  platform: string;
  unread_count_delta?: number;
}

export interface WsUnreadUpdateEvent {
  type: 'unread_update';
  conversation_id: string;
  unread_count: number;
}

export interface WsPollEvent {
  type: 'poll';
}

export type WsEvent = WsNewMessageEvent | WsUnreadUpdateEvent | WsPollEvent;

export type ConnectionMode = 'ws' | 'polling' | 'disconnected';

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ChatWsService implements OnDestroy {
  private ws: WebSocket | null = null;
  private eventsSubject = new Subject<WsEvent>();
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private modeSubject = new BehaviorSubject<ConnectionMode>('disconnected');

  readonly events$: Observable<WsEvent> = this.eventsSubject.asObservable();
  readonly isConnected$: Observable<boolean> = this.isConnectedSubject.asObservable();
  readonly mode$: Observable<ConnectionMode> = this.modeSubject.asObservable();

  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private wsToken: string | null = null;

  constructor(private http: HttpClient) {}

  // ── Public API ──────────────────────────────────────────────────────────────

  connect(): void {
    this.reconnectAttempts = 0;
    this.fetchTokenAndConnect();
  }

  disconnect(): void {
    this.clearTimers();
    this.closeSocket();
    this.modeSubject.next('disconnected');
    this.isConnectedSubject.next(false);
    this.reconnectAttempts = 0;
    this.wsToken = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  // ── Token exchange ──────────────────────────────────────────────────────────

  private fetchTokenAndConnect(): void {
    this.http
      .get<{ ws_token: string }>(`${getApiBase()}/data-mesh/domains/cmc/ws/token`, {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          this.wsToken = res.ws_token;
          this.openSocket();
        },
        error: () => this.scheduleReconnect(),
      });
  }

  // ── WebSocket lifecycle ─────────────────────────────────────────────────────

  private openSocket(): void {
    if (!this.wsToken) return;

    const wsBase = getApiBase().replace(/^https/, 'wss').replace(/^http/, 'ws');
    const url = `${wsBase}/data-mesh/domains/cmc/ws/workspace?token=${encodeURIComponent(this.wsToken)}`;

    this.closeSocket();
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.isConnectedSubject.next(true);
      this.modeSubject.next('ws');
      this.stopPolling();
    };

    this.ws.onmessage = (ev) => {
      try {
        const data: WsEvent = JSON.parse(ev.data);
        if (data.type !== ('ping' as any)) {
          this.eventsSubject.next(data);
        }
      } catch {
        // ignore malformed frames
      }
    };

    this.ws.onclose = () => {
      this.isConnectedSubject.next(false);
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // onclose fires immediately after onerror — handled there
    };
  }

  private closeSocket(): void {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  // ── Reconnect logic ─────────────────────────────────────────────────────────

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.modeSubject.next('polling');
      this.startPolling();
      return;
    }

    // Exponential backoff: 1s → 2s → 4s → 8s → 16s (max 30s)
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30_000);
    this.reconnectAttempts++;
    this.modeSubject.next('disconnected');

    this.reconnectTimer = setTimeout(() => {
      if (this.wsToken) {
        this.openSocket();
      } else {
        this.fetchTokenAndConnect();
      }
    }, delay);
  }

  // ── Polling fallback ────────────────────────────────────────────────────────

  private startPolling(): void {
    if (this.pollingTimer) return;
    this.pollingTimer = setInterval(() => {
      this.eventsSubject.next({ type: 'poll' });
    }, 10_000);
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPolling();
  }
}
