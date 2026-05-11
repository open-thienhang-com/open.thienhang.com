import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

interface Channel {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  status: 'active' | 'inactive' | 'setup';
  conversations: number;
  unread: number;
  avgResponseTime: string;
  description: string;
}

interface ConversationRow {
  id: string;
  customer: string;
  channel: string;
  channelIcon: string;
  channelColor: string;
  lastMessage: string;
  time: string;
  status: 'open' | 'pending' | 'resolved';
  agent: string;
  waitMin: number;
}

@Component({
  selector: 'app-omnichannel-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, BadgeModule, TooltipModule],
  template: `
<div class="bg-gray-50 min-h-screen p-6">

  <!-- Header -->
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <i class="pi pi-share-alt text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Omni-channel Overview</h1>
          <p class="text-gray-500 text-sm">Unified customer engagement across all connected channels</p>
        </div>
      </div>
      <div class="flex gap-2">
        <p-button label="Connect Channel" icon="pi pi-plus" severity="primary"></p-button>
        <p-button icon="pi pi-cog" [outlined]="true" pTooltip="Settings"></p-button>
      </div>
    </div>
  </div>

  <!-- Stats row -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active Channels</p>
        <i class="pi pi-share-alt text-violet-500"></i>
      </div>
      <p class="text-2xl font-bold text-gray-900">{{ activeChannelCount }}</p>
      <p class="text-xs text-gray-400 mt-1">{{ channels.length }} total connected</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Open Conversations</p>
        <i class="pi pi-comments text-blue-500"></i>
      </div>
      <p class="text-2xl font-bold text-blue-600">{{ totalConversations }}</p>
      <p class="text-xs text-gray-400 mt-1">Across all channels</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Unread Messages</p>
        <i class="pi pi-inbox text-amber-500"></i>
      </div>
      <p class="text-2xl font-bold text-amber-600">{{ totalUnread }}</p>
      <p class="text-xs text-gray-400 mt-1">Needs attention</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Avg Response</p>
        <i class="pi pi-clock text-green-500"></i>
      </div>
      <p class="text-2xl font-bold text-green-600">4.2m</p>
      <p class="text-xs text-gray-400 mt-1">Last 7 days</p>
    </div>
  </div>

  <!-- Channels grid -->
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
    <h2 class="text-lg font-bold text-gray-900 mb-4">Connected Channels</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <div *ngFor="let ch of channels"
        class="rounded-xl border-2 p-4 text-center cursor-pointer hover:shadow-md transition-all"
        [class.border-gray-200]="ch.status !== 'active'"
        [class.opacity-60]="ch.status === 'inactive'"
        [style.borderColor]="ch.status === 'active' ? ch.color : undefined">
        <div class="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
          [style.background]="ch.bgColor">
          <i [class]="ch.icon + ' text-lg'" [style.color]="ch.color"></i>
        </div>
        <p class="font-semibold text-sm text-gray-900">{{ ch.name }}</p>
        <p class="text-xs text-gray-400 mt-0.5">{{ ch.conversations }} convos</p>
        <span class="inline-flex items-center gap-1 mt-2 text-xs px-2 py-0.5 rounded-full font-semibold"
          [class.bg-green-100]="ch.status === 'active'"
          [class.text-green-700]="ch.status === 'active'"
          [class.bg-gray-100]="ch.status !== 'active'"
          [class.text-gray-500]="ch.status !== 'active'">
          <span class="w-1.5 h-1.5 rounded-full inline-block"
            [class.bg-green-500]="ch.status === 'active'"
            [class.bg-gray-400]="ch.status !== 'active'"></span>
          {{ ch.status }}
        </span>
      </div>
    </div>
  </div>

  <!-- Recent conversations -->
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-gray-900">Recent Conversations</h2>
      <p-button label="Open Inbox" icon="pi pi-external-link" size="small" [outlined]="true"></p-button>
    </div>

    <!-- Filter tabs -->
    <div class="flex gap-2 mb-4 flex-wrap">
      <button *ngFor="let f of filters"
        class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        [class.bg-violet-600]="activeFilter === f.value"
        [class.text-white]="activeFilter === f.value"
        [class.bg-gray-100]="activeFilter !== f.value"
        [class.text-gray-600]="activeFilter !== f.value"
        (click)="activeFilter = f.value">
        {{ f.label }}
        <span class="ml-1 px-1.5 py-0.5 rounded text-xs"
          [class.bg-violet-500]="activeFilter === f.value"
          [class.bg-gray-200]="activeFilter !== f.value">{{ getCount(f.value) }}</span>
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Customer</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Channel</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Last Message</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Agent</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-4">Status</th>
            <th class="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3">Wait</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of filteredConversations"
            class="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
            <td class="py-3 pr-4 font-semibold text-gray-900">{{ row.customer }}</td>
            <td class="py-3 pr-4">
              <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold"
                [style.background]="row.channelColor + '18'"
                [style.color]="row.channelColor">
                <i [class]="row.channelIcon"></i>
                {{ row.channel }}
              </span>
            </td>
            <td class="py-3 pr-4 text-gray-500 max-w-xs truncate">{{ row.lastMessage }}</td>
            <td class="py-3 pr-4 text-gray-600">{{ row.agent }}</td>
            <td class="py-3 pr-4">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                [class.bg-blue-100]="row.status === 'open'"
                [class.text-blue-700]="row.status === 'open'"
                [class.bg-amber-100]="row.status === 'pending'"
                [class.text-amber-700]="row.status === 'pending'"
                [class.bg-green-100]="row.status === 'resolved'"
                [class.text-green-700]="row.status === 'resolved'">
                {{ row.status }}
              </span>
            </td>
            <td class="py-3">
              <span class="text-xs font-semibold"
                [class.text-red-500]="row.waitMin >= 15"
                [class.text-amber-500]="row.waitMin >= 7 && row.waitMin < 15"
                [class.text-gray-400]="row.waitMin < 7">
                {{ row.waitMin }}m
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</div>
  `,
})
export class OmnichannelOverviewComponent {
  activeFilter: 'all' | 'open' | 'pending' | 'resolved' = 'all';

  filters = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'Pending', value: 'pending' },
    { label: 'Resolved', value: 'resolved' },
  ];

  channels: Channel[] = [
    { id: 'facebook', name: 'Facebook', icon: 'pi pi-facebook', color: '#1877f2', bgColor: '#dbeafe', status: 'active', conversations: 84, unread: 12, avgResponseTime: '3.1m', description: 'Facebook Messenger' },
    { id: 'instagram', name: 'Instagram', icon: 'pi pi-instagram', color: '#e1306c', bgColor: '#fce7f3', status: 'active', conversations: 61, unread: 7, avgResponseTime: '5.4m', description: 'Instagram DM' },
    { id: 'telegram', name: 'Telegram', icon: 'pi pi-send', color: '#229ed9', bgColor: '#dbeafe', status: 'active', conversations: 110, unread: 20, avgResponseTime: '2.8m', description: 'Telegram Bot' },
    { id: 'zalo', name: 'Zalo', icon: 'pi pi-comment', color: '#0068ff', bgColor: '#eff6ff', status: 'active', conversations: 47, unread: 5, avgResponseTime: '4.0m', description: 'Zalo OA' },
    { id: 'web', name: 'Web Chat', icon: 'pi pi-globe', color: '#16a34a', bgColor: '#dcfce7', status: 'active', conversations: 29, unread: 3, avgResponseTime: '1.5m', description: 'Website live chat' },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'pi pi-whatsapp', color: '#25d366', bgColor: '#dcfce7', status: 'inactive', conversations: 0, unread: 0, avgResponseTime: '-', description: 'WhatsApp Business' },
  ];

  conversations: ConversationRow[] = [
    { id: '1', customer: 'Nguyen Van A', channel: 'Facebook', channelIcon: 'pi pi-facebook', channelColor: '#1877f2', lastMessage: 'Tôi muốn hỏi về đơn hàng #12345', time: '10:32', status: 'open', agent: 'Linh T.', waitMin: 3 },
    { id: '2', customer: 'Tran Thi B', channel: 'Zalo', channelIcon: 'pi pi-comment', channelColor: '#0068ff', lastMessage: 'Bao giờ ship hàng vậy bạn?', time: '10:18', status: 'pending', agent: 'Huy N.', waitMin: 18 },
    { id: '3', customer: 'Le Van C', channel: 'Telegram', channelIcon: 'pi pi-send', channelColor: '#229ed9', lastMessage: 'Cảm ơn bạn, tôi nhận hàng rồi!', time: '09:55', status: 'resolved', agent: 'Mai P.', waitMin: 0 },
    { id: '4', customer: 'Pham Thi D', channel: 'Instagram', channelIcon: 'pi pi-instagram', channelColor: '#e1306c', lastMessage: 'Sản phẩm này có màu xanh không?', time: '09:41', status: 'open', agent: 'Linh T.', waitMin: 8 },
    { id: '5', customer: 'Hoang Van E', channel: 'Web Chat', channelIcon: 'pi pi-globe', channelColor: '#16a34a', lastMessage: 'Cho tôi xem catalog sản phẩm', time: '09:30', status: 'open', agent: 'Huy N.', waitMin: 2 },
    { id: '6', customer: 'Vo Thi F', channel: 'Telegram', channelIcon: 'pi pi-send', channelColor: '#229ed9', lastMessage: 'Đơn hàng bị hoàn rồi, tôi cần hoàn tiền', time: '09:15', status: 'pending', agent: 'Mai P.', waitMin: 22 },
    { id: '7', customer: 'Dang Van G', channel: 'Facebook', channelIcon: 'pi pi-facebook', channelColor: '#1877f2', lastMessage: 'Thanks! Great service', time: '08:50', status: 'resolved', agent: 'Linh T.', waitMin: 0 },
  ];

  get activeChannelCount(): number {
    return this.channels.filter(c => c.status === 'active').length;
  }

  get totalConversations(): number {
    return this.channels.filter(c => c.status === 'active').reduce((s, c) => s + c.conversations, 0);
  }

  get totalUnread(): number {
    return this.channels.filter(c => c.status === 'active').reduce((s, c) => s + c.unread, 0);
  }

  get filteredConversations(): ConversationRow[] {
    if (this.activeFilter === 'all') return this.conversations;
    return this.conversations.filter(c => c.status === this.activeFilter);
  }

  getCount(filter: string): number {
    if (filter === 'all') return this.conversations.length;
    return this.conversations.filter(c => c.status === filter).length;
  }
}
