import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { SearchResult } from '../../../core/services/search.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    ChipModule
  ],
  template: `
    <div class="search-results" *ngIf="results && results.length > 0">
      <div class="search-results-header">
        <h3>Search Results ({{ results.length }})</h3>
        <p-button
          label="Clear"
          icon="pi pi-times"
          size="small"
          text
          severity="secondary"
          (onClick)="onClear.emit()">
        </p-button>
      </div>

      <div class="search-results-list">
        <p-card
          *ngFor="let result of results; trackBy: trackByResult"
          class="search-result-item"
          [routerLink]="result.url"
          (click)="onResultClick(result)">

          <ng-template pTemplate="header">
            <div class="result-header">
              <div class="result-icon">
                <i [class]="getResultIcon(result.type)"></i>
              </div>
              <div class="result-meta">
                <span class="result-type">{{ result.type | titlecase }}</span>
                <span class="result-category">{{ result.category }}</span>
              </div>
            </div>
          </ng-template>

          <ng-template pTemplate="title">
            {{ result.title }}
          </ng-template>

          <ng-template pTemplate="content">
            <p class="result-description">{{ result.description }}</p>

            <div class="result-tags" *ngIf="result.tags && result.tags.length > 0">
              <p-chip
                *ngFor="let tag of result.tags.slice(0, 3)"
                [label]="tag"
                size="small"
                styleClass="result-tag">
              </p-chip>
              <span class="more-tags" *ngIf="result.tags.length > 3">
                +{{ result.tags.length - 3 }} more
              </span>
            </div>
          </ng-template>
        </p-card>
      </div>
    </div>

    <div class="no-results" *ngIf="results && results.length === 0 && !isSearching">
      <div class="no-results-content">
        <i class="pi pi-search no-results-icon"></i>
        <h3>No results found</h3>
        <p>Try adjusting your search terms or browse our popular pages:</p>

        <div class="popular-searches">
          <p-button
            *ngFor="let popular of popularSearches"
            [label]="popular.title"
            size="small"
            text
            severity="secondary"
            [routerLink]="popular.url"
            (click)="onResultClick(popular)">
          </p-button>
        </div>
      </div>
    </div>

    <div class="searching" *ngIf="isSearching">
      <div class="searching-content">
        <i class="pi pi-spin pi-spinner searching-icon"></i>
        <p>Searching...</p>
      </div>
    </div>
  `,
  styles: [`
    .search-results {
      max-width: 600px;
      margin: 0 auto;
    }

    .search-results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 0 1rem;

      h3 {
        margin: 0;
        color: var(--text-color);
        font-size: 1.1rem;
        font-weight: 600;
      }
    }

    .search-results-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .search-result-item {
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .p-card-header {
        padding: 1rem;
      }

      .p-card-body {
        padding: 0 1rem 1rem 1rem;
      }

      .p-card-title {
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .result-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-100);
        color: var(--primary-600);

        i {
          font-size: 1rem;
        }
      }

      .result-meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .result-type {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .result-category {
          font-size: 0.75rem;
          color: var(--text-color-secondary);
        }
      }
    }

    .result-description {
      margin: 0.5rem 0;
      color: var(--text-color-secondary);
      line-height: 1.4;
    }

    .result-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;

      .result-tag {
        font-size: 0.75rem;
        background: var(--surface-200);
        color: var(--text-color);
      }

      .more-tags {
        font-size: 0.75rem;
        color: var(--text-color-secondary);
        font-style: italic;
      }
    }

    .no-results {
      text-align: center;
      padding: 3rem 1rem;

      .no-results-content {
        max-width: 400px;
        margin: 0 auto;

        .no-results-icon {
          font-size: 3rem;
          color: var(--text-color-secondary);
          margin-bottom: 1rem;
        }

        h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-color);
        }

        p {
          margin: 0 0 1.5rem 0;
          color: var(--text-color-secondary);
        }
      }
    }

    .popular-searches {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }

    .searching {
      text-align: center;
      padding: 2rem;

      .searching-content {
        .searching-icon {
          font-size: 2rem;
          color: var(--primary-600);
          margin-bottom: 1rem;
        }

        p {
          margin: 0;
          color: var(--text-color-secondary);
        }
      }
    }

    // Dark mode support
    .p-dark-theme {
      .search-result-item:hover {
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
      }

      .result-icon {
        background: var(--primary-900);
        color: var(--primary-300);
      }

      .result-tag {
        background: var(--surface-700);
        color: var(--text-color);
      }
    }

    // Mobile responsive
    @media (max-width: 768px) {
      .search-results-header {
        padding: 0 0.5rem;

        h3 {
          font-size: 1rem;
        }
      }

      .search-result-item {
        .p-card-header,
        .p-card-body {
          padding: 0.75rem;
        }
      }

      .result-header {
        gap: 0.5rem;

        .result-icon {
          width: 28px;
          height: 28px;

          i {
            font-size: 0.875rem;
          }
        }

        .result-meta {
          .result-type,
          .result-category {
            font-size: 0.7rem;
          }
        }
      }

      .popular-searches {
        .p-button {
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
        }
      }
    }
  `]
})
export class SearchResultsComponent {
  @Input() results: SearchResult[] | null = [];
  @Input() isSearching = false;
  @Input() popularSearches: SearchResult[] = [];

  @Output() clear = new EventEmitter<void>();
  @Output() resultClick = new EventEmitter<SearchResult>();

  trackByResult(index: number, result: SearchResult): string {
    return result.id;
  }

  getResultIcon(type: string): string {
    switch (type) {
      case 'page':
        return 'pi pi-file';
      case 'component':
        return 'pi pi-puzzle-piece';
      case 'feature':
        return 'pi pi-star';
      case 'documentation':
        return 'pi pi-book';
      default:
        return 'pi pi-circle';
    }
  }

  onClear(): void {
    this.clear.emit();
  }

  onResultClick(result: SearchResult): void {
    this.resultClick.emit(result);
  }
}