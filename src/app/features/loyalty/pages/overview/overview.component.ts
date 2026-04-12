import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-loyalty-overview-doc',
  standalone: true,
  imports: [CommonModule, RouterModule, Button, TooltipModule, Tag],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class LoyaltyOverviewDocComponent implements OnInit {

  loading = true;

  stats = [
    { label: 'Active Members',  value: '12,480', icon: 'pi pi-users', color: 'bg-violet-100', iconColor: 'text-violet-600', desc: 'Total members enrolled in loyalty programs' },
    { label: 'Retention Rate',  value: '94.2%',   icon: 'pi pi-heart', color: 'bg-pink-100',   iconColor: 'text-pink-600',   desc: 'Percentage of members who returned this month' },
    { label: 'Points Issued',   value: '4.5M',    icon: 'pi pi-star',  color: 'bg-yellow-100', iconColor: 'text-yellow-600',desc: 'Total loyalty points rewarded to date' },
    { label: 'Burn Rate',       value: '62%',     icon: 'pi pi-bolt',  color: 'bg-orange-100', iconColor: 'text-orange-600',desc: 'Percentage of points redeemed vs issued' },
  ];

  sections = [
    {
      label: 'Member Engagement',
      icon: 'pi pi-user-plus',
      desc: 'Member lifecycle management and audience targeting.',
      links: [
        { label: 'Members',        icon: 'pi pi-users',     route: '../members',    desc: 'Member directory'          },
        { label: 'Segments',       icon: 'pi pi-filter',    route: '../segments',   desc: 'Behavioral segments'       },
        { label: 'Automation',     icon: 'pi pi-bolt',      route: '../automation', desc: 'Touchpoint rules'           },
      ]
    },
    {
      label: 'Strategy & Rewards',
      icon: 'pi pi-megaphone',
      desc: 'Reward definitions and campaign coordination.',
      links: [
        { label: 'Rewards Catalog', icon: 'pi pi-gift',      route: '../rewards',    desc: 'Perk inventory'            },
        { label: 'Campaigns',       icon: 'pi pi-megaphone', route: '../campaigns',  desc: 'Point multipliers'         },
        { label: 'Strategy',        icon: 'pi pi-sitemap',   route: '../strategy',   desc: 'Economic configuration'    },
      ]
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
      desc: 'Deeper insights into COHORT behavior and LTV.',
      links: [
        { label: 'KPI Dashboard',   icon: 'pi pi-chart-line',route: '../analytics',  desc: 'Retention metrics'         },
        { label: 'Cohort Reports',  icon: 'pi pi-users',     route: '../analytics',  desc: 'Lifecycle analysis'         },
      ]
    },
    {
      label: 'Resources',
      icon: 'pi pi-database',
      desc: 'Shared data assets and integration channels.',
      links: [
        { label: 'Customers',      icon: 'pi pi-user',      route: '/retail/customers', desc: 'Master Customer CRM'    },
        { label: 'Channels',       icon: 'pi pi-share-alt', route: '../channels',   desc: 'Loyalty touchpoints'       },
      ]
    }
  ];

  loyaltyHealth = [
    { label: 'High Engagement', percent: 72, colorClass: 'bg-violet-500',  dotClass: 'bg-violet-500', desc: 'Members active in the last 30 days' },
    { label: 'At Risk',         percent: 18, colorClass: 'bg-orange-500',  dotClass: 'bg-orange-500', desc: 'Members with no activity for 60+ days' },
    { label: 'Churned',        percent: 10, colorClass: 'bg-red-500',     dotClass: 'bg-red-500',    desc: 'Members inactive for over 180 days' },
  ];

  alerts = [
    { id: '1', product: 'Gold Tier',   message: 'Nguyen Van A reached Gold status',severity: 'info',     severityTag: 'success', icon: 'pi pi-chevron-up', time: '5m ago', context: 'Tier Upgrade' },
    { id: '2', product: 'System Rule', message: 'Retention automation rule triggered', severity: 'info',     severityTag: 'info',    icon: 'pi pi-bolt',       time: '22m ago', context: 'Automation' },
    { id: '3', product: 'Campaign',    message: 'Summer Sale enrollment spike detected',severity: 'warning',  severityTag: 'warning', icon: 'pi pi-chart-line', time: '1h ago', context: 'Monitor' },
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
