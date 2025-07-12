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
  @Input() type: 'default' | 'dots' | 'spinner' | 'pulse' | 'bounce' | 'wave' | 'bars' | 'data-flow' | 'cat-running' | 'dog-running' | 'rabbit-hopping' | 'penguin-walking' | 'hamster-wheel' | 'fox-trotting' | 'unicorn-flying' | 'owl-flying' | 'butterfly-floating' | 'fish-swimming' | 'panda-rolling' | 'koala-climbing' | 'sloth-hanging' | 'duck-swimming' = 'default';
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
    ],
    'dog-running': [
      'Fetching your data...',
      'Wagging through the load...',
      'Paws-ing for processing...',
      'Barking up the right tree...',
      'Good boy, almost there!'
    ],
    'rabbit-hopping': [
      'Hopping to it...',
      'Bouncing through bytes...',
      'Ears up, eyes on data...',
      'Carrot-ing about your wait...',
      'Hippity-hoppity, here we go!'
    ],
    'penguin-walking': [
      'Waddling through workflows...',
      'Sliding into your content...',
      'Ice-cold data processing...',
      'Penguin-perfect precision...',
      'Chilling while we work!'
    ],
    'hamster-wheel': [
      'Running in circles... productively!',
      'Hamster-powered processing...',
      'Spinning up the good stuff...',
      'Wheel-y working hard...',
      'Tiny paws, big results!'
    ],
    'fox-trotting': [
      'Sly-ly loading your data...',
      'Fox-tastic processing...',
      'Cunning data compilation...',
      'Trotting towards completion...',
      'Foxy and fast!'
    ],
    'unicorn-flying': [
      'Magical data processing...',
      'Sprinkling rainbow dust...',
      'Flying through the clouds...',
      'Unicorn-powered loading...',
      'Making magic happen!'
    ],
    'owl-flying': [
      'Wise loading in progress...',
      'Hooting through the data...',
      'Night owl working late...',
      'Owl-ways getting it right...',
      'Swooping in with results!'
    ],
    'butterfly-floating': [
      'Gracefully loading data...',
      'Fluttering through files...',
      'Beautiful transformation...',
      'Dancing with data...',
      'Light as a feather!'
    ],
    'fish-swimming': [
      'Swimming through streams...',
      'Diving deep for data...',
      'Going with the flow...',
      'Schools of data loading...',
      'Making waves in processing!'
    ],
    'panda-rolling': [
      'Rolling through the bamboo...',
      'Panda-stic data processing...',
      'Tumbling towards completion...',
      'Bear-y close to finishing...',
      'Bamboo-zled by the speed!'
    ],
    'koala-climbing': [
      'Climbing the eucalyptus tree...',
      'Koala-ty data processing...',
      'Hanging in there...',
      'Branch-ing out to find data...',
      'Eucalyptus-tic about results!'
    ],
    'sloth-hanging': [
      'Taking it slow and steady...',
      'Sloth-ing towards completion...',
      'Hanging around for data...',
      'Slow and steady wins the race...',
      'Chilling while processing!'
    ],
    'duck-swimming': [
      'Paddling through data streams...',
      'Duck-ing into the details...',
      'Quacking the code...',
      'Making ripples in the data...',
      'Smooth as a duck on water!'
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
    const animalTypes = ['cat-running', 'dog-running', 'rabbit-hopping', 'penguin-walking', 'hamster-wheel', 'fox-trotting', 'unicorn-flying', 'owl-flying', 'butterfly-floating', 'fish-swimming', 'panda-rolling', 'koala-climbing', 'sloth-hanging', 'duck-swimming'];
    if (animalTypes.includes(this.type)) {
      const messages = this.animalMessages[this.type as keyof typeof this.animalMessages];
      return messages[this.currentMessageIndex % messages.length];
    }
    
    return this.funMessages[this.currentMessageIndex];
  }
}
