import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthServices } from './core/services/auth.services';
import { LoadingService } from './core/services/loading.service';
import { ToastComponent } from './shared/component/toast/toast.component';
import { SimpleLoadingComponent } from './shared/component/simple-loading/simple-loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, SimpleLoadingComponent, CommonModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  showLoading = true;

  constructor(
    private auth: AuthServices,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.initializeApp();
  }

  private initializeApp() {
    // Don't call /authentication/me globally during app init.
    // The application will fetch user data only when necessary (e.g. on Settings page).
    this.hideLoading();
  }

  private hideLoading() {
    // Short delay for smooth transition
    setTimeout(() => {
      this.showLoading = false;
    }, 200);
  }
}
