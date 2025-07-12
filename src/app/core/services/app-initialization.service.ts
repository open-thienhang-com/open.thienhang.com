import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppInitializationState {
  isInitializing: boolean;
  isRefresh: boolean;
  currentStep: string;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppInitializationService {
  private initializationState = new BehaviorSubject<AppInitializationState>({
    isInitializing: false,
    isRefresh: false,
    currentStep: '',
    progress: 0
  });

  public state$ = this.initializationState.asObservable();

  private initSteps = [
    { step: 'Initializing application...', duration: 800 },
    { step: 'Loading user preferences...', duration: 600 },
    { step: 'Setting up workspace...', duration: 500 },
    { step: 'Preparing dashboard...', duration: 700 },
    { step: 'Almost ready...', duration: 400 }
  ];

  constructor() {
    this.detectRefresh();
  }

  private detectRefresh() {
    // Check if this is a page refresh
    const isRefresh = sessionStorage.getItem('isRefresh') === 'true';
    if (isRefresh) {
      this.updateState({ isRefresh: true });
      sessionStorage.removeItem('isRefresh');
    }
    
    // Set flag for next potential refresh
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('isRefresh', 'true');
    });
  }

  startInitialization(isRefresh: boolean = false): Observable<AppInitializationState> {
    return new Observable(subscriber => {
      this.updateState({
        isInitializing: true,
        isRefresh,
        currentStep: 'Loading...',
        progress: 0
      });

      let currentStepIndex = 0;
      let totalProgress = 0;

      const processNextStep = () => {
        if (currentStepIndex >= this.initSteps.length) {
          // Initialization complete
          this.updateState({
            isInitializing: false,
            isRefresh: false,
            currentStep: 'Ready!',
            progress: 100
          });
          subscriber.complete();
          return;
        }

        const currentStep = this.initSteps[currentStepIndex];
        const progressIncrement = 100 / this.initSteps.length;
        totalProgress += progressIncrement;

        this.updateState({
          isInitializing: true,
          isRefresh,
          currentStep: currentStep.step,
          progress: Math.min(totalProgress, 100)
        });

        subscriber.next(this.initializationState.value);

        setTimeout(() => {
          currentStepIndex++;
          processNextStep();
        }, currentStep.duration);
      };

      processNextStep();
    });
  }

  private updateState(partialState: Partial<AppInitializationState>) {
    const currentState = this.initializationState.value;
    this.initializationState.next({
      ...currentState,
      ...partialState
    });
  }

  getCurrentState(): AppInitializationState {
    return this.initializationState.value;
  }

  isInitializing(): boolean {
    return this.initializationState.value.isInitializing;
  }

  isRefresh(): boolean {
    return this.initializationState.value.isRefresh;
  }
}
