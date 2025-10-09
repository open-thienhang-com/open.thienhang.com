import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-retry-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog 
      [(visible)]="visible" 
      [modal]="true" 
      [closable]="false"
      [closeOnEscape]="false"
      [style]="{width: '450px'}"
      styleClass="retry-dialog">
      
      <ng-template pTemplate="header">
        <div class="flex items-center gap-2">
          <i class="pi pi-exclamation-triangle text-2xl text-orange-500"></i>
          <span class="font-semibold text-lg">{{ title }}</span>
        </div>
      </ng-template>

      <div class="py-4">
        <p class="text-surface-700 dark:text-surface-300 mb-4">
          {{ message }}
        </p>
        
        <div class="bg-surface-100 dark:bg-surface-800 p-4 rounded-lg">
          <p class="text-sm text-surface-600 dark:text-surface-400">
            <strong>Error Details:</strong><br>
            {{ errorDetails }}
          </p>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <button 
            pButton 
            label="Cancel" 
            icon="pi pi-times" 
            class="p-button-text p-button-secondary"
            (click)="onCancel()">
          </button>
          <button 
            pButton 
            [label]="retrying ? 'Retrying...' : 'Retry'" 
            icon="pi pi-refresh" 
            [loading]="retrying"
            (click)="onRetry()">
          </button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .retry-dialog {
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
  `]
})
export class RetryDialogComponent {
  @Input() visible: boolean = false;
  @Input() title: string = 'Server Error';
  @Input() message: string = 'The server encountered an error. Would you like to retry?';
  @Input() errorDetails: string = '';
  @Input() retrying: boolean = false;
  
  @Output() retry = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  onRetry(): void {
    this.retry.emit();
  }

  onCancel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }
}
