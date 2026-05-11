import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let toast of toasts; trackBy: trackByFn"
        class="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out"
        [ngClass]="{
          'border-l-4 border-green-500': toast.type === 'success',
          'border-l-4 border-red-500': toast.type === 'error',
          'border-l-4 border-yellow-500': toast.type === 'warning',
          'border-l-4 border-blue-500': toast.type === 'info'
        }">
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <i [ngClass]="getIconClass(toast.type)" class="text-lg"></i>
            </div>
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ toast.title }}
              </p>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                class="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                (click)="remove(toast.id)">
                <span class="sr-only">Close</span>
                <i class="pi pi-times text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toasts => {
        this.toasts = toasts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  remove(id: string): void {
    this.toastService.remove(id);
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'pi pi-check-circle text-green-500';
      case 'error':
        return 'pi pi-times-circle text-red-500';
      case 'warning':
        return 'pi pi-exclamation-triangle text-yellow-500';
      case 'info':
        return 'pi pi-info-circle text-blue-500';
      default:
        return 'pi pi-info-circle text-blue-500';
    }
  }

  trackByFn(index: number, item: ToastMessage): string {
    return item.id;
  }
}
