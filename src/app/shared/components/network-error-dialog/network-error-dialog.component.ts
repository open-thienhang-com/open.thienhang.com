import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-network-error-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [modal]="true" 
      [closable]="false"
      [closeOnEscape]="false"
      [style]="{width: '500px'}"
      styleClass="network-error-dialog">
      
      <ng-template pTemplate="header">
        <div class="flex items-center gap-2">
          <i class="pi pi-wifi text-2xl text-red-500"></i>
          <span class="font-semibold text-lg">No Internet Connection</span>
        </div>
      </ng-template>

      <div class="py-4">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <i class="pi pi-wifi text-4xl text-red-500"></i>
          </div>
        </div>
        
        <p class="text-surface-700 dark:text-surface-300 mb-4 text-center">
          {{ message }}
        </p>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
          <p class="text-sm text-blue-800 dark:text-blue-300">
            <strong class="block mb-2">Troubleshooting Tips:</strong>
          </p>
          <ul class="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>Check your WiFi or mobile data connection</li>
            <li>Verify your router is working properly</li>
            <li>Try disconnecting and reconnecting to your network</li>
            <li>Restart your device if the problem persists</li>
          </ul>
        </div>

        <div class="mt-4 p-3 bg-surface-100 dark:bg-surface-800 rounded-lg flex items-center gap-2">
          <div [ngClass]="{
            'w-3 h-3 rounded-full': true,
            'bg-green-500 animate-pulse': isOnline,
            'bg-red-500': !isOnline
          }"></div>
          <span class="text-sm text-surface-600 dark:text-surface-400">
            Status: <strong [ngClass]="isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ isOnline ? 'Connected' : 'Disconnected' }}
            </strong>
          </span>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-center gap-2">
          <button 
            pButton 
            [label]="checking ? 'Checking...' : 'Check Connection'" 
            icon="pi pi-refresh" 
            [loading]="checking"
            (click)="onCheckConnection()">
          </button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .network-error-dialog {
      .p-dialog-header {
        background: var(--surface-0);
        border-bottom: 1px solid var(--surface-200);
      }
      
      .p-dialog-content {
        background: var(--surface-0);
      }
      
      .p-dialog-footer {
        background: var(--surface-0);
        border-top: 1px solid var(--surface-200);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: .5;
      }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class NetworkErrorDialogComponent {
  @Input() visible: boolean = false;
  @Input() message: string = 'Please check your internet connection and try again.';
  @Input() checking: boolean = false;
  @Input() isOnline: boolean = false;

  @Output() checkConnection = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  onCheckConnection(): void {
    this.checkConnection.emit();
  }
}
