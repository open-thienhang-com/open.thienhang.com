import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="simple-loading-overlay">
      <div class="simple-loading-content">
        <div class="simple-spinner"></div>
        <p class="simple-loading-text">Loading...</p>
      </div>
    </div>
  `,
  styles: [`
    .simple-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(2px);
    }

    .simple-loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .simple-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e0e0e0;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: simple-spin 1s linear infinite;
    }

    .simple-loading-text {
      color: #666;
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    }

    @keyframes simple-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class SimpleLoadingComponent {
}