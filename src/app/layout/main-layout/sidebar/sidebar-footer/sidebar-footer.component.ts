import { Component, Input, Output, EventEmitter, computed, Signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { OverlayPanel } from 'primeng/overlaypanel';
import { SidebarThemeService } from '../../../../core/services/sidebar-theme.service';

@Component({
  selector: 'app-sidebar-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TooltipModule, OverlayPanelModule, SelectButtonModule, ToggleSwitchModule],
  templateUrl: './sidebar-footer.component.html',
  styleUrl: './sidebar-footer.component.scss',
})
export class SidebarFooterComponent {
  @Input({ required: true }) currentUser!: Signal<any>;
  @Input({ required: true }) sidebarTheme!: SidebarThemeService;
  @Input() collapsed = false;
  @Output() logout = new EventEmitter<void>();
  @Output() openProfile = new EventEmitter<void>();
  @Output() openSwitcher = new EventEmitter<MouseEvent>();

  @ViewChild('userMenuPanel') userMenuPanel!: OverlayPanel;

  isLoggedIn = computed(() => !!this.currentUser());

  fullName = computed(() => {
    const u = this.currentUser();
    if (!u) return 'Guest';
    const first = u.first_name || u.firstName || '';
    const last  = u.last_name  || u.lastName  || '';
    if (first || last) return `${first} ${last}`.trim();
    return u.full_name || u.fullName || u.name || u.email?.split('@')[0] || 'User';
  });

  email = computed(() => this.currentUser()?.email || '');

  initials = computed(() => {
    const name = this.fullName();
    if (!name || name === 'User' || name === 'Guest') return 'U';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (parts[0]?.[0] || 'U').toUpperCase();
  });

  tenantLabel = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    const display = u.tenant_display_name || u.tenantDisplayName;
    if (display) return display;
    const id: string = u.tenant_id || u.tenantId || '';
    if (!id || id === '*' || id === 'system') return 'System';
    return id.length > 14 ? id.substring(0, 12) + '…' : id;
  });

  roleLabel = computed(() => {
    const u = this.currentUser();
    if (!u) return '';
    const roles: string[] = u.roles ?? (u.role ? [u.role] : []);
    if (!roles.length) return '';
    return roles[0].replace(/^role:/i, '').toLowerCase();
  });

  toggleMenu(event: MouseEvent) { this.userMenuPanel?.toggle(event); }
  onSwitchUser(event: MouseEvent) { this.userMenuPanel?.hide(); this.openSwitcher.emit(event); }
  onOpenProfile() { this.userMenuPanel?.hide(); this.openProfile.emit(); }
  onLogout() { this.userMenuPanel?.hide(); this.logout.emit(); }
}
