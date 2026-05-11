import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-asset-tree',
  standalone: true,
  template: `
    <ul class="tree-list">
      <li *ngFor="let group of groups">
        <div class="tree-group flex items-center gap-2 cursor-pointer py-1 px-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30" (click)="toggle(group.type, $event)">
          <i class="pi" [ngClass]="expanded[group.type] ? 'pi-chevron-down' : 'pi-chevron-right'"></i>
          <span class="font-semibold">{{ group.type }}</span>
        </div>
        <ul *ngIf="expanded[group.type]" class="ml-6">
          <li *ngFor="let asset of group.assets" class="tree-asset py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded" (click)="select(asset, $event)">
            <i class="pi pi-database text-blue-500 mr-1"></i>{{ asset.name }}
          </li>
        </ul>
      </li>
    </ul>
  `,
  styles: [``]
})
export class AssetTreeComponent {
  @Input() groups: any[] = [];
  @Input() expanded: { [key: string]: boolean } = {};
  @Input() selectAsset: (asset: any) => void = () => {};
  @Input() toggleGroup: (type: string) => void = () => {};

  toggle(type: string, event: Event) {
    event.stopPropagation();
    this.toggleGroup(type);
  }
  select(asset: any, event: Event) {
    event.stopPropagation();
    this.selectAsset(asset);
  }
}
