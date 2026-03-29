import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ItineraryItem } from '../../models/travel.model';

@Component({
  selector: 'app-itinerary-timeline',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  animations: [
    trigger('timelineItemAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('staggerTrigger', [
      transition('* => *', [
        query(':enter', [
          stagger('80ms', [
            animate('1ms', style({ opacity: 0 })) // placeholder for staggered items
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <div class="timeline-container" [@staggerTrigger]="items.length">
      <div *ngFor="let item of items; let i = index; let last = last" 
           class="timeline-item group" 
           [@timelineItemAnimation]>
        
        <!-- Vertical Line -->
        <div class="timeline-line-wrapper">
          <div class="timeline-dot" [class.latest]="i === 0"></div>
          <div *ngIf="!last" class="timeline-line"></div>
        </div>

        <!-- Content Card -->
        <div class="timeline-content blur-effect group-hover:shadow-lg transition-all">
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="time-badge">{{ item.time || 'All day' }}</span>
              <h4 class="text-base font-bold text-gray-900 m-0 mt-1">{{ item.title }}</h4>
            </div>
            <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="onDelete.emit(item)"></p-button>
          </div>
          
          <p class="text-sm text-gray-600 m-0 line-clamp-2">{{ item.description || 'No additional details.' }}</p>
          
          <div *ngIf="item.date" class="mt-3 flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
            <i class="pi pi-calendar"></i>
            <span>{{ item.date }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="items.length === 0" class="text-center py-10">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-calendar-plus text-gray-300 text-2xl"></i>
        </div>
        <p class="text-gray-500 italic">No milestones planned yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .timeline-container { position: relative; padding: 1rem 0; }
    
    .timeline-item {
      display: grid;
      grid-template-columns: 40px 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .timeline-item:last-child { margin-bottom: 0; }

    .timeline-line-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    
    .timeline-dot {
      width: 12px; height: 12px;
      border-radius: 50%;
      background: #e2e8f0;
      border: 2px solid #fff;
      box-shadow: 0 0 0 4px #f8fafc;
      z-index: 2;
    }
    .timeline-dot.latest { background: #3b82f6; box-shadow: 0 0 0 4px #eff6ff; }

    .timeline-line {
      flex: 1;
      width: 2px;
      background: #f1f5f9;
      margin-top: 0.5rem;
      margin-bottom: -1.5rem;
    }

    .timeline-content {
      padding: 1.25rem;
      border-radius: 1.25rem;
      border: 1px solid rgba(255,255,255,0.4);
      background: rgba(255,255,255,0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .time-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      background: #f1f5f9;
      color: #64748b;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ItineraryTimelineComponent {
  @Input() items: ItineraryItem[] = [];
  @Output() onDelete = new EventEmitter<ItineraryItem>();
}
