import {
  Component, Input, Output, EventEmitter, ViewChild, ElementRef,
  AfterViewInit, OnDestroy, OnChanges, SimpleChanges, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { TelegramConversation } from '../../../models/chat.model';
import { ChatService } from '../../../services/chat.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [CommonModule, SkeletonModule, TagModule],
  host: { style: 'display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;' },
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
    .cl-actions {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0.4rem 1rem; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
    }
    .cl-mark-all {
      font: inherit; background: none; border: none; cursor: pointer;
      font-size: 0.72rem; font-weight: 600; color: #2563eb;
      display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.2rem 0;
    }
    .cl-count {
      font-size: 0.72rem; font-weight: 700; color: #94a3b8;
    }
    .cl-scroll {
      flex: 1; min-height: 0; overflow-y: auto;
    }
    .cl-skeleton { padding: 0.75rem 1rem; display: flex; gap: 0.75rem; }
    .cl-empty {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 3rem 1rem; gap: 0.5rem;
      color: #94a3b8; text-align: center;
    }
    .cl-empty i { font-size: 2rem; }
    .cl-empty p { margin: 0; font-size: 0.85rem; }
    .cl-item {
      display: flex; align-items: flex-start; gap: 0.65rem;
      padding: 0.75rem 1rem; width: 100%; text-align: left;
      background: none; border: none; cursor: pointer;
      border-bottom: 1px solid #f8fafc;
      transition: background 0.12s;
    }
    .cl-item:hover { background: #f8fafc; }
    .cl-item.active { background: #eff6ff; border-left: 3px solid #2563eb; }
    .cl-item.unread .cl-name { font-weight: 700; }
    .cl-av {
      width: 2.4rem; height: 2.4rem; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.875rem; font-weight: 700; color: #fff;
      background: #64748b;
    }
    .cl-av[data-ch="telegram"] { background: linear-gradient(135deg, #0088cc, #229ed9); }
    .cl-av[data-ch="facebook"] { background: linear-gradient(135deg, #1877f2, #42a5f5); }
    .cl-av[data-ch="web"]      { background: linear-gradient(135deg, #059669, #34d399); }
    .cl-av[data-ch="app"]      { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
    .cl-body { flex: 1; min-width: 0; }
    .cl-row1 {
      display: flex; align-items: center; justify-content: space-between;
      gap: 0.4rem; margin-bottom: 0.15rem;
    }
    .cl-name {
      font-size: 0.875rem; font-weight: 600; color: #0f172a;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
    }
    .cl-time { font-size: 0.7rem; color: #94a3b8; white-space: nowrap; flex-shrink: 0; }
    .cl-row2 {
      display: flex; align-items: center; gap: 0.3rem; margin-bottom: 0.2rem;
    }
    .cl-ch-icon { font-size: 0.7rem; color: #94a3b8; flex-shrink: 0; }
    .cl-preview {
      font-size: 0.78rem; color: #64748b;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
    }
    .cl-badge {
      flex-shrink: 0; min-width: 1.25rem; height: 1.25rem;
      background: #2563eb; color: #fff; border-radius: 999px;
      font-size: 0.68rem; font-weight: 700; padding: 0 0.3rem;
      display: inline-flex; align-items: center; justify-content: center;
    }
    .cl-row3 { display: flex; align-items: center; gap: 0.4rem; }
    .cl-agent {
      font-size: 0.68rem; color: #94a3b8;
      display: inline-flex; align-items: center; gap: 0.2rem;
    }
    .cl-footer {
      padding: 0.6rem 1rem; text-align: center; flex-shrink: 0;
    }
    .cl-load-more {
      font: inherit; font-size: 0.78rem; font-weight: 600; color: #2563eb;
      background: none; border: 1px solid #bfdbfe; border-radius: 8px;
      cursor: pointer; padding: 0.4rem 1rem; width: 100%;
    }
    .cl-loading-more { color: #94a3b8; font-size: 0.78rem; }
  `],
  template: `
    <div *ngIf="!loading && conversations.length > 0" class="cl-actions">
      <button type="button" class="cl-mark-all" (click)="markAllRead()">
        <i class="pi pi-check-square"></i> Mark all as read
      </button>
      <span class="cl-count">{{ conversations.length }}</span>
    </div>

    <div class="cl-scroll">
      <!-- Skeletons -->
      <ng-container *ngIf="loading && conversations.length === 0">
        <div *ngFor="let _ of skeletons" class="cl-skeleton">
          <p-skeleton shape="circle" size="2.4rem" styleClass="flex-shrink-0"></p-skeleton>
          <div style="flex:1">
            <p-skeleton height="0.85rem" width="65%" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="0.72rem" width="85%"></p-skeleton>
          </div>
        </div>
      </ng-container>

      <!-- Empty -->
      <div *ngIf="!loading && conversations.length === 0" class="cl-empty">
        <i class="pi pi-inbox"></i>
        <p>No conversations</p>
      </div>

      <!-- Items -->
      <button *ngFor="let conv of conversations" type="button" class="cl-item"
              [class.active]="selectedId === conv.id"
              [class.unread]="(conv.unread_count ?? 0) > 0"
              (click)="selectItem(conv)">
        <div class="cl-av" [attr.data-ch]="getChannelKey(conv)">
          {{ (conv.user_name || '?').charAt(0).toUpperCase() }}
        </div>
        <div class="cl-body">
          <div class="cl-row1">
            <span class="cl-name">{{ conv.user_name }}</span>
            <span class="cl-time">{{ conv.last_message_time | date:'HH:mm' }}</span>
          </div>
          <div class="cl-row2">
            <i [class]="getChannelIcon(conv)" class="cl-ch-icon"></i>
            <span class="cl-preview">{{ conv.last_message }}</span>
            <span *ngIf="(conv.unread_count ?? 0) > 0" class="cl-badge">{{ conv.unread_count }}</span>
          </div>
          <div class="cl-row3">
            <p-tag [value]="conv.status" [severity]="getStatusSeverity(conv.status)"></p-tag>
            <span *ngIf="conv.agent" class="cl-agent">
              <i class="pi pi-user"></i>{{ conv.agent }}
            </span>
          </div>
        </div>
      </button>

      <!-- IntersectionObserver sentinel -->
      <div #listSentinel style="height:1px;" *ngIf="hasMore && !loading"></div>

      <!-- Load more footer -->
      <div *ngIf="conversations.length > 0" class="cl-footer">
        <button *ngIf="hasMore && !loading" type="button" class="cl-load-more" (click)="loadMore.emit()">
          Load more
        </button>
        <span *ngIf="loading && conversations.length > 0" class="cl-loading-more">
          <i class="pi pi-spin pi-spinner"></i> Loading...
        </span>
      </div>
    </div>
  `
})
export class ConversationListComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() conversations: TelegramConversation[] = [];
  @Input() selectedId: string | null = null;
  @Input() loading = false;
  @Input() hasMore = false;

  @Output() conversationSelected = new EventEmitter<string>();
  @Output() loadMore = new EventEmitter<void>();

  @ViewChild('listSentinel') private sentinel?: ElementRef<HTMLDivElement>;

  readonly skeletons = [1, 2, 3, 4, 5];

  private observer?: IntersectionObserver;
  private chatService = inject(ChatService);

  ngAfterViewInit(): void { this.attachObserver(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hasMore'] || changes['conversations']) {
      setTimeout(() => this.attachObserver());
    }
  }

  ngOnDestroy(): void { this.observer?.disconnect(); }

  private attachObserver(): void {
    this.observer?.disconnect();
    if (!this.sentinel?.nativeElement || !this.hasMore) return;
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && this.hasMore && !this.loading) {
        this.loadMore.emit();
      }
    }, { threshold: 0.1 });
    this.observer.observe(this.sentinel.nativeElement);
  }

  selectItem(conv: TelegramConversation): void {
    this.conversationSelected.emit(conv.id);
    if ((conv.unread_count ?? 0) > 0) {
      this.chatService.markConversationRead(conv.id).subscribe({
        next: () => {
          const idx = this.conversations.findIndex(c => c.id === conv.id);
          if (idx !== -1) this.conversations[idx].unread_count = 0;
        },
        error: () => {}
      });
    }
  }

  markAllRead(): void {
    this.chatService.markAllRead().subscribe({
      next: () => this.conversations.forEach(c => c.unread_count = 0),
      error: () => {}
    });
  }

  getChannelKey(conv: TelegramConversation): string {
    switch ((conv.platform || '').toLowerCase()) {
      case 'facebook': return 'facebook';
      case 'web': return 'web';
      case 'app': return 'app';
      default: return 'telegram';
    }
  }

  getChannelIcon(conv: TelegramConversation): string {
    switch (this.getChannelKey(conv)) {
      case 'facebook': return 'pi pi-facebook';
      case 'web': return 'pi pi-globe';
      case 'app': return 'pi pi-mobile';
      default: return 'pi pi-send';
    }
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'secondary' {
    switch (status) {
      case 'active': return 'success';
      case 'pending_human': return 'warning';
      case 'resolved': return 'info';
      default: return 'secondary';
    }
  }
}
