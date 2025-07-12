import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from "./header/header.component";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ThemeService } from '../../core/services/theme.service';
import { LoadingService, LoadingState } from '../../core/services/loading.service';
import { LoadingComponent } from '../../shared/component/loading/loading.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  imports: [
    HeaderComponent,
    RouterOutlet,
    SidebarComponent,
    Toast,
    ConfirmDialog,
    LoadingComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  collapsed = false;
  sidebarOpen = false;
  loadingState: LoadingState = {
    isLoading: false,
    message: 'Loading...',
    type: 'default',
    size: 'medium',
    fullScreen: false,
    overlay: false
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    // Subscribe to theme changes and update sidebar state
    this.themeService.currentSettings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.collapsed = settings.sidebarStyle === 'static' ? false : this.collapsed;
      });

    // Subscribe to loading state changes
    this.loadingService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loadingState => {
        this.loadingState = loadingState;
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
