import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextarea } from 'primeng/inputtextarea';
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
  TelegramSettings
} from '../../models/chat.model';

@Component({
  selector: 'app-chat-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    InputTextarea,
    InputTextModule,
    SkeletonModule,
    TagModule,
    ToastModule
  ],
  templateUrl: './chat-dashboard.component.html',
  styleUrl: './chat-dashboard.component.scss',
  providers: [MessageService]
})
export class ChatDashboardComponent implements OnInit {
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);

  loading = false;
  assigning = false;
  updatingStatus = false;
  sendingReply = false;
  sendingTemplate = false;
  templateDialogVisible = false;

  profile: TelegramBotProfile | null = null;
  dashboard: TelegramDashboard | null = null;
  settings: TelegramSettings | null = null;
  conversations: TelegramConversation[] = [];
  selectedConversation: TelegramConversation | null = null;
  templates = [] as { label: string; value: string; template: any }[];
  selectedTemplateId = '';
  templateVariableValues: Record<string, string> = {};

  selectedAgentId = 'agent_001';
  selectedStatus = 'active';
  internalNote = '';
  replyText = '';
  disableNotification = false;
  activeQueue = 'all';
  searchTerm = '';

  readonly agentOptions = [
    { label: 'Sarah Wilson', value: 'agent_001', name: 'Sarah Wilson' },
    { label: 'Minh Tran', value: 'agent_002', name: 'Minh Tran' },
    { label: 'Linh Hoang', value: 'agent_003', name: 'Linh Hoang' }
  ];

  readonly statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Pending Human', value: 'pending_human' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Closed', value: 'closed' }
  ];

  readonly queueTabs = [
    { label: 'Pending Human', value: 'pending_human' },
    { label: 'Unread', value: 'unread' },
    { label: 'Active', value: 'active' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'All', value: 'all' }
  ];

  ngOnInit(): void {
    this.loadTelegramWorkspace();
  }

  loadTelegramWorkspace(): void {
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

        if (this.filteredConversations.length > 0) {
          const selectedId = this.filteredConversations[0]?.id;
          if (selectedId) {
            this.selectConversation(selectedId);
          }
        } else {
          this.selectedConversation = null;
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading Telegram workspace', error);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Load failed', detail: 'Unable to load Telegram workspace' });
      }
    });
  }

  selectConversation(id: string | null | undefined): void {
    if (!id) {
      this.selectedConversation = null;
      this.messageService.add({ severity: 'warn', summary: 'Missing conversation id', detail: 'Conversation detail could not be loaded because the record has no id.' });
      return;
    }

    this.chatService.getTelegramConversationDetail(id).subscribe({
      next: (response) => {
        this.selectedConversation = response.data;
        this.selectedStatus = response.data.status || 'active';
        this.selectedAgentId = response.data.agent_id || this.selectedAgentId;
        this.replyText = '';
        this.disableNotification = false;
        this.templateDialogVisible = false;
        this.resetTemplateForm();
      },
      error: (error) => {
        console.error('Error loading Telegram conversation detail', error);
        this.messageService.add({ severity: 'error', summary: 'Detail failed', detail: 'Unable to load conversation detail' });
      }
    });
  }

  assignConversation(): void {
    if (!this.selectedConversation) return;
    const agent = this.agentOptions.find(item => item.value === this.selectedAgentId);
    if (!agent) return;

    this.assigning = true;
    this.chatService.assignTelegramConversation(this.selectedConversation.id, {
      agent_id: agent.value,
      agent_name: agent.name
    }).subscribe({
      next: (response) => {
        this.assigning = false;
        this.selectedConversation = response.data;
        this.patchConversation(response.data);
        this.messageService.add({ severity: 'success', summary: 'Assigned', detail: `Conversation assigned to ${agent.name}` });
      },
      error: (error) => {
        console.error('Error assigning Telegram conversation', error);
        this.assigning = false;
        this.messageService.add({ severity: 'error', summary: 'Assign failed', detail: 'Unable to assign conversation' });
      }
    });
  }

  updateConversationStatus(): void {
    if (!this.selectedConversation) return;

    this.updatingStatus = true;
    this.chatService.updateTelegramConversationStatus(this.selectedConversation.id, {
      status: this.selectedStatus,
      note: this.internalNote
    }).subscribe({
      next: (response) => {
        this.updatingStatus = false;
        this.selectedConversation = response.data;
        this.patchConversation(response.data);
        this.internalNote = '';
        this.messageService.add({ severity: 'success', summary: 'Status updated', detail: `Conversation moved to ${this.selectedStatus}` });
      },
      error: (error) => {
        console.error('Error updating Telegram status', error);
        this.updatingStatus = false;
        this.messageService.add({ severity: 'error', summary: 'Update failed', detail: 'Unable to update conversation status' });
      }
    });
  }

  sendReply(): void {
    const conversation = this.selectedConversation;
    const text = this.replyText.trim();

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
          sender_name: this.getSelectedAgentName(),
          content: text,
          timestamp: new Date().toISOString(),
          message_type: 'text',
          delivery_status: 'sent'
        };

        const updatedConversation: TelegramConversation = {
          ...conversation,
          last_message: text,
          last_message_time: outboundMessage.timestamp,
          updated_at: outboundMessage.timestamp,
          unread_count: 0,
          message_count: (conversation.message_count ?? 0) + 1,
          messages: [...(conversation.messages || []), outboundMessage]
        };

        this.selectedConversation = updatedConversation;
        this.patchConversation(updatedConversation);
        this.replyText = '';
        this.sendingReply = false;
        this.messageService.add({ severity: 'success', summary: 'Message sent', detail: 'Telegram reply sent successfully' });
      },
      error: (error) => {
        console.error('Error sending Telegram reply', error);
        this.sendingReply = false;
        this.messageService.add({ severity: 'error', summary: 'Send failed', detail: 'Unable to send Telegram reply' });
      }
    });
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
        const renderedContent = this.renderTemplatePreview(template.content, variables);
        const outboundMessage: TelegramMessage = {
          id: `tpl_${Date.now()}`,
          sender: 'agent',
          sender_name: this.getSelectedAgentName(),
          content: renderedContent,
          timestamp: new Date().toISOString(),
          message_type: 'template',
          delivery_status: 'sent'
        };

        const updatedConversation: TelegramConversation = {
          ...conversation,
          last_message: renderedContent,
          last_message_time: outboundMessage.timestamp,
          updated_at: outboundMessage.timestamp,
          unread_count: 0,
          message_count: (conversation.message_count ?? 0) + 1,
          messages: [...(conversation.messages || []), outboundMessage]
        };

        this.selectedConversation = updatedConversation;
        this.patchConversation(updatedConversation);
        this.resetTemplateForm();
        this.templateDialogVisible = false;
        this.sendingTemplate = false;
        this.messageService.add({ severity: 'success', summary: 'Template sent', detail: `${template.name} was sent successfully` });
      },
      error: (error) => {
        console.error('Error sending Telegram template', error);
        this.sendingTemplate = false;
        this.messageService.add({ severity: 'error', summary: 'Template failed', detail: 'Unable to send Telegram template' });
      }
    });
  }

  get overviewCards() {
    return [
      {
        label: 'Open conversations',
        value: this.dashboard?.counters.total_conversations ?? 0,
        caption: `${this.dashboard?.counters.unread_messages ?? 0} unread messages waiting in the queue.`,
        icon: 'pi pi-comments',
        tone: 'blue'
      },
      {
        label: 'Human handoff',
        value: this.dashboard?.counters.pending_human ?? 0,
        caption: this.dashboard?.bot.human_handoff ? 'Escalation to agents is enabled.' : 'Escalation to agents is currently disabled.',
        icon: 'pi pi-user-plus',
        tone: 'orange'
      },
      {
        label: 'Unread queue',
        value: this.dashboard?.counters.unread_messages ?? 0,
        caption: 'Unread Telegram messages waiting for a response.',
        icon: 'pi pi-inbox',
        tone: 'purple'
      },
      {
        label: 'Bot status',
        value: this.settings?.bot_enabled ? 'Enabled' : 'Disabled',
        caption: `${this.profile?.first_name || 'Telegram bot'} is connected for support chat.`,
        icon: 'pi pi-telegram',
        tone: 'emerald'
      }
    ];
  }

  get filteredConversations(): TelegramConversation[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.conversations.filter((conversation) => {
      const matchesQueue = this.matchesQueue(conversation);
      if (!matchesQueue) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        conversation.user_name,
        conversation.username,
        conversation.last_message,
        conversation.category,
        conversation.agent,
        ...(conversation.tags || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }

  setActiveQueue(queue: string): void {
    this.activeQueue = queue;

    const currentStillVisible = this.selectedConversation?.id
      ? this.filteredConversations.some(item => item.id === this.selectedConversation?.id)
      : false;

    if (!currentStillVisible) {
      const nextId = this.filteredConversations[0]?.id;
      if (nextId) {
        this.selectConversation(nextId);
      } else {
        this.selectedConversation = null;
      }
    }
  }

  getQueueCount(queue: string): number {
    switch (queue) {
      case 'pending_human':
        return this.conversations.filter(item => item.status === 'pending_human').length;
      case 'unread':
        return this.conversations.filter(item => (item.unread_count ?? 0) > 0).length;
      case 'active':
        return this.conversations.filter(item => item.status === 'active').length;
      case 'resolved':
        return this.conversations.filter(item => item.status === 'resolved').length;
      default:
        return this.conversations.length;
    }
  }

  get selectedConversationMeta(): string {
    if (!this.selectedConversation) {
      return 'No conversation selected';
    }

    return this.selectedConversation.agent
      ? `Assigned to ${this.selectedConversation.agent}`
      : 'Unassigned conversation';
  }

  getSelectedAgentName(): string {
    return this.agentOptions.find(item => item.value === this.selectedAgentId)?.name || 'Unassigned';
  }

  getSelectedTemplate() {
    return this.templates.find(item => item.value === this.selectedTemplateId)?.template || null;
  }

  get selectedTemplatePreview(): string {
    const template = this.getSelectedTemplate();
    if (!template) {
      return '';
    }

    const variables = Object.fromEntries(
      (template.variables || []).map((variable: string) => [variable, this.templateVariableValues[variable] || `{{${variable}}}`])
    );

    return this.renderTemplatePreview(template.content, variables);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending_human':
        return 'warning';
      case 'resolved':
        return 'info';
      case 'closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getPrioritySeverity(priority: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'success';
    }
  }

  canOpenConversation(conversation: TelegramConversation): boolean {
    return !!conversation?.id;
  }

  private patchConversation(updated: TelegramConversation): void {
    if (!updated?.id) {
      return;
    }
    this.conversations = this.conversations.map(item => item.id === updated.id ? updated : item);
  }

  private matchesQueue(conversation: TelegramConversation): boolean {
    switch (this.activeQueue) {
      case 'pending_human':
        return conversation.status === 'pending_human';
      case 'unread':
        return (conversation.unread_count ?? 0) > 0;
      case 'active':
        return conversation.status === 'active';
      case 'resolved':
        return conversation.status === 'resolved';
      default:
        return true;
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
