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
  @Input() type: 'default' | 'dots' | 'spinner' | 'pulse' | 'bounce' | 'wave' | 'bars' | 'data-flow' | 'cat-running' = 'default';
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

  // Animal-specific messages
  animalMessages = {
    'cat-running': [
      'Purring through the data...',
      'Chasing down your content...',
      'Pawing through the files...',
      'Meow-ing data into place...',
      'Feline fine, almost ready!'
    ]
  };

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
    if (this.message !== 'Loading...') {
      return this.message;
    }

    // Check if it's an animal type
    const animalTypes = ['cat-running'];
    if (animalTypes.includes(this.type)) {
      const messages = this.animalMessages[this.type as keyof typeof this.animalMessages];
      return messages[this.currentMessageIndex % messages.length];
    }

    return this.funMessages[this.currentMessageIndex];
  }
}
