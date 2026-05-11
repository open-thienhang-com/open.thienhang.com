import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Agent, ChatAnalytics, Conversation as ApiConversation, Message as ApiMessage } from '../../../chat/models/chat.model';
import { ChatService } from '../../../chat/services/chat.service';
import { Product } from '../../../inventory/models/inventory.models';
import { InventoryService as OrderService, ProductService } from '../../../inventory/services/inventory.service';

type ChannelKey = string;

interface ChannelFilter {
  key: ChannelKey;
  label: string;
  icon: string;
}

interface UiMessage {
  from: 'customer' | 'agent' | 'system';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface UiConversation {
  id: string;
  channelKey: string;
  channelLabel: string;
  channelIcon: string;
  channelColor: string;
  customer: string;
  userId: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  waitingMinutes: number;
  orderValue: number;
  tags: string[];
  messages: UiMessage[];
  status: string;
  agent: string;
  category: string;
  sentiment: string;
  responseTime: string;
  resolutionTime: string | null;
  messageCount: number;
  conversationDuration?: string;
  firstResponseTime?: string;
  customerSatisfaction?: number | null;
  escalated?: boolean;
}

interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
}

interface OrderDraftItem {
  product: CatalogProduct;
  quantity: number;
}

@Component({
  selector: 'app-omnichannel',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TagModule],
  templateUrl: './omnichannel.component.html',
  styleUrl: './omnichannel.component.scss'
})
export class OmnichannelComponent implements OnInit {
  searchTerm = '';
  draftMessage = '';
  selectedChannel: ChannelKey = 'all';
  selectedConversationId = '';

  apiPlatforms: string[] = [];
  agents: Agent[] = [];
  catalogProducts: CatalogProduct[] = [];
  selectedProductId = '';
  selectedProductQty = 1;
  orderItems: OrderDraftItem[] = [];
  creatingOrder = false;
  actionMessage = '';
  actionMessageSeverity: 'success' | 'error' | 'info' = 'info';
  loadingConversations = false;

  chatStats = {
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    onlineAgents: 0,
    averageResponseTime: '-'
  };

  channelFilters: ChannelFilter[] = [{ key: 'all', label: 'All', icon: 'pi pi-comments' }];
  conversations: UiConversation[] = [];

  constructor(
    private chatService: ChatService,
    private productService: ProductService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadChatPlatformsAndStats();
    this.loadAnalytics();
    this.loadAgents();
    this.loadProducts();
    this.loadConversations();
  }

  get filteredConversations(): UiConversation[] {
    const keyword = this.searchTerm.trim().toLowerCase();
    return this.conversations.filter((item) => {
      const matchesChannel = this.selectedChannel === 'all' || item.channelKey === this.selectedChannel;
      const matchesKeyword = !keyword
        || item.customer.toLowerCase().includes(keyword)
        || item.lastMessage.toLowerCase().includes(keyword);
      return matchesChannel && matchesKeyword;
    });
  }

  get activeConversation(): UiConversation | null {
    return this.conversations.find((item) => item.id === this.selectedConversationId) || null;
  }

  get totalUnread(): number {
    return this.conversations.reduce((sum, c) => sum + c.unread, 0);
  }

  get waitingSlaRiskCount(): number {
    return this.conversations.filter((c) => c.waitingMinutes >= 15).length;
  }

  selectChannel(key: ChannelKey): void {
    if (this.selectedChannel === key) {
      return;
    }
    this.selectedChannel = key;
    this.loadConversations();
  }

  selectConversation(id: string): void {
    this.selectedConversationId = id;
    const found = this.conversations.find((x) => x.id === id);
    if (found) {
      found.unread = 0;
    }
    this.loadConversationDetail(id);
  }

  sendMessage(): void {
    const text = this.draftMessage.trim();
    if (!text || !this.activeConversation) return;

    this.activeConversation.messages.push({
      from: 'agent',
      text,
      time: this.getCurrentTime(),
      status: 'sent'
    });
    this.activeConversation.lastMessage = text;
    this.activeConversation.waitingMinutes = 0;
    this.draftMessage = '';
  }

  get selectedProduct(): CatalogProduct | null {
    return this.catalogProducts.find((p) => p.id === this.selectedProductId) || null;
  }

  get orderSubtotal(): number {
    return this.orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  sendProductToCustomer(): void {
    const product = this.selectedProduct;
    const qty = Math.max(1, Number(this.selectedProductQty || 1));

    if (!product || !this.activeConversation) {
      this.showActionMessage('Please select a product and active conversation.', 'error');
      return;
    }

    const text = `Product suggestion: ${product.name} (${product.sku}) - ${this.formatCurrency(product.price)} x${qty}`;
    this.activeConversation.messages.push({
      from: 'agent',
      text,
      time: this.getCurrentTime(),
      status: 'sent'
    });
    this.activeConversation.lastMessage = text;
    this.activeConversation.waitingMinutes = 0;

    this.showActionMessage(`Sent ${product.name} to customer.`, 'success');
  }

  addSelectedProductToOrder(): void {
    const product = this.selectedProduct;
    const qty = Math.max(1, Number(this.selectedProductQty || 1));
    if (!product) {
      this.showActionMessage('Please select a product to add.', 'error');
      return;
    }

    const existing = this.orderItems.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.orderItems.push({ product, quantity: qty });
    }

    this.showActionMessage(`Added ${product.name} to order draft.`, 'success');
  }

  increaseOrderItem(item: OrderDraftItem): void {
    item.quantity += 1;
  }

  decreaseOrderItem(item: OrderDraftItem): void {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      this.removeOrderItem(item);
    }
  }

  removeOrderItem(item: OrderDraftItem): void {
    this.orderItems = this.orderItems.filter((x) => x.product.id !== item.product.id);
  }

  createOrderFromConversation(): void {
    const conv = this.activeConversation;
    if (!conv) {
      this.showActionMessage('Please select a conversation first.', 'error');
      return;
    }
    if (!this.orderItems.length) {
      this.showActionMessage('Order draft is empty.', 'error');
      return;
    }

    const subtotal = this.orderSubtotal;
    const taxAmount = subtotal * 0.08;
    const totalAmount = subtotal + taxAmount;
    const timestamp = Date.now();

    const payload = {
      order_number: `OMNI-${timestamp}`,
      customer_id: conv.userId || conv.customer || 'omnichannel-customer',
      items: this.orderItems.map((line) => ({
        product_id: line.product.id || 'string',
        sku: line.product.sku || 'string',
        product_name: line.product.name || 'string',
        quantity: line.quantity,
        unit_price: line.product.price,
        total_price: line.product.price * line.quantity,
        discount: 0
      })),
      total_amount: totalAmount,
      discount_total: 0,
      tax_amount: taxAmount,
      net_amount: totalAmount,
      source: `omnichannel_${conv.channelKey}`,
      shipping_address: 'N/A'
    };

    this.creatingOrder = true;
    this.orderService.createOrder(payload).subscribe({
      next: (resp: any) => {
        this.creatingOrder = false;
        const orderNumber = resp?.data?.order_number || payload.order_number;
        this.showActionMessage(`Order ${orderNumber} created successfully.`, 'success');
        conv.messages.push({
          from: 'agent',
          text: `Order created: ${orderNumber}. Total ${this.formatCurrency(totalAmount)}.`,
          time: this.getCurrentTime(),
          status: 'sent'
        });
        conv.lastMessage = `Order created: ${orderNumber}`;
        this.orderItems = [];
      },
      error: (err: any) => {
        this.creatingOrder = false;
        const message = err?.error?.message || err?.message || 'Failed to create order.';
        this.showActionMessage(message, 'error');
      }
    });
  }

  channelCount(channel: ChannelKey): number {
    if (channel === 'all') return this.conversations.length;
    return this.conversations.filter((c) => c.channelKey === channel).length;
  }

  formatCurrency(amount: number): string {
    if (!amount) {
      return '-';
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }

  getWaitingSeverity(waitingMinutes: number): 'success' | 'warn' | 'danger' {
    if (waitingMinutes >= 15) return 'danger';
    if (waitingMinutes >= 7) return 'warn';
    return 'success';
  }

  private loadChatPlatformsAndStats(): void {
    this.chatService.getChatDataProducts().subscribe({
      next: (resp) => {
        const data = resp?.data;
        if (!data) {
          return;
        }

        const platforms = Array.isArray(data.platforms)
          ? data.platforms.map((p) => String(p).trim().toLowerCase()).filter(Boolean)
          : [];

        if (platforms.length > 0) {
          this.apiPlatforms = platforms;
        }

        this.chatStats.totalConversations = Number(data.total_conversations ?? 0);
        this.chatStats.activeConversations = Number(data.active_conversations ?? 0);
        this.chatStats.totalMessages = Number(data.total_messages ?? 0);
        this.chatStats.onlineAgents = Number(data.online_agents ?? 0);

        this.refreshChannelFilters();
      },
      error: () => {
        this.refreshChannelFilters();
      }
    });
  }

  private loadAnalytics(): void {
    this.chatService.getAnalytics('7d').subscribe({
      next: (resp) => {
        const analytics: ChatAnalytics | undefined = resp?.data;
        if (!analytics?.overview) {
          return;
        }

        this.chatStats.totalConversations = Number(analytics.overview.total_conversations ?? this.chatStats.totalConversations);
        this.chatStats.activeConversations = Number(analytics.overview.active_conversations ?? this.chatStats.activeConversations);
        this.chatStats.totalMessages = Number(analytics.overview.total_messages ?? this.chatStats.totalMessages);
        this.chatStats.averageResponseTime = analytics.overview.average_response_time || '-';
      }
    });
  }

  private loadAgents(): void {
    this.chatService.getAgents(10).subscribe({
      next: (resp) => {
        this.agents = Array.isArray(resp?.data) ? resp.data : [];
      },
      error: () => {
        this.agents = [];
      }
    });
  }

  private loadProducts(): void {
    this.productService.listProducts(undefined, 0, 100).subscribe({
      next: (resp: any) => {
        const rows = Array.isArray(resp?.data) ? resp.data : [];
        this.catalogProducts = rows
          .map((row: Product) => this.mapCatalogProduct(row))
          .filter((item: CatalogProduct) => !!item.id && item.price >= 0);

        if (this.catalogProducts.length > 0 && !this.selectedProductId) {
          this.selectedProductId = this.catalogProducts[0].id;
        }
      },
      error: () => {
        this.catalogProducts = [
          { id: 'demo-1', name: 'Retail Product A', sku: 'RET-A', price: 25, category: 'General' },
          { id: 'demo-2', name: 'Retail Product B', sku: 'RET-B', price: 40, category: 'General' }
        ];
        if (!this.selectedProductId) {
          this.selectedProductId = this.catalogProducts[0].id;
        }
      }
    });
  }

  private loadConversations(): void {
    this.loadingConversations = true;
    const platform = this.selectedChannel === 'all' ? undefined : this.selectedChannel;

    this.chatService.getConversations(20, 0, platform).subscribe({
      next: (resp) => {
        const apiItems = Array.isArray(resp?.data) ? resp.data : [];
        this.conversations = apiItems.map((item) => this.mapConversation(item));
        this.refreshChannelFilters();

        if (this.conversations.length === 0) {
          this.selectedConversationId = '';
          this.loadingConversations = false;
          return;
        }

        const hasSelected = this.conversations.some((c) => c.id === this.selectedConversationId);
        if (!hasSelected) {
          this.selectedConversationId = this.conversations[0].id;
        }

        this.loadConversationDetail(this.selectedConversationId);
        this.loadingConversations = false;
      },
      error: () => {
        this.conversations = [];
        this.selectedConversationId = '';
        this.refreshChannelFilters();
        this.loadingConversations = false;
      }
    });
  }

  private loadConversationDetail(id: string): void {
    this.chatService.getConversationDetail(id).subscribe({
      next: (resp) => {
        const detail = resp?.data;
        if (!detail) {
          return;
        }

        const idx = this.conversations.findIndex((item) => item.id === id);
        if (idx < 0) {
          return;
        }

        const current = this.conversations[idx];
        const messages = this.mapMessages(detail.messages, detail.last_message, detail.last_message_time);

        this.conversations[idx] = {
          ...current,
          tags: Array.isArray(detail.tags) && detail.tags.length > 0
            ? detail.tags
            : current.tags,
          messages,
          conversationDuration: detail.conversation_duration,
          firstResponseTime: detail.first_response_time,
          customerSatisfaction: detail.customer_satisfaction,
          escalated: detail.escalated
        };
      }
    });
  }

  private mapConversation(item: ApiConversation): UiConversation {
    const channelKey = String(item.platform || 'unknown').toLowerCase();
    const lastMessageTime = item.last_message_time || '';

    return {
      id: item.id,
      channelKey,
      channelLabel: this.toTitleCase(channelKey),
      channelIcon: this.resolveChannelIcon(channelKey),
      channelColor: this.resolveChannelColor(channelKey),
      customer: item.user_name || 'Unknown Customer',
      userId: item.user_id || '-',
      lastMessage: item.last_message || '-',
      lastMessageTime,
      unread: item.status === 'active' ? 1 : 0,
      waitingMinutes: this.getWaitingMinutes(lastMessageTime),
      orderValue: 0,
      tags: [item.status, item.category, item.sentiment].filter(Boolean),
      messages: this.mapMessages(item.messages, item.last_message, item.last_message_time),
      status: item.status || '-',
      agent: item.agent || '-',
      category: item.category || '-',
      sentiment: item.sentiment || '-',
      responseTime: item.response_time || '-',
      resolutionTime: item.resolution_time,
      messageCount: Number(item.message_count ?? 0),
      conversationDuration: item.conversation_duration,
      firstResponseTime: item.first_response_time,
      customerSatisfaction: item.customer_satisfaction,
      escalated: item.escalated
    };
  }

  private mapMessages(messages: ApiMessage[] | undefined, fallbackMessage: string, fallbackTime: string): UiMessage[] {
    if (Array.isArray(messages) && messages.length > 0) {
      return messages.map((msg) => ({
        from: this.mapSender(msg.sender),
        text: msg.content || '-',
        time: this.formatTime(msg.timestamp)
      }));
    }

    if (fallbackMessage) {
      return [{
        from: 'customer',
        text: fallbackMessage,
        time: this.formatTime(fallbackTime)
      }];
    }

    return [];
  }

  private mapCatalogProduct(item: Product): CatalogProduct {
    return {
      id: String((item as any)?._id || item.id || ''),
      name: String(item.name || 'Unnamed product'),
      sku: String(item.sku || '-'),
      price: Number((item as any)?.selling_price ?? item.price ?? 0),
      category: String(item.category || 'General')
    };
  }

  private mapSender(sender: string): 'customer' | 'agent' | 'system' {
    const value = String(sender || '').toLowerCase();
    if (value.includes('agent') || value.includes('support')) {
      return 'agent';
    }
    if (value.includes('system')) {
      return 'system';
    }
    return 'customer';
  }

  private getWaitingMinutes(isoTime: string): number {
    if (!isoTime) {
      return 0;
    }

    const parsed = new Date(isoTime);
    if (Number.isNaN(parsed.getTime())) {
      return 0;
    }

    const diffMs = Date.now() - parsed.getTime();
    if (diffMs <= 0) {
      return 0;
    }

    return Math.floor(diffMs / 60000);
  }

  private formatTime(isoTime: string): string {
    if (!isoTime) {
      return '-';
    }

    const parsed = new Date(isoTime);
    if (Number.isNaN(parsed.getTime())) {
      return isoTime;
    }

    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private getCurrentTime(): string {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private refreshChannelFilters(): void {
    const platformSet = new Set<string>();
    this.apiPlatforms.forEach((p) => platformSet.add(String(p).toLowerCase()));
    this.conversations.forEach((c) => platformSet.add(String(c.channelKey).toLowerCase()));

    this.channelFilters = [
      { key: 'all', label: 'All', icon: 'pi pi-comments' },
      ...Array.from(platformSet).map((key) => ({
        key,
        label: this.toTitleCase(key),
        icon: this.resolveChannelIcon(key)
      }))
    ];
  }

  private resolveChannelIcon(key: string): string {
    const k = key.toLowerCase();
    if (k.includes('facebook')) return 'pi pi-facebook';
    if (k.includes('instagram')) return 'pi pi-instagram';
    if (k.includes('whatsapp')) return 'pi pi-whatsapp';
    if (k.includes('telegram')) return 'pi pi-send';
    if (k.includes('tiktok')) return 'pi pi-video';
    if (k.includes('zalo')) return 'pi pi-comment';
    if (k.includes('website') || k.includes('web')) return 'pi pi-globe';
    return 'pi pi-comments';
  }

  private resolveChannelColor(key: string): string {
    const k = key.toLowerCase();
    if (k.includes('facebook')) return '#1877f2';
    if (k.includes('instagram')) return '#e1306c';
    if (k.includes('whatsapp')) return '#25d366';
    if (k.includes('telegram')) return '#229ed9';
    if (k.includes('tiktok')) return '#111827';
    if (k.includes('zalo')) return '#0068ff';
    if (k.includes('website') || k.includes('web')) return '#16a34a';
    return '#6b7280';
  }

  private toTitleCase(value: string): string {
    return value
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private showActionMessage(message: string, severity: 'success' | 'error' | 'info'): void {
    this.actionMessage = message;
    this.actionMessageSeverity = severity;
  }
}
