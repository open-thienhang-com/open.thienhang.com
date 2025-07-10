import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ThemeService } from '../../core/services/theme.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  imports: [
    HeaderComponent,
    RouterOutlet,
    SidebarComponent,
    Toast,
    ConfirmDialog
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  collapsed = false;
  sidebarOpen = false;
  private destroy$ = new Subject<void>();

  constructor(private themeService: ThemeService) { }

  ngOnInit() {
    // Subscribe to theme changes and update sidebar state
    this.themeService.currentSettings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.collapsed = settings.sidebarStyle === 'static' ? false : this.collapsed;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    if (window.innerWidth < 1024) {
      this.sidebarOpen = !this.sidebarOpen;
    } else {
      this.collapsed = !this.collapsed;
    }
  }
}
