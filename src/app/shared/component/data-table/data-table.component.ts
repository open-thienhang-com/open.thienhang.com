import {Component, ContentChild, EventEmitter, Input, OnChanges, Output, TemplateRef} from '@angular/core';
import {TableModule, TablePageEvent} from 'primeng/table';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-data-table',
  imports: [
    TableModule,
    NgTemplateOutlet
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnChanges {
  @Input() data: any;
  @Input() rows = 10;
  @Input() loading = false;
  @Input() paginator = true;
  @Input() stripedRows = true;
  @Output() onPageChange = new EventEmitter();
  @ContentChild('tableHeader') headerTemplate!: TemplateRef<any>;
  @ContentChild('tableBody') bodyTemplate!: TemplateRef<any>;

  curPageData: any[] = [];
  totalRecords = 0;
  curPageIndex = 0;

  ngOnChanges() {
    if (this.data) {
      const {data, total} = this.data;
      this.curPageData = data;
      this.totalRecords = total;
    }
  }

  changePage(data: TablePageEvent) {
    const {first, rows} = data;
    this.curPageIndex = first / rows
    this.onPageChange.emit(this.curPageIndex);
  }

  refresh() {
    this.onPageChange.emit(this.curPageIndex);
  }
}
