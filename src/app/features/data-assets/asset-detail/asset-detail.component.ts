import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-asset-detail',
  template: `
    <div *ngIf="asset" class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 animate-fade-in">
      <h1 class="text-2xl font-bold mb-2">{{ asset.name }}</h1>
      <div class="mb-2 text-gray-600 dark:text-gray-300">{{ asset.description }}</div>
      <div class="mb-2">
        <span class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{{ asset.type }}</span>
        <span class="ml-2 text-xs text-gray-500">Owner: {{ asset.owner }}</span>
      </div>
      <div class="mb-2">
        <a *ngIf="asset.url" [href]="asset.url" target="_blank" class="text-blue-600 hover:underline text-xs flex items-center gap-1">
          <i class="pi pi-external-link"></i> View in Source System
        </a>
      </div>
      <div class="mb-2 flex gap-2 flex-wrap">
        <span *ngFor="let tag of asset.tags" class="bg-gray-100 dark:bg-gray-700 text-xs rounded px-2 py-0.5 text-gray-700 dark:text-gray-200">{{ tag }}</span>
      </div>
      <div class="text-xs text-gray-400">Created: {{ asset.createdAt }} | Updated: {{ asset.updatedAt }}</div>
    </div>
  `,
  styles: [``]
})
export class AssetDetailComponent {
  @Input() asset: any;
}
