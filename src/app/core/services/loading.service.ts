import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  type?: 'default' | 'dots' | 'spinner' | 'pulse' | 'bounce' | 'wave' | 'bars' | 'data-flow';
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
  overlay?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingState = new BehaviorSubject<LoadingState>({
    isLoading: false,
    message: 'Loading...',
    type: 'default',
    size: 'medium',
    fullScreen: false,
    overlay: false
  });

  public loading$ = this.loadingState.asObservable();

  constructor() { }

  /**
   * Show loading with specified configuration
   */
  show(config?: Partial<LoadingState>): void {
    const currentState = this.loadingState.value;
    const newState: LoadingState = {
      ...currentState,
      ...config,
      isLoading: true
    };
    this.loadingState.next(newState);
  }

  /**
   * Hide loading
   */
  hide(): void {
    const currentState = this.loadingState.value;
    this.loadingState.next({
      ...currentState,
      isLoading: false
    });
  }

  /**
   * Show full screen loading
   */
  showFullScreen(message?: string, type?: LoadingState['type']): void {
    this.show({
      message: message || 'Loading...',
      type: type || 'default',
      fullScreen: true,
      overlay: false,
      size: 'large'
    });
  }

  /**
   * Show overlay loading
   */
  showOverlay(message?: string, type?: LoadingState['type']): void {
    this.show({
      message: message || 'Loading...',
      type: type || 'default',
      fullScreen: false,
      overlay: true,
      size: 'medium'
    });
  }

  /**
   * Show page-level loading
   */
  showPageLoading(message?: string, type?: LoadingState['type']): void {
    this.show({
      message: message || 'Loading...',
      type: type || 'default',
      fullScreen: false,
      overlay: false,
      size: 'large'
    });
  }

  /**
   * Show inline loading (small size)
   */
  showInline(message?: string, type?: LoadingState['type']): void {
    this.show({
      message: message || 'Loading...',
      type: type || 'dots',
      fullScreen: false,
      overlay: false,
      size: 'small'
    });
  }

  /**
   * Get current loading state
   */
  getCurrentState(): LoadingState {
    return this.loadingState.value;
  }

  /**
   * Check if currently loading
   */
  isLoading(): boolean {
    return this.loadingState.value.isLoading;
  }

  /**
   * Wrap an observable with loading state
   */
  wrapWithLoading<T>(
    observable: Observable<T>,
    config?: Partial<LoadingState>
  ): Observable<T> {
    return new Observable(subscriber => {
      this.show(config);
      
      const subscription = observable.subscribe({
        next: (value) => {
          subscriber.next(value);
        },
        error: (error) => {
          this.hide();
          subscriber.error(error);
        },
        complete: () => {
          this.hide();
          subscriber.complete();
        }
      });

      return () => {
        this.hide();
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Wrap a promise with loading state
   */
  async wrapWithLoadingPromise<T>(
    promise: Promise<T>,
    config?: Partial<LoadingState>
  ): Promise<T> {
    this.show(config);
    try {
      const result = await promise;
      this.hide();
      return result;
    } catch (error) {
      this.hide();
      throw error;
    }
  }
}
