import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() type: 'default' | 'dots' | 'spinner' | 'pulse' | 'bounce' | 'wave' | 'bars' | 'data-flow' = 'default';
  @Input() message: string = 'Loading...';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() overlay: boolean = false;
  @Input() fullScreen: boolean = false;

  // Fun loading messages that rotate
  funMessages = [
    'Cooking up something amazing...',
    'Gathering data particles...',
    'Spinning up the magic...',
    'Fetching your awesome content...',
    'Brewing the perfect experience...',
    'Loading with style...',
    'Almost there, hang tight!',
    'Making things beautiful...',
    'Preparing your data feast...',
    'Just a moment of zen...'
  ];

  currentMessageIndex = 0;

  ngOnInit() {
    // Rotate fun messages every 2 seconds
    if (this.message === 'Loading...') {
      this.rotateMessages();
    }
  }

  private rotateMessages() {
    setInterval(() => {
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.funMessages.length;
    }, 2000);
  }

  getCurrentMessage(): string {
    return this.message === 'Loading...' ? this.funMessages[this.currentMessageIndex] : this.message;
  }
}
