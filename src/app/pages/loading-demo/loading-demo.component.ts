import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../shared/component/loading/loading.component';

@Component({
  selector: 'app-loading-demo',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './loading-demo.component.html',
  styleUrls: ['./loading-demo.component.scss']
})
export class LoadingDemoComponent {
  loadingTypes = [
    { type: 'default', label: 'Default Data Mesh' },
    { type: 'dots', label: 'Dots' },
    { type: 'spinner', label: 'Spinner' },
    { type: 'pulse', label: 'Pulse' },
    { type: 'bounce', label: 'Bounce' },
    { type: 'wave', label: 'Wave' },
    { type: 'bars', label: 'Bars' },
    { type: 'data-flow', label: 'Data Flow' },
    { type: 'cat-running', label: '🐱 Cat Running' },
    { type: 'dog-running', label: '🐕 Dog Running' },
    { type: 'rabbit-hopping', label: '🐰 Rabbit Hopping' },
    { type: 'penguin-walking', label: '🐧 Penguin Walking' },
    { type: 'hamster-wheel', label: '🐹 Hamster Wheel' },
    { type: 'fox-trotting', label: '🦊 Fox Trotting' }
  ];

  currentType: any = 'cat-running';
  currentSize: 'small' | 'medium' | 'large' = 'medium';
  overlay = false;
  fullScreen = false;

  changeType(type: any) {
    this.currentType = type;
  }

  changeSize(size: 'small' | 'medium' | 'large') {
    this.currentSize = size;
  }

  toggleOverlay() {
    this.overlay = !this.overlay;
  }

  toggleFullScreen() {
    this.fullScreen = !this.fullScreen;
  }

  get currentTypeLabel(): string {
    const found = this.loadingTypes.find(t => t.type === this.currentType);
    return found ? found.label : 'Unknown';
  }

  get shouldShowAnimalDescriptions(): boolean {
    return this.currentType.includes('running') || 
           this.currentType.includes('hopping') || 
           this.currentType.includes('walking') || 
           this.currentType.includes('wheel') || 
           this.currentType.includes('trotting');
  }
}
