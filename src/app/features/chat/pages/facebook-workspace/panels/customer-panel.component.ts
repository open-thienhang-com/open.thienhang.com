import {
  Component, Input, Output, EventEmitter, OnDestroy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ChatService } from '../../../services/chat.service';
import { TelegramConversation, CustomerSummary } from '../../../models/chat.model';

@Component({
  selector: 'app-customer-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, SkeletonModule, TagModule],
  template: `
    <div class="customer-panel p-4">
      <!-- Linked customer card -->
      <div *ngIf="linkedCustomer" class="linked-customer-card mb-4">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-xs text-gray-500 mb-1">Linked customer</p>
            <strong class="block text-sm">{{ linkedCustomer.name }}</strong>
            <span class="text-xs text-gray-500">{{ linkedCustomer.phone }}</span>
            <span *ngIf="linkedCustomer.email" class="block text-xs text-gray-400">{{ linkedCustomer.email }}</span>
            <div class="flex items-center gap-2 mt-2">
              <p-tag [value]="linkedCustomer.customer_type" severity="info"></p-tag>
              <p-tag *ngIf="linkedCustomer.is_active" value="Active" severity="success"></p-tag>
              <p-tag *ngIf="!linkedCustomer.is_active" value="Inactive" severity="secondary"></p-tag>
            </div>
          </div>
          <button type="button" class="ghost-action text-xs" (click)="unlink()" [disabled]="linking">
            <i class="pi pi-times mr-1"></i>Unlink
          </button>
        </div>
      </div>

      <!-- Search box -->
      <div class="mb-3">
        <p class="text-xs text-gray-500 mb-2">{{ linkedCustomer ? 'Re-link to another customer' : 'Link to retail customer' }}</p>
        <div class="relative">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            class="form-input pl-8 w-full text-sm"
            [(ngModel)]="searchKeyword"
            (ngModelChange)="onSearch($event)"
            placeholder="Search name, phone, or email..."
          />
        </div>
      </div>

      <!-- Search results dropdown -->
      <div *ngIf="searching" class="py-3 text-center">
        <p-skeleton height="2rem" styleClass="mb-1"></p-skeleton>
        <p-skeleton height="2rem" styleClass="mb-1"></p-skeleton>
      </div>

      <div *ngIf="!searching && searchResults.length > 0" class="customer-search-results">
        <button
          *ngFor="let customer of searchResults"
          type="button"
          class="customer-result-row"
          [disabled]="linking"
          (click)="selectCustomer(customer)">
          <div class="flex-1 min-w-0">
            <strong class="block text-sm truncate">{{ customer.name }}</strong>
            <span class="text-xs text-gray-500">{{ customer.phone }}</span>
          </div>
          <p-tag [value]="customer.customer_type" severity="info"></p-tag>
        </button>
      </div>

      <div *ngIf="!searching && searchKeyword.trim() && searchResults.length === 0" class="text-center py-4 text-sm text-gray-400">
        <i class="pi pi-user-minus block mb-1"></i>
        No customers found
      </div>

      <!-- Link status feedback -->
      <div *ngIf="linkError" class="mt-3 text-xs text-red-500">
        <i class="pi pi-exclamation-circle mr-1"></i>{{ linkError }}
      </div>
    </div>
  `,
  styles: [`
    .linked-customer-card {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 12px;
    }
    .customer-search-results {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .customer-result-row {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 12px;
      text-align: left;
      background: white;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background 0.15s;
    }
    .customer-result-row:last-child { border-bottom: none; }
    .customer-result-row:hover:not(:disabled) { background: #f9fafb; }
    .customer-result-row:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class CustomerPanelComponent implements OnDestroy {
  private chatService = inject(ChatService);

  @Input() set conversation(value: TelegramConversation | null) {
    this._conversation = value;
    this.loadLinkedCustomer();
  }
  get conversation(): TelegramConversation | null { return this._conversation; }
  private _conversation: TelegramConversation | null = null;

  @Output() customerLinked = new EventEmitter<string | null>();

  searchKeyword = '';
  searchResults: CustomerSummary[] = [];
  linkedCustomer: CustomerSummary | null = null;
  searching = false;
  linking = false;
  linkError = '';

  private searchSubject = new Subject<string>();
  private subs = new Subscription();

  constructor() {
    this.subs.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(keyword => {
          if (!keyword.trim()) {
            this.searchResults = [];
            this.searching = false;
            return of(null);
          }
          this.searching = true;
          return this.chatService.searchRetailCustomers(keyword, 8).pipe(
            catchError(() => of(null))
          );
        })
      ).subscribe(res => {
        this.searching = false;
        this.searchResults = res?.data || [];
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSearch(keyword: string): void {
    this.searchSubject.next(keyword);
  }

  selectCustomer(customer: CustomerSummary): void {
    if (!this._conversation?.id) return;
    this.linking = true;
    this.linkError = '';
    this.chatService.linkConversationToCustomer(this._conversation.id, customer.id).subscribe({
      next: () => {
        this.linkedCustomer = customer;
        this.searchKeyword = '';
        this.searchResults = [];
        this.linking = false;
        this.customerLinked.emit(customer.id);
      },
      error: () => {
        this.linking = false;
        this.linkError = 'Failed to link customer. Please try again.';
      }
    });
  }

  unlink(): void {
    if (!this._conversation?.id) return;
    this.linking = true;
    this.linkError = '';
    this.chatService.linkConversationToCustomer(this._conversation.id, null).subscribe({
      next: () => {
        this.linkedCustomer = null;
        this.linking = false;
        this.customerLinked.emit(null);
      },
      error: () => {
        this.linking = false;
        this.linkError = 'Failed to unlink. Please try again.';
      }
    });
  }

  private loadLinkedCustomer(): void {
    const customerId = (this._conversation as any)?.customer_id;
    if (!customerId) {
      this.linkedCustomer = null;
      return;
    }
    this.chatService.getRetailCustomer(customerId).pipe(catchError(() => of(null))).subscribe(res => {
      this.linkedCustomer = res?.data ?? null;
    });
  }
}
