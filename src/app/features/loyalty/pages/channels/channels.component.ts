import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

interface OmniMetric {
  label: string;
  value: string;
  trend: string;
  tone: 'emerald' | 'blue' | 'amber' | 'violet';
  icon: string;
}

interface ChannelSource {
  key: string;
  label: string;
  icon: string;
  chipClass: string;
}

interface InboxItem {
  customer: string;
  source: ChannelSource;
  store: string;
  status: string;
  lastMessage: string;
  time: string;
  contextProduct: string;
  bopis: boolean;
}

interface CustomerMessage {
  sender: 'store' | 'customer' | 'system';
  text: string;
  meta: string;
  source?: string;
  type?: 'text' | 'product' | 'pickup' | 'context';
  productName?: string;
  productPrice?: string;
  productStock?: string;
}

interface NotificationItem {
  title: string;
  detail: string;
  priority: 'High' | 'Medium';
  store: string;
  source: string;
  time: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-loyalty-channels',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TagModule, DividerModule, AvatarModule, BadgeModule],
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.scss'
})
export class ChannelsComponent {
  readonly metrics: OmniMetric[] = [
    { label: 'Active unified threads', value: '248', trend: '+18 vs yesterday', tone: 'blue', icon: 'pi pi-inbox' },
    { label: 'Avg. first response', value: '1m 42s', trend: '-24s improvement', tone: 'emerald', icon: 'pi pi-bolt' },
    { label: 'BOPIS questions', value: '63', trend: '14 pending pickup checks', tone: 'amber', icon: 'pi pi-qrcode' },
    { label: 'Cross-channel continuity', value: '97%', trend: 'Shared history synced', tone: 'violet', icon: 'pi pi-sync' }
  ];

  readonly channelSources: Record<string, ChannelSource> = {
    web: { key: 'web', label: 'Web Chat', icon: 'pi pi-globe', chipClass: 'source-web' },
    app: { key: 'app', label: 'Mobile App', icon: 'pi pi-mobile', chipClass: 'source-app' },
    messenger: { key: 'messenger', label: 'Messenger', icon: 'pi pi-facebook', chipClass: 'source-messenger' },
    zalo: { key: 'zalo', label: 'Zalo', icon: 'pi pi-comments', chipClass: 'source-zalo' }
  };

  readonly inbox: InboxItem[] = [
    {
      customer: 'Nguyen Minh Anh',
      source: this.channelSources.web,
      store: 'TH Co.op Landmark 81',
      status: 'Typing...',
      lastMessage: 'Mình đang xem máy xay cầm tay ProMix, cửa hàng còn hàng không?',
      time: 'Just now',
      contextProduct: 'ProMix Blender A18',
      bopis: true
    },
    {
      customer: 'Tran Gia Bao',
      source: this.channelSources.messenger,
      store: 'TH Flagship Q1',
      status: 'Seen',
      lastMessage: 'Cho mình xin mã QR để nhận hàng nhanh tại quầy.',
      time: '2m ago',
      contextProduct: 'AirFlex Headphones',
      bopis: true
    },
    {
      customer: 'Le Thu Ha',
      source: this.channelSources.zalo,
      store: 'TH Vincom Thu Duc',
      status: 'Waiting for store',
      lastMessage: 'App và web của mình có lưu cùng một lịch sử chat chứ?',
      time: '6m ago',
      contextProduct: 'Membership support',
      bopis: false
    },
    {
      customer: 'Pham Quoc Huy',
      source: this.channelSources.app,
      store: 'TH AEON Tan Phu',
      status: 'Sent from TH AEON Tan Phu',
      lastMessage: 'Nhờ tư vấn size sản phẩm A và màu còn tại cửa hàng.',
      time: '14m ago',
      contextProduct: 'Urban Pack Jacket',
      bopis: false
    }
  ];

  readonly conversation: CustomerMessage[] = [
    {
      sender: 'system',
      text: 'Shared History synced: web chat at 09:12, Messenger follow-up at 14:05, mobile app reopened at 16:48.',
      meta: 'Omnichannel continuity',
      type: 'context'
    },
    {
      sender: 'customer',
      text: 'Mình đang xem ProMix Blender A18. Không biết cửa hàng Landmark 81 còn hàng không?',
      meta: '16:48',
      source: 'Web Chat'
    },
    {
      sender: 'store',
      text: 'Có nhé. Mình kiểm tra thấy còn 5 chiếc tại Landmark 81 và 2 chiếc ở Vincom Central Park.',
      meta: 'Seen • Sent from TH Co.op Landmark 81',
      source: 'Store reply'
    },
    {
      sender: 'store',
      text: '',
      meta: 'Quick product card',
      type: 'product',
      productName: 'ProMix Blender A18',
      productPrice: '1.490.000 VND',
      productStock: 'In stock at Landmark 81'
    },
    {
      sender: 'customer',
      text: 'Giữ giúp mình 1 cái nhé. Cho mình mã QR nhận hàng luôn được không?',
      meta: '16:50',
      source: 'Web Chat'
    },
    {
      sender: 'store',
      text: '',
      meta: 'BOPIS QR ready',
      type: 'pickup'
    }
  ];

  readonly notifications: NotificationItem[] = [
    {
      title: 'Khách hỏi tồn kho sản phẩm tại cửa hàng',
      detail: 'ProMix Blender A18 đang được xem trên web. Cần xác nhận tồn kho cho Landmark 81.',
      priority: 'High',
      store: 'Tablet POS #03',
      source: 'Web + Shared History',
      time: 'Just now'
    },
    {
      title: 'Yêu cầu gửi QR nhận hàng',
      detail: 'Khách từ Messenger muốn nhận QR pickup để đến quầy trong 20 phút tới.',
      priority: 'High',
      store: 'Tablet POS #01',
      source: 'Messenger',
      time: '2m ago'
    },
    {
      title: 'Chuyển tuyến sang bộ phận CSKH',
      detail: 'Hội thoại liên quan đổi trả cần handoff sang Customer Care.',
      priority: 'Medium',
      store: 'Tablet POS #05',
      source: 'Zalo + App',
      time: '11m ago'
    }
  ];

  readonly quickActions: QuickAction[] = [
    { label: 'Send Product Card', description: 'Đẩy thông tin sản phẩm đang xem vào chat ngay lập tức.', icon: 'pi pi-send' },
    { label: 'Send Pickup QR', description: 'Sinh mã QR nhận hàng cho BOPIS tại cửa hàng hiện tại.', icon: 'pi pi-qrcode' },
    { label: 'Transfer Conversation', description: 'Chuyển hội thoại sang kho, CSKH hoặc bộ phận thanh toán.', icon: 'pi pi-share-alt' }
  ];

  readonly sourceLegend = [
    this.channelSources.web,
    this.channelSources.app,
    this.channelSources.messenger,
    this.channelSources.zalo
  ];
}
