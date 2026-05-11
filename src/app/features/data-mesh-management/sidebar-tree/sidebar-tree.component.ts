import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { FilterTypePipe } from './filter-type.pipe';

@Component({
  selector: 'app-sidebar-tree',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginatorModule,
    FilterTypePipe
  ],
  templateUrl: './sidebar-tree.component.html',
  styleUrls: ['./sidebar-tree.component.scss']
})
export class SidebarTreeComponent {
  @Input() assetGroups: any[] = [];
  @Input() dataSources: any[] = [];
  @Input() typeFilterQuery: string = '';
  @Input() selectedGroup: string = '';
  @Input() selectedSubGroup: string = '';
  @Input() typePageFirst: number = 0;
  @Output() groupSelected = new EventEmitter<string>();
  @Output() subGroupSelected = new EventEmitter<string>();

  selectGroup(name: string) {
    this.groupSelected.emit(name);
  }
  selectSubGroup(name: string) {
    this.subGroupSelected.emit(name);
  }
}
