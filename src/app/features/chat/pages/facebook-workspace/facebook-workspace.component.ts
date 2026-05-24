import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ChatService } from '../../services/chat.service';
import {
  AgentInfo,
  CustomerSummary,
  InternalNote,
  Label,
  QuickReply,
  TelegramBotProfile,
  TelegramConversation,
  TelegramDashboard,
  TelegramMessage,
  TelegramSettings
} from '../../models/chat.model';
import { ConversationListComponent } from './panels/conversation-list.component';
import { MessageThreadComponent } from './panels/message-thread.component';
import { CustomerPanelComponent } from './panels/customer-panel.component';
import { ProductPanelComponent } from './panels/product-panel.component';
import { TemplateSendPanelComponent } from './panels/template-send-panel.component';

@Component({
  selector: 'app-facebook-workspace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    SkeletonModule,
    TagModule,
    ToastModule,
    ConversationListComponent,
    MessageThreadComponent,
    CustomerPanelComponent,
    ProductPanelComponent,
    TemplateSendPanelComponent
  ],
  templateUrl: './facebook-workspace.component.html',
  styleUrl: './facebook-workspace.component.scss',
  providers: [MessageService]
})
export class FacebookWorkspaceComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);
  @ViewChild(MessageThreadComponent) private messageThreadRef?: MessageThreadComponent;

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly conversations = signal<TelegramConversation[]>([]);
  readonly selectedConversation = signal<TelegramConversation | null>(null);
  readonly loading = signal(false);
  readonly loadingConversations = signal(false);
  readonly loadingMoreMessages = signal(false);
  readonly hasMoreMessages = signal(false);
  readonly hasMoreConversations = signal(true);
  readonly conversationSkip = signal(0);

  // UI filter signals (needed for computed filteredConversations)
  readonly searchTerm = signal('');
  readonly activeQueue = signal('all');
  readonly activeChannel = signal('all');
  readonly infoPanel = signal<'customer' | 'product' | 'context' | 'channel' | 'template'>('customer');
  readonly linkedCustomer = signal<CustomerSummary | null>(null);
  readonly agents = signal<AgentInfo[]>([]);
  readonly quickReplies = signal<QuickReply[]>([]);
  readonly resolvingConversation = signal(false);
  readonly assigningConversation = signal(false);
  assignDropdownVisible = false;
  quickReplyPickerVisible = false;
  quickReplyFilter = '';

  // ── Bulk selection ─────────────────────────────────────────────────────────
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly threadTab = signal<'messages' | 'notes'>('messages');
  bulkAssignDropdownVisible = false;
  readonly notes = signal<InternalNote[]>([]);
  readonly savingNote = signal(false);
  draftNote = '';

  // ── Labels + Presence + Bot ────────────────────────────────────────────────
  readonly labels = signal<Label[]>([]);
  readonly myPresence = signal<'online' | 'busy' | 'away'>('online');
  readonly updatingBotStatus = signal(false);
  presenceDropdownOpen = false;
  labelPickerOpen = false;
  editPriority = 'medium';
  editCategory = '';
  lastRefreshed: Date | null = null;

  private refreshMessagesInterval?: ReturnType<typeof setInterval>;
  private refreshConversationsInterval?: ReturnType<typeof setInterval>;

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly filteredConversations = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const queue = this.activeQueue();
    const channel = this.activeChannel();
    return this.conversations().filter(conv => {
      if (!this._matchesQueue(conv, queue)) return false;
      if (channel !== 'all' && this.getConversationChannel(conv) !== channel) return false;
      if (!query) return true;
      return [conv.user_name, conv.username, conv.last_message, conv.agent, conv.category, ...(conv.tags || [])]
        .filter(Boolean).join(' ').toLowerCase().includes(query);
    });
  });

  readonly filteredQuickReplies = computed(() => {
    const q = this.quickReplyFilter.toLowerCase();
    return this.quickReplies().filter(r =>
      !q || r.shortcut.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)
    );
  });

  readonly myPresenceLabel = computed(() => {
    switch (this.myPresence()) {
      case 'online': return 'Online';
      case 'busy': return 'Busy';
      case 'away': return 'Away';
    }
  });

  readonly conversationLabels = computed<Label[]>(() => {
    const conv = this.selectedConversation();
    if (!conv?.tags?.length || !this.labels().length) return [];
    return this.labels().filter(l => (conv.tags || []).includes(l.id));
  });

  // ── Static data ────────────────────────────────────────────────────────────
  readonly channelFilters = [
    { label: 'All', value: 'all' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Telegram', value: 'telegram' },
    { label: 'Web', value: 'web' },
    { label: 'App', value: 'app' }
  ];

  readonly queueTabs = [
    { label: 'Pending', value: 'pending_human' },
    { label: 'Unread', value: 'unread' },
    { label: 'Active', value: 'active' },
    { label: 'All', value: 'all' }
  ];

  readonly quickActions = [
    { label: 'Text', icon: 'pi pi-pencil', mode: 'text' },
    { label: 'Photo', icon: 'pi pi-image', mode: 'photo' },
    { label: 'Product', icon: 'pi pi-shopping-bag', mode: 'product' },
    { label: 'GIF', icon: 'pi pi-images', mode: 'gif' },
    { label: 'Document', icon: 'pi pi-file', mode: 'document' },
    { label: 'Template', icon: 'pi pi-file-export', mode: 'template' },
    { label: 'Icon', icon: 'pi pi-face-smile', mode: 'icon' }
  ];

  readonly iconGroups = [
    { label: 'Reactions', icons: ['👍', '👎', '👏', '🙌', '🙏', '🤝', '💪', '👌', '✌️', '🤞', '🫶', '👀'] },
    { label: 'Mood', icons: ['😀', '😄', '😁', '😊', '😍', '😘', '😂', '🥳', '😎', '🤔', '😴', '😭'] },
    { label: 'Status', icons: ['✅', '❌', '⚠️', '⏳', '🚀', '🔥', '⭐', '📌', '💡', '🔔', '🔒', '📣'] },
    { label: 'Celebration', icons: ['🎉', '🎊', '🎁', '🏆', '🍀', '🌟', '💯', '🪄', '🎯', '🕺', '💃', '🥂'] },
    { label: 'Objects', icons: ['📦', '📄', '📎', '🧾', '💳', '🛍️', '🏷️', '🖼️', '📱', '💻', '🧰', '🛠️'] },
    { label: 'Travel', icons: ['🚗', '🛵', '🚚', '✈️', '🚆', '🗺️', '📍', '🏪', '🏬', '🏨', '🏝️', '⛽'] },
    { label: 'Weather', icons: ['☀️', '🌤️', '⛅', '🌧️', '⛈️', '❄️', '🌈', '🌙', '⭐', '🌊', '🌴', '🍃'] },
    { label: 'Hearts', icons: ['❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🤍', '🤎', '💓', '💞'] }
  ];

  // ── Plain properties (non-reactive form state) ─────────────────────────────
  sendingReply = false;
  sendingMedia = false;
  sendingIcon = false;
  overviewDialogVisible = false;
  filterDialogVisible = false;
  actionPopupMode: 'none' | 'photo' | 'gif' | 'document' | 'icon' | 'product' = 'none';

  profile: TelegramBotProfile | null = null;
  dashboard: TelegramDashboard | null = null;
  settings: TelegramSettings | null = null;

  draftReply = '';
  mediaType: 'photo' | 'gif' | 'document' = 'photo';
  mediaUrl = '';
  mediaCaption = '';
  protectMediaContent = false;
  selectedIcon = '👍';
  disableNotification = false;

  productName = '';
  productPrice = '';
  productDesc = '';
  productLink = '';
  productImageUrl = '';
  sendingProduct = false;

  readonly MESSAGE_PAGE_SIZE = 50;
  private messageSkip = 0;

  readonly journeySteps = [
    { label: 'Shared history', value: 'Cross-channel continuity', detail: 'The same thread remains visible when the customer moves between web, app, and social entry points.' },
    { label: 'Product context', value: 'Attached automatically', detail: 'Product, category, and support intent can ride with the conversation instead of being repeated by the customer.' },
    { label: 'BOPIS prompt', value: 'Store inventory CTA', detail: 'Store-level pickup and stock checks stay available inside the conversation workflow.' }
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadWorkspace();
    this.loadLabels();
    this._restorePresence();
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // ── Data loading ───────────────────────────────────────────────────────────
  loadWorkspace(): void {
    this.loading.set(true);
    this.loadingConversations.set(true);
    let pending = 3;
    const done = () => { if (--pending <= 0) this.loading.set(false); };
    this.chatService.getOnlineAgents('online,busy').pipe(catchError(() => of(null))).subscribe(res => {
      this.agents.set(res?.data ?? []);
    });
    this.chatService.getQuickReplies().pipe(catchError(() => of(null))).subscribe(res => {
      this.quickReplies.set(res?.data ?? []);
    });

    this.chatService.getTelegramProfile().pipe(catchError(() => of(null))).subscribe(res => {
      this.profile = res?.data ?? null;
      done();
    });

    this.chatService.getTelegramDashboard().pipe(catchError(() => of(null))).subscribe(res => {
      this.dashboard = res?.data ?? null;
      done();
    });

    this.chatService.getTelegramSettings().pipe(catchError(() => of(null))).subscribe(res => {
      this.settings = res?.data ?? null;
      done();
    });

    this.chatService.getTelegramConversations(0, 20).pipe(catchError(() => of(null))).subscribe(res => {
      const data = res?.data || [];
      this.conversations.set(data);
      this.conversationSkip.set(data.length);
      this.hasMoreConversations.set(data.length >= 20);
      this.loadingConversations.set(false);

      if (!this.getQueueCount(this.activeQueue()) && this.conversations().length) {
        this.activeQueue.set(this.getQueueCount('pending_human') > 0 ? 'pending_human' : 'all');
      }

      const next = this.filteredConversations()[0] || this.conversations()[0] || null;
      if (next?.id) {
        this.selectConversation(next.id);
      } else {
        this.selectedConversation.set(null);
      }
    });
  }

  loadMoreConversations(): void {
    if (this.loadingConversations() || !this.hasMoreConversations()) return;
    const skip = this.conversationSkip();
    this.loadingConversations.set(true);
    this.chatService.getConversationsPage(skip, 20).subscribe({
      next: (page) => {
        const current = this.conversations();
        const existingIds = new Set(current.map(c => c.id));
        const newItems = page.items.filter(c => !existingIds.has(c.id));
        let merged = [...current, ...newItems];
        if (merged.length > 200) merged = merged.slice(merged.length - 200);
        this.conversations.set(merged);
        this.conversationSkip.set(skip + page.items.length);
        this.hasMoreConversations.set(page.has_more);
        this.loadingConversations.set(false);
      },
      error: () => this.loadingConversations.set(false)
    });
  }

  // ── Conversation selection ─────────────────────────────────────────────────
  selectConversation(id: string | null | undefined): void {
    if (!id) {
      this.selectedConversation.set(null);
      this.loading.set(false);
      return;
    }
    this.threadTab.set('messages');
    this.infoPanel.set('customer');
    this.messageSkip = 0;
    this.hasMoreMessages.set(false);

    this.chatService.getTelegramConversationDetail(id, 0, this.MESSAGE_PAGE_SIZE).subscribe({
      next: (response) => {
        this.selectedConversation.set(response.data);
        const pagination = (response.data as any)?.message_pagination;
        this.hasMoreMessages.set(pagination?.has_more ?? false);
        this.messageSkip = this.MESSAGE_PAGE_SIZE;
        this.loading.set(false);
        this.draftReply = '';
        this.draftNote = '';
        this.notes.set([]);
        this.editPriority = response.data?.priority || 'medium';
        this.editCategory = response.data?.category || '';
        this.labelPickerOpen = false;
        this.resetMediaForm();
        this.disableNotification = false;
        this.linkedCustomer.set(null);
        this.closeActionPopup();
        if (response.data?.customer_id) {
          this.chatService.getRetailCustomer(response.data.customer_id)
            .pipe(catchError(() => of(null)))
            .subscribe(res => this.linkedCustomer.set(res?.data ?? null));
        }
        setTimeout(() => this.messageThreadRef?.scrollToBottom());
        this.chatService.markConversationRead(id).pipe(catchError(() => of(null))).subscribe(() => {
          this.conversations.update(convs => convs.map(c => c.id === id ? { ...c, unread_count: 0 } : c));
        });
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Detail failed', detail: 'Unable to load conversation detail' });
      }
    });
  }

  handleLoadOlderMessages(): void {
    const conv = this.selectedConversation();
    if (!conv?.id || this.loadingMoreMessages() || !this.hasMoreMessages()) return;

    this.loadingMoreMessages.set(true);
    this.chatService.getTelegramConversationDetail(conv.id, this.messageSkip, this.MESSAGE_PAGE_SIZE).subscribe({
      next: (response) => {
        const olderMessages = response.data?.messages ?? [];
        const pagination = (response.data as any)?.message_pagination;
        this.hasMoreMessages.set(pagination?.has_more ?? false);
        this.messageSkip += this.MESSAGE_PAGE_SIZE;

        const current = this.selectedConversation();
        if (current) {
          this.selectedConversation.set({
            ...current,
            messages: [...olderMessages, ...(current.messages || [])]
          });
        }
        this.loadingMoreMessages.set(false);
      },
      error: () => this.loadingMoreMessages.set(false)
    });
  }

  // ── Bulk selection ─────────────────────────────────────────────────────────
  get allSelected(): boolean {
    const filtered = this.filteredConversations();
    return filtered.length > 0 && filtered.every(c => this.selectedIds().has(c.id));
  }

  toggleSelect(id: string): void {
    this.selectedIds.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleSelectAll(): void {
    const filtered = this.filteredConversations();
    if (this.allSelected) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(filtered.map(c => c.id)));
    }
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
    this.bulkAssignDropdownVisible = false;
  }

  bulkResolve(): void {
    const ids = [...this.selectedIds()];
    if (!ids.length) return;
    ids.forEach(id => {
      this.chatService.updateTelegramConversationStatus(id, { status: 'resolved', note: '' })
        .pipe(catchError(() => of(null))).subscribe(() => {
          this.conversations.update(cs => cs.map(c => c.id === id ? { ...c, status: 'resolved' } : c));
        });
    });
    this.clearSelection();
    this.messageService.add({ severity: 'success', summary: 'Bulk resolved', detail: `${ids.length} conversation(s) resolved` });
  }

  bulkAssign(agentId: string, agentName: string): void {
    const ids = [...this.selectedIds()];
    if (!ids.length) return;
    ids.forEach(id => {
      this.chatService.assignTelegramConversation(id, { agent_id: agentId, agent_name: agentName })
        .pipe(catchError(() => of(null))).subscribe(() => {
          this.conversations.update(cs => cs.map(c => c.id === id ? { ...c, agent: agentName } : c));
        });
    });
    this.clearSelection();
    this.messageService.add({ severity: 'success', summary: 'Bulk assigned', detail: `${ids.length} conversation(s) assigned to ${agentName}` });
  }

  // ── Filter controls ────────────────────────────────────────────────────────
  setActiveQueue(queue: string): void {
    this.activeQueue.set(queue);
  }

  setActiveChannel(channel: string): void {
    this.activeChannel.set(channel);
  }

  // ── Derived helpers ────────────────────────────────────────────────────────
  get overviewCards() {
    return [
      { label: 'Open queue', value: this.filteredConversations().length, caption: 'Threads currently visible in the unified inbox.', icon: 'pi pi-comments', tone: 'blue' },
      { label: 'Pending human', value: this.dashboard?.counters.pending_human ?? 0, caption: 'Conversations waiting for agent pickup.', icon: 'pi pi-user-plus', tone: 'orange' },
      { label: 'Unread', value: this.dashboard?.counters.unread_messages ?? 0, caption: 'Unread requests across every connected channel.', icon: 'pi pi-inbox', tone: 'purple' },
      { label: 'Connected channels', value: '4', caption: 'Facebook, Telegram, web chat, and mobile app can feed the same support surface.', icon: 'pi pi-share-alt', tone: 'emerald' }
    ];
  }

  getQueueCount(queue: string): number {
    const convs = this.conversations();
    switch (queue) {
      case 'pending_human': return convs.filter(c => c.status === 'pending_human').length;
      case 'unread': return convs.filter(c => (c.unread_count ?? 0) > 0).length;
      case 'active': return convs.filter(c => c.status === 'active').length;
      default: return convs.length;
    }
  }

  getChannelCount(channel: string): number {
    if (channel === 'all') return this.conversations().length;
    return this.conversations().filter(c => this.getConversationChannel(c) === channel).length;
  }

  getActiveQueueLabel(): string {
    return this.queueTabs.find(t => t.value === this.activeQueue())?.label || 'All';
  }

  getActiveChannelLabel(): string {
    return this.channelFilters.find(f => f.value === this.activeChannel())?.label || 'All';
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'secondary' {
    switch (status) {
      case 'active': return 'success';
      case 'pending_human': return 'warning';
      case 'resolved': return 'info';
      default: return 'secondary';
    }
  }

  getAgentDisplayName(agent: AgentInfo): string {
    const full = [agent.first_name, agent.last_name].filter(Boolean).join(' ').trim();
    return full || agent.email || agent.id;
  }

  getConversationChannel(conversation: TelegramConversation): 'telegram' | 'facebook' | 'web' | 'app' {
    switch ((conversation.platform || '').toLowerCase()) {
      case 'facebook': return 'facebook';
      case 'web': return 'web';
      case 'app': return 'app';
      default: return 'telegram';
    }
  }

  getConversationSourceLabel(conversation: TelegramConversation): string {
    switch (this.getConversationChannel(conversation)) {
      case 'facebook': return 'Facebook Messenger';
      case 'web': return 'Web Chat';
      case 'app': return 'Mobile App';
      default: return 'Telegram Bot';
    }
  }

  getConversationSourceIcon(conversation: TelegramConversation): string {
    switch (this.getConversationChannel(conversation)) {
      case 'facebook': return 'pi pi-facebook';
      case 'web': return 'pi pi-globe';
      case 'app': return 'pi pi-mobile';
      default: return 'pi pi-send';
    }
  }

  isGroupConversation(conversation: TelegramConversation): boolean {
    return Number(conversation.chat_id) < 0;
  }

  getConversationAudienceLabel(conversation: TelegramConversation): string {
    return this.isGroupConversation(conversation) ? 'Group chat' : 'Direct chat';
  }

  getConversationStore(conversation: TelegramConversation): string {
    return conversation.tags?.find(t => t.toLowerCase().includes('store:'))?.split(':')[1]?.trim() || 'Primary support store';
  }

  getConversationProductContext(conversation: TelegramConversation): string {
    return conversation.category ? `${conversation.category} inquiry` : 'General support context';
  }

  // ── Conversation actions ───────────────────────────────────────────────────
  resolveConversation(): void {
    const conv = this.selectedConversation();
    if (!conv?.id || this.resolvingConversation()) return;
    this.resolvingConversation.set(true);
    const newStatus = conv.status === 'resolved' ? 'active' : 'resolved';
    this.chatService.updateTelegramConversationStatus(conv.id, { status: newStatus, note: '' }).subscribe({
      next: (res) => {
        const updated = { ...conv, status: res.data?.status ?? newStatus };
        this.selectedConversation.set(updated);
        this.conversations.update(convs => convs.map(c => c.id === conv.id ? { ...c, status: updated.status } : c));
        this.resolvingConversation.set(false);
        this.messageService.add({ severity: 'success', summary: newStatus === 'resolved' ? 'Resolved' : 'Reopened', detail: `Conversation marked as ${newStatus}` });
      },
      error: () => {
        this.resolvingConversation.set(false);
        this.messageService.add({ severity: 'error', summary: 'Action failed', detail: 'Could not update conversation status' });
      }
    });
  }

  assignConversation(agentId: string, agentName: string): void {
    const conv = this.selectedConversation();
    if (!conv?.id || this.assigningConversation()) return;
    this.assigningConversation.set(true);
    this.assignDropdownVisible = false;
    this.chatService.assignTelegramConversation(conv.id, { agent_id: agentId, agent_name: agentName }).subscribe({
      next: (res) => {
        const updated = { ...conv, agent: res.data?.agent ?? agentName };
        this.selectedConversation.set(updated);
        this.conversations.update(convs => convs.map(c => c.id === conv.id ? { ...c, agent: updated.agent } : c));
        this.assigningConversation.set(false);
        this.messageService.add({ severity: 'success', summary: 'Assigned', detail: `Conversation assigned to ${agentName}` });
      },
      error: () => {
        this.assigningConversation.set(false);
        this.messageService.add({ severity: 'error', summary: 'Assign failed', detail: 'Could not assign conversation' });
      }
    });
  }

  // ── Info panel ─────────────────────────────────────────────────────────────
  openInfoPanel(panel: 'customer' | 'product' | 'context' | 'channel' | 'template'): void {
    this.infoPanel.set(panel);
  }

  toggleInfoPanel(panel: 'customer' | 'product' | 'context' | 'channel' | 'template'): void {
    this.infoPanel.set(panel);
  }

  private _loadNotes(): void {
    const id = this.selectedConversation()?.id;
    if (!id) return;
    // Backend may not return notes on conversation detail; fetch separately if endpoint supports it
  }

  addNote(): void {
    const id = this.selectedConversation()?.id;
    const content = this.draftNote.trim();
    if (!id || !content || this.savingNote()) return;
    this.savingNote.set(true);
    this.chatService.addInternalNote(id, content).subscribe({
      next: (res) => {
        this.notes.update(n => [...n, res.data]);
        this.draftNote = '';
        this.savingNote.set(false);
      },
      error: () => {
        this.savingNote.set(false);
        this.messageService.add({ severity: 'error', summary: 'Note failed', detail: 'Could not save internal note' });
      }
    });
  }

  deleteNote(noteId: string): void {
    const id = this.selectedConversation()?.id;
    if (!id) return;
    this.chatService.deleteInternalNote(id, noteId).pipe(catchError(() => of(null))).subscribe(() => {
      this.notes.update(n => n.filter(note => note.id !== noteId));
    });
  }

  closeInfoPanel(): void { /* panel is always visible */ }

  // ── Dialog helpers ─────────────────────────────────────────────────────────
  openOverviewDialog(): void { this.overviewDialogVisible = true; }
  closeOverviewDialog(): void { this.overviewDialogVisible = false; }
  openFilterDialog(): void { this.filterDialogVisible = true; }
  closeFilterDialog(): void { this.filterDialogVisible = false; }

  // ── Sending ────────────────────────────────────────────────────────────────
  sendReply(): void {
    const conversation = this.selectedConversation();
    const text = this.draftReply.trim();
    if (!conversation || !text) return;
    if (!conversation.chat_id) {
      this.messageService.add({ severity: 'warn', summary: 'Not ready', detail: 'Conversation is missing chat ID — please reload' });
      return;
    }

    const msg: TelegramMessage = {
      id: `local_${Date.now()}`, sender: 'agent',
      sender_name: conversation.agent || this.profile?.first_name || 'Agent',
      content: text, timestamp: new Date().toISOString(),
      message_type: 'text', delivery_status: 'sent'
    };
    this._applyOutboundUpdate(conversation, msg, text);
    this.draftReply = '';
    this.sendingReply = true;

    this.chatService.sendTelegramMessage({ chat_id: conversation.chat_id, text, disable_notification: this.disableNotification }).subscribe({
      next: () => {
        this.sendingReply = false;
        this.messageService.add({ severity: 'success', summary: 'Message sent', detail: 'Reply sent successfully' });
      },
      error: () => {
        this.sendingReply = false;
        this.messageService.add({ severity: 'error', summary: 'Send failed', detail: 'Unable to deliver reply — please retry' });
      }
    });
  }

  sendMedia(): void {
    const conversation = this.selectedConversation();
    const mediaUrl = this.mediaUrl.trim();
    const caption = this.mediaCaption.trim();
    if (!conversation || !conversation.chat_id || !mediaUrl) return;

    const label = this.mediaType === 'photo' ? 'Photo' : this.mediaType === 'gif' ? 'GIF' : 'Document';
    const content = caption || mediaUrl;
    const msg: TelegramMessage = {
      id: `media_${Date.now()}`, sender: 'agent',
      sender_name: conversation.agent || this.profile?.first_name || 'Agent',
      content, timestamp: new Date().toISOString(),
      message_type: this.mediaType === 'gif' ? 'photo' : this.mediaType,
      delivery_status: 'sent', media_url: mediaUrl, caption: caption || undefined
    };
    this._applyOutboundUpdate(conversation, msg, content);
    this.resetMediaForm();
    this.sendingMedia = true;

    const onSuccess = () => {
      this.sendingMedia = false;
      this.messageService.add({ severity: 'success', summary: `${label} sent`, detail: `${label} message sent successfully` });
    };
    const onError = () => {
      this.sendingMedia = false;
      this.messageService.add({ severity: 'error', summary: 'Send failed', detail: `Unable to deliver ${this.mediaType} — please retry` });
    };

    if (this.mediaType === 'photo') {
      this.chatService.sendTelegramPhoto({ chat_id: conversation.chat_id, photo: mediaUrl, caption: caption || undefined, disable_notification: this.disableNotification, protect_content: this.protectMediaContent }).subscribe({ next: onSuccess, error: onError });
    } else {
      this.chatService.sendTelegramDocument({ chat_id: conversation.chat_id, document: mediaUrl, caption: caption || undefined, disable_notification: this.disableNotification, protect_content: this.protectMediaContent }).subscribe({ next: onSuccess, error: onError });
    }
  }

  sendProductCard(): void {
    const conversation = this.selectedConversation();
    if (!conversation || !conversation.chat_id || !this.productName || !this.productImageUrl) return;

    let caption = `🛍️ *${this.productName}*\n`;
    if (this.productPrice) caption += `💰 Price: ${this.productPrice}\n`;
    if (this.productDesc) caption += `\n${this.productDesc}\n`;
    if (this.productLink) caption += `\n🔗 [View Product](${this.productLink})`;

    const imageUrl = this.productImageUrl;
    const msg: TelegramMessage = {
      id: `product_${Date.now()}`, sender: 'agent',
      sender_name: conversation.agent || this.profile?.first_name || 'Agent',
      content: caption, timestamp: new Date().toISOString(),
      message_type: 'photo', delivery_status: 'sent',
      media_url: imageUrl, caption
    };
    this._applyOutboundUpdate(conversation, msg, caption);
    this._resetProductForm();
    this.closeActionPopup();
    this.sendingProduct = true;

    this.chatService.sendTelegramPhoto({ chat_id: conversation.chat_id, photo: imageUrl, caption, disable_notification: this.disableNotification, protect_content: this.protectMediaContent }).subscribe({
      next: () => {
        this.sendingProduct = false;
        this.messageService.add({ severity: 'success', summary: 'Product sent', detail: 'Product card sent successfully' });
      },
      error: () => {
        this.sendingProduct = false;
        this.messageService.add({ severity: 'error', summary: 'Send failed', detail: 'Unable to deliver product card — please retry' });
      }
    });
  }

  sendIcon(): void {
    const conversation = this.selectedConversation();
    const icon = this.selectedIcon.trim();
    if (!conversation || !conversation.chat_id || !icon) return;

    const msg: TelegramMessage = {
      id: `icon_${Date.now()}`, sender: 'agent',
      sender_name: conversation.agent || this.profile?.first_name || 'Agent',
      content: icon, timestamp: new Date().toISOString(),
      message_type: 'text', delivery_status: 'sent'
    };
    this._applyOutboundUpdate(conversation, msg, icon);
    this.closeActionPopup();
    this.sendingIcon = true;

    this.chatService.sendTelegramMessage({ chat_id: conversation.chat_id, text: icon, disable_notification: this.disableNotification }).subscribe({
      next: () => {
        this.sendingIcon = false;
        this.messageService.add({ severity: 'success', summary: 'Icon sent', detail: 'Quick icon reply sent successfully' });
      },
      error: () => {
        this.sendingIcon = false;
        this.messageService.add({ severity: 'error', summary: 'Send failed', detail: 'Unable to deliver icon reply — please retry' });
      }
    });
  }

  // ── Quick replies ──────────────────────────────────────────────────────────
  useQuickReply(reply: QuickReply): void {
    this.draftReply = reply.content;
    this.quickReplyPickerVisible = false;
    this.quickReplyFilter = '';
  }

  // ── Product from panel (messageSent output) ────────────────────────────────
  handleMessageSent(message: TelegramMessage): void {
    const conv = this.selectedConversation();
    if (!conv) return;
    this._applyOutboundUpdate(conv, message, message.content);
  }

  // ── Customer linked (customerLinked output) ────────────────────────────────
  handleCustomerLinked(customer: CustomerSummary | null): void {
    const conv = this.selectedConversation();
    if (!conv) return;
    this.selectedConversation.set({ ...conv, customer_id: customer?.id ?? null });
    this.linkedCustomer.set(customer);
  }

  // ── Labels ─────────────────────────────────────────────────────────────────
  loadLabels(): void {
    this.chatService.getLabels().pipe(catchError(() => of(null))).subscribe(res => {
      this.labels.set(res?.data ?? []);
    });
  }

  addLabelToConversation(labelId: string): void {
    const conv = this.selectedConversation();
    if (!conv?.id) return;
    this.labelPickerOpen = false;
    const current = conv.tags || [];
    if (current.includes(labelId)) return;
    const next = [...current, labelId];
    this.chatService.patchConversationLabels(conv.id, next).pipe(catchError(() => of(null))).subscribe(() => {
      this.selectedConversation.set({ ...conv, tags: next });
    });
  }

  removeLabelFromConversation(labelId: string): void {
    const conv = this.selectedConversation();
    if (!conv?.id) return;
    const next = (conv.tags || []).filter(t => t !== labelId);
    this.chatService.patchConversationLabels(conv.id, next).pipe(catchError(() => of(null))).subscribe(() => {
      this.selectedConversation.set({ ...conv, tags: next });
    });
  }

  // ── Priority / Category ────────────────────────────────────────────────────
  savePriority(value: string): void {
    const conv = this.selectedConversation();
    if (!conv?.id) return;
    this.chatService.updateConversationMeta(conv.id, { priority: value }).pipe(catchError(() => of(null))).subscribe(() => {
      this.selectedConversation.set({ ...conv, priority: value });
      this.conversations.update(cs => cs.map(c => c.id === conv.id ? { ...c, priority: value } : c));
    });
  }

  saveCategory(value: string): void {
    const conv = this.selectedConversation();
    if (!conv?.id) return;
    this.chatService.updateConversationMeta(conv.id, { category: value }).pipe(catchError(() => of(null))).subscribe(() => {
      this.selectedConversation.set({ ...conv, category: value });
    });
  }

  // ── Bot toggle ─────────────────────────────────────────────────────────────
  toggleBotEnabled(): void {
    const conv = this.selectedConversation();
    if (!conv?.id || this.updatingBotStatus()) return;
    this.updatingBotStatus.set(true);
    const next = !conv.is_bot_enabled;
    this.chatService.updateConversationMeta(conv.id, { is_bot_enabled: next }).subscribe({
      next: () => {
        this.selectedConversation.set({ ...conv, is_bot_enabled: next });
        this.conversations.update(cs => cs.map(c => c.id === conv.id ? { ...c, is_bot_enabled: next } : c));
        this.updatingBotStatus.set(false);
      },
      error: () => {
        this.updatingBotStatus.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not toggle bot status' });
      }
    });
  }

  // ── Agent presence ─────────────────────────────────────────────────────────
  setMyPresence(status: 'online' | 'busy' | 'away'): void {
    this.myPresence.set(status);
    this.presenceDropdownOpen = false;
    localStorage.setItem('cmc_presence', status);
    this.chatService.setAgentPresence(status).pipe(catchError(() => of(null))).subscribe();
  }

  private _restorePresence(): void {
    const saved = localStorage.getItem('cmc_presence') as 'online' | 'busy' | 'away' | null;
    if (saved) {
      this.myPresence.set(saved);
      this.chatService.setAgentPresence(saved).pipe(catchError(() => of(null))).subscribe();
    }
  }

  // ── Auto-refresh polling ───────────────────────────────────────────────────
  startPolling(): void {
    this.refreshMessagesInterval = setInterval(() => this._refreshMessages(), 30000);
    this.refreshConversationsInterval = setInterval(() => this._refreshConversations(), 60000);
  }

  stopPolling(): void {
    if (this.refreshMessagesInterval) clearInterval(this.refreshMessagesInterval);
    if (this.refreshConversationsInterval) clearInterval(this.refreshConversationsInterval);
  }

  private _refreshMessages(): void {
    const conv = this.selectedConversation();
    if (!conv?.id) return;
    this.chatService.getTelegramConversationDetail(conv.id, 0, this.MESSAGE_PAGE_SIZE).pipe(catchError(() => of(null))).subscribe(res => {
      if (!res?.data) return;
      const fresh = res.data;
      const currentIds = new Set((conv.messages || []).map(m => m.id));
      const newMsgs = (fresh.messages || []).filter(m => !currentIds.has(m.id));
      if (newMsgs.length > 0) {
        this.selectedConversation.set({ ...conv, messages: [...(conv.messages || []), ...newMsgs], last_message: fresh.last_message, last_message_time: fresh.last_message_time });
        setTimeout(() => this.messageThreadRef?.scrollToBottom());
      }
      this.lastRefreshed = new Date();
    });
  }

  private _refreshConversations(): void {
    this.chatService.getTelegramConversations(0, 20).pipe(catchError(() => of(null))).subscribe(res => {
      if (!res?.data) return;
      const fresh = res.data;
      this.conversations.update(existing => {
        const existingMap = new Map(existing.map(c => [c.id, c]));
        fresh.forEach(c => existingMap.set(c.id, c));
        return Array.from(existingMap.values());
      });
      this.lastRefreshed = new Date();
    });
  }

  // ── Quick actions ──────────────────────────────────────────────────────────
  activateQuickAction(mode: string): void {
    if (mode === 'text') { this.closeActionPopup(); return; }
    if (mode === 'template') { this.infoPanel.set('template'); return; }
    if (mode === 'photo' || mode === 'gif' || mode === 'document') { this.mediaType = mode as any; this.actionPopupMode = mode as any; return; }
    if (mode === 'icon') { this.actionPopupMode = 'icon'; return; }
    if (mode === 'product') { this.openInfoPanel('product'); return; }
  }

  closeActionPopup(): void {
    this.actionPopupMode = 'none';
    this._resetProductForm();
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  private _applyOutboundUpdate(conversation: TelegramConversation, message: TelegramMessage, content: string): void {
    const updated: TelegramConversation = {
      ...conversation,
      last_message: content, last_message_time: message.timestamp,
      updated_at: message.timestamp, unread_count: 0,
      message_count: (conversation.message_count ?? 0) + 1,
      messages: [...(conversation.messages || []), message]
    };
    this.selectedConversation.set(updated);
    this.conversations.update(convs => convs.map(c => c.id === updated.id ? updated : c));
    setTimeout(() => this.messageThreadRef?.scrollToBottom());
  }

  private resetMediaForm(): void {
    this.mediaType = 'photo';
    this.mediaUrl = '';
    this.mediaCaption = '';
    this.protectMediaContent = false;
    this.selectedIcon = '👍';
  }

  private _resetProductForm(): void {
    this.productName = '';
    this.productPrice = '';
    this.productDesc = '';
    this.productLink = '';
    this.productImageUrl = '';
  }

  private _renderTemplatePreview(content: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
      (msg, [key, val]) => msg.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), val),
      content
    );
  }

  private _matchesQueue(conv: TelegramConversation, queue: string): boolean {
    switch (queue) {
      case 'pending_human': return conv.status === 'pending_human';
      case 'unread': return (conv.unread_count ?? 0) > 0;
      case 'active': return conv.status === 'active';
      default: return true;
    }
  }

  private _resetAndReloadConversations(): void {
    this.conversations.set([]);
    this.conversationSkip.set(0);
    this.hasMoreConversations.set(true);
    this.selectedConversation.set(null);
    this.loadMoreConversations();
  }

  private _syncSelectedConversation(): void {
    const currentId = this.selectedConversation()?.id;
    if (!currentId || !this.filteredConversations().some(c => c.id === currentId)) {
      const nextId = this.filteredConversations()[0]?.id;
      if (nextId) { this.selectConversation(nextId); }
      else { this.selectedConversation.set(null); }
    }
  }
}
