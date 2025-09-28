import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "./header/header.component";
import { RouterOutlet } from "@angular/router";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { FooterComponent } from "./footer/footer.component";
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ThemeService } from '../../core/services/theme.service';
import { LoadingService, LoadingState } from '../../core/services/loading.service';
import { LoadingComponent } from '../../shared/component/loading/loading.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  imports: [
    CommonModule,
    HeaderComponent,
    RouterOutlet,
    SidebarComponent,
    FooterComponent,
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

  // Array of cute animal animations for random selection
  animalTypes: ('cat-running' | 'dog-running' | 'rabbit-hopping' | 'penguin-walking' | 'hamster-wheel' | 'fox-trotting' | 'unicorn-flying' | 'owl-flying' | 'butterfly-floating' | 'fish-swimming' | 'panda-rolling' | 'koala-climbing' | 'sloth-hanging' | 'duck-swimming')[] = [
    'cat-running', 'dog-running', 'rabbit-hopping', 'penguin-walking', 'hamster-wheel',
    'fox-trotting', 'unicorn-flying', 'owl-flying', 'butterfly-floating', 'fish-swimming',
    'panda-rolling', 'koala-climbing', 'sloth-hanging', 'duck-swimming'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    // Show beautiful loading animation on page refresh/initial load
    this.showInitialLoading();

    // Subscribe to theme changes and update sidebar state
    this.themeService.currentSettings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.collapsed = settings.sidebarStyle === 'static' ? false : this.collapsed;
      });

    // Subscribe to loading state changes with random animal selection
    this.loadingService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loadingState => {
        // If loading is starting and no specific type is set, use a random animal
        if (loadingState.isLoading && loadingState.type === 'default') {
          loadingState.type = this.getRandomAnimalType();
        }

        this.loadingState = {
          ...loadingState,
          fullScreen: true, // Make loading full screen for better UX
          size: 'large' // Use large size for better visibility
        };
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

  private getRandomAnimalType(): 'cat-running' | 'dog-running' | 'rabbit-hopping' | 'penguin-walking' | 'hamster-wheel' | 'fox-trotting' | 'unicorn-flying' | 'owl-flying' | 'butterfly-floating' | 'fish-swimming' | 'panda-rolling' | 'koala-climbing' | 'sloth-hanging' | 'duck-swimming' {
    const randomIndex = Math.floor(Math.random() * this.animalTypes.length);
    return this.animalTypes[randomIndex];
  }

  /**
   * Show beautiful loading animation on page refresh/initial load
   */
  private showInitialLoading(): void {
    // Show loading for a beautiful initial experience
    const randomAnimal = this.getRandomAnimalType();

    this.loadingService.showFullScreen(
      'Welcome back! Loading your awesome experience...',
      randomAnimal
    );

    // Hide loading after a short delay to allow content to load
    setTimeout(() => {
      this.loadingService.hide();
    }, 2000);
  }
}
