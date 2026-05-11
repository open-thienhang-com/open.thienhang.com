import { Component, Input, ElementRef, Renderer2 } from '@angular/core';
import {NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  imports: [
    NgStyle,
    NgIf
  ],
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() icon: string = 'pi pi-dollar';
  @Input() value: string = '1.2M';
  @Input() label: string = 'Total Sales';
  @Input() buttonLabel: string = 'View Report';
  @Input() iconBg: string = '#6B4F35'; // customizable icon background

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  handleRipple(event: MouseEvent) {
    const card = this.elRef.nativeElement.querySelector('.card');
    const ripple = this.renderer.createElement('span');

    const size = Math.max(card.offsetWidth, card.offsetHeight) * 2;
    const centerX = card.offsetWidth / 2;

    this.renderer.addClass(ripple, 'ripple');
    this.renderer.setStyle(ripple, 'width', `${size}px`);
    this.renderer.setStyle(ripple, 'height', `${size}px`);
    this.renderer.setStyle(ripple, 'left', `${centerX}px`);
    this.renderer.setStyle(ripple, 'top', `0px`);

    card.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }
}
