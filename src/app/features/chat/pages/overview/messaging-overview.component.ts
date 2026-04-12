import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-messaging-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, Button, TooltipModule],
  templateUrl: './messaging-overview.component.html',
  styleUrl: './messaging-overview.component.scss'
})
export class MessagingOverviewComponent implements OnInit {

  loading = true;

  stats = [
    { label: 'Success Rate',    value: '99.8%',   icon: 'pi pi-check-circle', color: 'bg-emerald-100', iconColor: 'text-emerald-600', desc: 'Percentage of messages successfully delivered across all channels' },
    { label: 'Avg Latency',     value: '420ms',    icon: 'pi pi-bolt',         color: 'bg-blue-100',    iconColor: 'text-blue-600',    desc: 'Average time from message trigger to provider receipt' },
    { label: 'Active Sessions', value: '1,540',    icon: 'pi pi-comments',      color: 'bg-sky-100',     iconColor: 'text-sky-600',     desc: 'Current active conversational sessions in the engagement queue' },
    { label: 'Handoff Queue',  value: '12',       icon: 'pi pi-user-plus',     color: 'bg-orange-100',  iconColor: 'text-orange-600',  desc: 'Conversations waiting for an available human agent' },
  ];

  sections = [
    {
      label: 'Messaging Operations',
      icon: 'pi pi-send',
      desc: 'Direct interaction and message lifecycle tracking.',
      links: [
        { label: 'Conversations',   icon: 'pi pi-comments',    route: 'conversations',     desc: 'Active chat queue'        },
        { label: 'Composer',        icon: 'pi pi-pencil',      route: '/notification/composer', desc: 'Manual blast tool'       },
        { label: 'Message Explorer',icon: 'pi pi-search',      route: '/notification/explorer', desc: 'Message delivery logs'   },
      ]
    },
    {
      label: 'Templates & Content',
      icon: 'pi pi-copy',
      desc: 'Reusable content for chat and notifications.',
      links: [
        { label: 'Manage Templates',icon: 'pi pi-list',        route: 'templates',         desc: 'Centralized catalog'      },
        { label: 'Create New',      icon: 'pi pi-plus',        route: '/notification/templates/create', desc: 'New template tool' },
      ]
    },
    {
      label: 'Automation & Bots',
      icon: 'pi pi-bolt',
      desc: 'Intelligent logic and bot behavioral settings.',
      links: [
        { label: 'Workflows',       icon: 'pi pi-directions',  route: 'automation',        desc: 'Triggered automation'     },
        { label: 'Bot Settings',    icon: 'pi pi-cog',         route: 'bot-settings',      desc: 'Behavior & personality'   },
      ]
    },
    {
      label: 'Channel Management',
      icon: 'pi pi-share-alt',
      desc: 'External connection points and API providers.',
      links: [
        { label: 'Omni-channel',    icon: 'pi pi-sync',        route: '/retail/omni-channel', desc: 'Unified channel map'    },
      ]
    },
    {
      label: 'Monitoring & Health',
      icon: 'pi pi-chart-line',
      desc: 'Real-time performance and reliability tracking.',
      links: [
        { label: 'Platform Health', icon: 'pi pi-heart',       route: 'delivery-health',   desc: 'Service uptime & latency' },
        { label: 'Reliability',     icon: 'pi pi-shield',      route: '/notification/reliability', desc: 'Retry logic & DLQ' },
        { label: 'Performance',     icon: 'pi pi-sliders-h',   route: '/notification/scheduling',  desc: 'Rate limits & throughput' },
      ]
    },
    {
      label: 'System & Audit',
      icon: 'pi pi-code',
      desc: 'Technical tools for developers and operators.',
      links: [
        { label: 'Audit Log',       icon: 'pi pi-history',     route: '/notification/audit', desc: 'Security & access logs'    },
        { label: 'API Playground',  icon: 'pi pi-terminal',    route: '/notification/api',   desc: 'Developer sandbox'        },
      ]
    }
  ];

  platformDictionary = [
    { label: 'Reliability (SLO)', percent: 99, colorClass: 'bg-emerald-500', dotClass: 'bg-emerald-500', desc: 'Platform availability and resilience' },
    { label: 'Handoff Velocity', percent: 84, colorClass: 'bg-blue-500',    dotClass: 'bg-blue-500',    desc: 'Average speed of human escalation' },
    { label: 'Throughput',      percent: 45, colorClass: 'bg-sky-500',     dotClass: 'bg-sky-500',     desc: 'Current utilization of system rate limits' },
  ];

  alerts = [
    { id: '1', product: 'WhatsApp',    message: 'Increased latency on North America gateway', severity: 'warning', severityTag: 'warning', icon: 'pi pi-exclamation-triangle', time: '12m ago', context: 'Gateway' },
    { id: '2', product: 'Notification',message: 'Email throttle limit reached (Provider)',  severity: 'warning', severityTag: 'warning', icon: 'pi pi-sliders-h',          time: '45m ago', context: 'Throttling' },
    { id: '3', product: 'API Server',  message: 'Secondary cluster taking over (Failover)',  severity: 'info',    severityTag: 'info',    icon: 'pi pi-spin pi-spinner',       time: '1h ago',  context: 'Failover' },
  ];

  ngOnInit(): void {
    // Simulate data loading
    setTimeout(() => {
      this.loading = false;
    }, 800);
  }

  loadStats(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }
}
