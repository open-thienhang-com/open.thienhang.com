import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../shared/component/loading/loading.component';
import { AppInitializationService } from '../../core/services/app-initialization.service';

@Component({
  selector: 'app-loading-page',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './loading-page.component.html',
  styleUrls: ['./loading-page.component.scss']
})
export class LoadingPageComponent implements OnInit {
  currentMessage = '';
  currentType: 'default' | 'dots' | 'spinner' | 'pulse' | 'bounce' | 'wave' | 'bars' | 'data-flow' = 'default';
  progress = 0;
  isRefresh = false;
  
  welcomeMessages = [
    'Welcome to Thienhang Data Platform! 🚀',
    'Initializing your data journey...',
    'Loading your governance dashboard...',
    'Preparing data insights...',
    'Setting up your workspace...',
    'Almost ready to explore! ✨'
  ];

  refreshMessages = [
    'Refreshing your experience! 🔄',
    'Reloading your workspace...',
    'Updating data views...',
    'Syncing your preferences...',
    'Preparing fresh content...',
    'Ready to continue! ⚡'
  ];

  loadingTypes: Array<'default' | 'dots' | 'spinner' | 'pulse' | 'bounce' | 'wave' | 'bars' | 'data-flow'> = [
    'default', 'data-flow', 'pulse', 'wave', 'bounce'
  ];

  constructor(private appInitService: AppInitializationService) {}

  ngOnInit() {
    this.startInitialization();
  }

  private startInitialization() {
    this.appInitService.startInitialization(this.isRefresh).subscribe({
      next: (state) => {
        this.currentMessage = state.currentStep;
        this.progress = state.progress;
        this.isRefresh = state.isRefresh;
        
        // Change loading type based on progress
        const typeIndex = Math.floor((state.progress / 100) * this.loadingTypes.length);
        this.currentType = this.loadingTypes[Math.min(typeIndex, this.loadingTypes.length - 1)];
      },
      complete: () => {
        this.currentMessage = this.isRefresh ? 'Refreshed! ✨' : 'Welcome! 🎉';
        this.progress = 100;
      }
    });
  }

  getMessages(): string[] {
    return this.isRefresh ? this.refreshMessages : this.welcomeMessages;
  }

  getMainTitle(): string {
    return this.isRefresh ? 'Refreshing...' : 'Welcome to Thienhang';
  }

  getMainSubtitle(): string {
    return this.isRefresh ? 'Updating your workspace' : 'Data Platform';
  }
}
