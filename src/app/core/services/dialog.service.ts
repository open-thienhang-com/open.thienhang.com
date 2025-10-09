import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface RetryDialogConfig {
  title?: string;
  message?: string;
  errorDetails?: string;
}

export interface NetworkErrorDialogConfig {
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  // Retry Dialog State
  private retryDialogVisible$ = new BehaviorSubject<boolean>(false);
  private retryDialogConfig$ = new BehaviorSubject<RetryDialogConfig>({});
  private retryDialogRetrying$ = new BehaviorSubject<boolean>(false);
  private retrySubject$ = new Subject<void>();

  // Network Error Dialog State
  private networkDialogVisible$ = new BehaviorSubject<boolean>(false);
  private networkDialogConfig$ = new BehaviorSubject<NetworkErrorDialogConfig>({});
  private networkDialogChecking$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  // Retry Dialog Methods
  showRetryDialog(config: RetryDialogConfig = {}): Observable<void> {
    this.retryDialogConfig$.next({
      title: config.title || 'Server Error',
      message: config.message || 'The server encountered an error. Would you like to retry?',
      errorDetails: config.errorDetails || 'Unknown error occurred'
    });
    this.retryDialogVisible$.next(true);
    
    return new Observable(observer => {
      const subscription = this.retrySubject$.subscribe(() => {
        observer.next();
        observer.complete();
      });
      
      return () => subscription.unsubscribe();
    });
  }

  hideRetryDialog(): void {
    this.retryDialogVisible$.next(false);
    this.retryDialogRetrying$.next(false);
  }

  setRetryDialogRetrying(retrying: boolean): void {
    this.retryDialogRetrying$.next(retrying);
  }

  emitRetry(): void {
    this.retrySubject$.next();
  }

  getRetryDialogState() {
    return {
      visible$: this.retryDialogVisible$.asObservable(),
      config$: this.retryDialogConfig$.asObservable(),
      retrying$: this.retryDialogRetrying$.asObservable()
    };
  }

  // Network Error Dialog Methods
  showNetworkErrorDialog(config: NetworkErrorDialogConfig = {}): void {
    this.networkDialogConfig$.next({
      message: config.message || 'Please check your internet connection and try again.'
    });
    this.networkDialogVisible$.next(true);
  }

  hideNetworkErrorDialog(): void {
    this.networkDialogVisible$.next(false);
    this.networkDialogChecking$.next(false);
  }

  setNetworkDialogChecking(checking: boolean): void {
    this.networkDialogChecking$.next(checking);
  }

  getNetworkDialogState() {
    return {
      visible$: this.networkDialogVisible$.asObservable(),
      config$: this.networkDialogConfig$.asObservable(),
      checking$: this.networkDialogChecking$.asObservable()
    };
  }
}
