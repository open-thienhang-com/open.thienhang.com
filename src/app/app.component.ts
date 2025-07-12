import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthServices } from './core/services/auth.services';
import { LoadingService } from './core/services/loading.service';
import { AppInitializationService } from './core/services/app-initialization.service';
import { ToastComponent } from './shared/component/toast/toast.component';
import { LoadingPageComponent } from './pages/loading-page/loading-page.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoadingPageComponent, CommonModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  showLoadingPage = true;

  constructor(
    private auth: AuthServices,
    private loadingService: LoadingService,
    private appInitService: AppInitializationService
  ) {}

  ngOnInit() {
    this.initializeApp();
  }

  private initializeApp() {
    const isRefresh = this.appInitService.isRefresh();
    
    this.appInitService.startInitialization(isRefresh).subscribe({
      next: (state) => {
        // Loading state is handled by the LoadingPageComponent
        console.log('App initialization progress:', state);
      },
      complete: () => {
        // Initialize authentication after app setup
        this.auth.getCurrentUser().subscribe({
          next: (response) => {
            console.log('User authentication status:', response);
            this.hideLoadingPage();
          },
          error: (error) => {
            console.error('Authentication error:', error);
            this.hideLoadingPage();
          }
        });
      }
    });
  }

  private hideLoadingPage() {
    // Add a small delay for smooth transition
    setTimeout(() => {
      this.showLoadingPage = false;
    }, 500);
  }
}
