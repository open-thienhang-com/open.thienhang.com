import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ChatService } from '../../services/chat.service';
import {
  TelegramBotProfile,
  TelegramConversation,
  TelegramDashboard,
  TelegramMessage,
  TelegramSettings,
  TelegramTemplate
} from '../../models/chat.model';

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
    ToastModule
  ],
  templateUrl: './facebook-workspace.component.html',
  styleUrl: './facebook-workspace.component.scss',
  providers: [MessageService]
})
export class FacebookWorkspaceComponent implements OnInit {
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);

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
    { label: 'Product Card', icon: 'pi pi-box' },
    { label: 'Pickup QR', icon: 'pi pi-qrcode' },
    { label: 'Transfer', icon: 'pi pi-share-alt' }
  ];

  loading = false;
  sendingReply = false;
  sendingTemplate = false;
  templateDialogVisible = false;

  profile: TelegramBotProfile | null = null;
  dashboard: TelegramDashboard | null = null;
  settings: TelegramSettings | null = null;
  conversations: TelegramConversation[] = [];
  selectedConversation: TelegramConversation | null = null;
  templates = [] as { label: string; value: string; template: TelegramTemplate }[];

  searchTerm = '';
  activeQueue = 'all';
  activeChannel = 'all';
  infoPanel: 'none' | 'customer' | 'context' | 'channel' = 'none';
  draftReply = '';
  disableNotification = false;
  selectedTemplateId = '';
  templateVariableValues: Record<string, string> = {};

  readonly journeySteps = [
    { label: 'Shared history', value: 'Cross-channel continuity', detail: 'The same thread remains visible when the customer moves between web, app, and social entry points.' },
    { label: 'Product context', value: 'Attached automatically', detail: 'Product, category, and support intent can ride with the conversation instead of being repeated by the customer.' },
    { label: 'BOPIS prompt', value: 'Store inventory CTA', detail: 'Store-level pickup and stock checks stay available inside the conversation workflow.' }
  ];

  ngOnInit(): void {
    this.loadWorkspace();
  }

  loadWorkspace(): void {
    this.loading = true;

    forkJoin({
      profile: this.chatService.getTelegramProfile(),
      dashboard: this.chatService.getTelegramDashboard(),
      conversations: this.chatService.getTelegramConversations(0, 20),
      settings: this.chatService.getTelegramSettings(),
      templates: this.chatService.getTelegramSendTemplates()
    }).subscribe({
      next: ({ profile, dashboard, conversations, settings, templates }) => {
        this.profile = profile.data;
        this.dashboard = dashboard.data;
        this.settings = settings.data;
        this.conversations = conversations.data || [];
        this.templates = (templates.data || [])
          .filter(item => item.enabled)
          .map(item => ({
            label: item.name,
            value: item.template_id || item.id,
            template: item
          }));

        if (!this.getQueueCount(this.activeQueue) && this.conversations.length) {
          this.activeQueue = this.getQueueCount('pending_human') > 0 ? 'pending_human' : 'all';
        }

        const nextConversation = this.filteredConversations[0] || this.conversations[0] || null;
        if (nextConversation?.id) {
          this.selectConversation(nextConversation.id);
        } else {
          this.selectedConversation = null;
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading omnichannel workspace', error);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Load failed', detail: 'Unable to load workspace data' });
      }
    });
  }

  get overviewCards() {
    return [
      { label: 'Open queue', value: this.filteredConversations.length, caption: 'Threads currently visible in the unified inbox.', icon: 'pi pi-comments', tone: 'blue' },
      { label: 'Pending human', value: this.dashboard?.counters.pending_human ?? 0, caption: 'Conversations waiting for agent pickup.', icon: 'pi pi-user-plus', tone: 'orange' },
      { label: 'Unread', value: this.dashboard?.counters.unread_messages ?? 0, caption: 'Unread requests across every connected channel.', icon: 'pi pi-inbox', tone: 'purple' },
      { label: 'Connected channels', value: '4', caption: 'Facebook, Telegram, web chat, and mobile app can feed the same support surface.', icon: 'pi pi-share-alt', tone: 'emerald' }
    ];
  }

  get filteredConversations(): TelegramConversation[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.conversations.filter((conversation) => {
      const matchesQueue = this.matchesQueue(conversation);
      const matchesChannel = this.activeChannel === 'all' || this.getConversationChannel(conversation) === this.activeChannel;

      if (!matchesQueue || !matchesChannel) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        conversation.user_name,
        conversation.username,
        conversation.last_message,
        conversation.agent,
        conversation.category,
        ...conversation.tags || []
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }

  setActiveQueue(queue: string): void {
    this.activeQueue = queue;
    this.syncSelectedConversation();
  }

  setActiveChannel(channel: string): void {
    this.activeChannel = channel;
    this.syncSelectedConversation();
  }

  selectConversation(id: string | null | undefined): void {
    if (!id) {
      this.selectedConversation = null;
      this.loading = false;
      return;
    }

    this.chatService.getTelegramConversationDetail(id).subscribe({
      next: (response) => {
        this.selectedConversation = response.data;
        this.loading = false;
        this.draftReply = '';
        this.disableNotification = false;
        this.closeTemplateDialog();
      },
      error: (error) => {
        console.error('Error loading conversation detail', error);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Detail failed', detail: 'Unable to load conversation detail' });
      }
    });
  }

  openInfoPanel(panel: 'customer' | 'context' | 'channel'): void {
    this.infoPanel = panel;
  }

  closeInfoPanel(): void {
    this.infoPanel = 'none';
  }

  openTemplateDialog(): void {
    if (!this.selectedConversation) {
      return;
    }

    this.templateDialogVisible = true;
    if (this.selectedTemplateId) {
      this.onTemplateChange(this.selectedTemplateId);
    }
  }

  closeTemplateDialog(): void {
    this.templateDialogVisible = false;
  }

  onTemplateChange(templateId: string): void {
    this.selectedTemplateId = templateId;
    const template = this.getSelectedTemplate();
    const nextValues: Record<string, string> = {};
    const firstName = this.selectedConversation?.user_name?.trim().split(/\s+/)[0] || '';

    for (const variable of template?.variables || []) {
      if (variable === 'first_name' && !this.templateVariableValues[variable] && firstName) {
        nextValues[variable] = firstName;
      } else {
        nextValues[variable] = this.templateVariableValues[variable] || '';
      }
    }

    this.templateVariableValues = nextValues;
  }

  sendReply(): void {
    const conversation = this.selectedConversation;
    const text = this.draftReply.trim();

    if (!conversation || !conversation.chat_id || !text) {
      return;
    }

    this.sendingReply = true;
    this.chatService.sendTelegramMessage({
      chat_id: conversation.chat_id,
      text,
      disable_notification: this.disableNotification
    }).subscribe({
      next: () => {
        const outboundMessage: TelegramMessage = {
          id: `local_${Date.now()}`,
          sender: 'agent',
          sender_name: conversation.agent || this.profile?.first_name || 'Agent',
          content: text,
          timestamp: new Date().toISOString(),
          message_type: 'text',
          delivery_status: 'sent'
        };

        this.applyOutboundUpdate(conversation, outboundMessage, text);
        this.draftReply = '';
        this.sendingReply = false;
        this.messageService.add({ severity: 'success', summary: 'Message sent', detail: 'Reply sent successfully' });
      },
      error: (error) => {
        console.error('Error sending reply', error);
        this.sendingReply = false;
        this.messageService.add({ severity: 'error', summary: 'Send failed', detail: 'Unable to send reply' });
      }
    });
  }

  sendTemplate(): void {
    const conversation = this.selectedConversation;
    const template = this.getSelectedTemplate();

    if (!conversation || !conversation.chat_id || !template || !this.selectedTemplateId) {
      return;
    }

    const variables = Object.fromEntries(
      (template.variables || []).map(variable => [variable, (this.templateVariableValues[variable] || '').trim()])
    );

    const missingVariable = Object.entries(variables).find(([, value]) => !value);
    if (missingVariable) {
      this.messageService.add({ severity: 'warn', summary: 'Missing variable', detail: `Please provide a value for ${missingVariable[0]}` });
      return;
    }

    this.sendingTemplate = true;
    this.chatService.sendTelegramTemplate({
      chat_id: conversation.chat_id,
      template_id: this.selectedTemplateId,
      variables,
      disable_notification: this.disableNotification
    }).subscribe({
      next: () => {
        const content = this.renderTemplatePreview(template.content, variables);
        const outboundMessage: TelegramMessage = {
          id: `tpl_${Date.now()}`,
          sender: 'agent',
          sender_name: conversation.agent || this.profile?.first_name || 'Agent',
          content,
          timestamp: new Date().toISOString(),
          message_type: 'template',
          delivery_status: 'sent'
        };

        this.applyOutboundUpdate(conversation, outboundMessage, content);
        this.closeTemplateDialog();
        this.resetTemplateForm();
        this.sendingTemplate = false;
        this.messageService.add({ severity: 'success', summary: 'Template sent', detail: `${template.name} was sent successfully` });
      },
      error: (error) => {
        console.error('Error sending template', error);
        this.sendingTemplate = false;
        this.messageService.add({ severity: 'error', summary: 'Template failed', detail: 'Unable to send Telegram template' });
      }
    });
  }

  getQueueCount(queue: string): number {
    switch (queue) {
      case 'pending_human':
        return this.conversations.filter(item => item.status === 'pending_human').length;
      case 'unread':
        return this.conversations.filter(item => (item.unread_count ?? 0) > 0).length;
      case 'active':
        return this.conversations.filter(item => item.status === 'active').length;
      default:
        return this.conversations.length;
    }
  }

  getChannelCount(channel: string): number {
    if (channel === 'all') {
      return this.conversations.length;
    }

    return this.conversations.filter(item => this.getConversationChannel(item) === channel).length;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'secondary' {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending_human':
        return 'warning';
      case 'resolved':
        return 'info';
      default:
        return 'secondary';
    }
  }

  getConversationChannel(conversation: TelegramConversation): 'telegram' | 'facebook' | 'web' | 'app' {
    switch ((conversation.platform || '').toLowerCase()) {
      case 'facebook':
        return 'facebook';
      case 'web':
        return 'web';
      case 'app':
        return 'app';
      default:
        return 'telegram';
    }
  }

  getConversationSourceLabel(conversation: TelegramConversation): string {
    switch (this.getConversationChannel(conversation)) {
      case 'facebook':
        return 'Facebook Messenger';
      case 'web':
        return 'Web Chat';
      case 'app':
        return 'Mobile App';
      default:
        return 'Telegram Bot';
    }
  }

  getConversationSourceIcon(conversation: TelegramConversation): string {
    switch (this.getConversationChannel(conversation)) {
      case 'facebook':
        return 'pi pi-facebook';
      case 'web':
        return 'pi pi-globe';
      case 'app':
        return 'pi pi-mobile';
      default:
        return 'pi pi-send';
    }
  }

  getConversationStore(conversation: TelegramConversation): string {
    return conversation.tags?.find(tag => tag.toLowerCase().includes('store:'))?.split(':')[1]?.trim()
      || 'Primary support store';
  }

  getConversationProductContext(conversation: TelegramConversation): string {
    return conversation.category
      ? `${conversation.category} inquiry`
      : 'General support context';
  }

  get selectedTemplatePreview(): string {
    const template = this.getSelectedTemplate();
    if (!template) {
      return '';
    }

    const variables = Object.fromEntries(
      (template.variables || []).map(variable => [variable, this.templateVariableValues[variable] || `{{${variable}}}`])
    );

    return this.renderTemplatePreview(template.content, variables);
  }

  getSelectedTemplate(): TelegramTemplate | null {
    return this.templates.find(item => item.value === this.selectedTemplateId)?.template || null;
  }

  private applyOutboundUpdate(conversation: TelegramConversation, message: TelegramMessage, content: string): void {
    const updatedConversation: TelegramConversation = {
      ...conversation,
      last_message: content,
      last_message_time: message.timestamp,
      updated_at: message.timestamp,
      unread_count: 0,
      message_count: (conversation.message_count ?? 0) + 1,
      messages: [...(conversation.messages || []), message]
    };

    this.selectedConversation = updatedConversation;
    this.conversations = this.conversations.map(item => item.id === updatedConversation.id ? updatedConversation : item);
  }

  private matchesQueue(conversation: TelegramConversation): boolean {
    switch (this.activeQueue) {
      case 'pending_human':
        return conversation.status === 'pending_human';
      case 'unread':
        return (conversation.unread_count ?? 0) > 0;
      case 'active':
        return conversation.status === 'active';
      default:
        return true;
    }
  }

  private syncSelectedConversation(): void {
    const currentId = this.selectedConversation?.id;
    if (!currentId || !this.filteredConversations.some(item => item.id === currentId)) {
      const nextId = this.filteredConversations[0]?.id;
      if (nextId) {
        this.selectConversation(nextId);
      } else {
        this.selectedConversation = null;
      }
    }
  }

  private resetTemplateForm(): void {
    this.selectedTemplateId = '';
    this.templateVariableValues = {};
  }

  private renderTemplatePreview(content: string, variables: Record<string, string>): string {
    return Object.entries(variables).reduce(
      (message, [key, value]) => message.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value),
      content
    );
  }
}
