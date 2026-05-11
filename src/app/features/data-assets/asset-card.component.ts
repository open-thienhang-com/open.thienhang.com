import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-asset-card',
  standalone: true,
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-700 flex flex-col gap-2 hover:ring-2 hover:ring-blue-400 transition cursor-pointer">
      <div class="flex items-center gap-2">
        <i class="pi pi-database text-lg text-blue-500"></i>
        <span class="font-semibold text-base">{{ asset.name }}</span>
        <span class="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{{ asset.type }}</span>
      </div>
      <div class="text-gray-600 dark:text-gray-300 text-sm">{{ asset.description }}</div>
      <div class="flex gap-2 mt-1 flex-wrap">
        <span *ngFor="let tag of asset.tags" class="bg-gray-100 dark:bg-gray-700 text-xs rounded px-2 py-0.5 text-gray-700 dark:text-gray-200">{{ tag }}</span>
      </div>
      <div class="flex gap-2 mt-1 items-center">
        <span class="text-xs text-gray-400">Owner: {{ asset.owner }}</span>
        <a *ngIf="asset.url" [href]="asset.url" target="_blank" class="text-blue-600 hover:underline text-xs flex items-center gap-1">
          <i class="pi pi-external-link"></i> Link
        </a>
      </div>
    </div>
  `,
  styles: [``]
})
export class AssetCardComponent {
  @Input() asset: any;
}
