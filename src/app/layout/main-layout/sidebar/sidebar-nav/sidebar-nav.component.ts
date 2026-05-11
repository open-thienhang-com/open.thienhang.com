import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { VisibleGroup, FlatMenuItem } from '../../../models/menu-item';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, TooltipModule],
  templateUrl: './sidebar-nav.component.html',
  styleUrl: './sidebar-nav.component.scss',
})
export class SidebarNavComponent {
  @Input({ required: true }) groups: VisibleGroup[] = [];
  @Input() collapsed = false;

  trackByGroup(_: number, g: VisibleGroup) { return (g.label ?? '') + '_' + _; }
  trackByItem(_: number, item: FlatMenuItem) { return item.url + '_' + _; }

  toggleGroup(group: VisibleGroup): void {
    if (!this.collapsed && this.hasItems(group)) {
      group.expanded = !group.expanded;
    }
  }

  hasItems(group: VisibleGroup): boolean {
    return !!(group._flattened?.length || group.items?.length);
  }

  getPath(url?: string): string {
    if (!url) return '';
    const i = url.indexOf('?');
    return i === -1 ? url : url.substring(0, i);
  }

  getQueryParams(url?: string): Record<string, string> {
    if (!url?.includes('?')) return {};
    const params: Record<string, string> = {};
    url.split('?')[1].split('&').forEach(p => {
      const [k, v] = p.split('=');
      if (k) params[k] = v ?? '';
    });
    return params;
  }

  getTooltip(item: FlatMenuItem): string {
    return this.collapsed ? item.label : '';
  }
}
