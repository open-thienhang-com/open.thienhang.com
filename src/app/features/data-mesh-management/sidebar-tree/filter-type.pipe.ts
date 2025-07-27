import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterType', standalone: true })
export class FilterTypePipe implements PipeTransform {
  transform(groups: any[], query: string): any[] {
    if (!query) return groups;
    return groups.filter(g => g.label.toLowerCase().includes(query.toLowerCase()) || g.name.toLowerCase().includes(query.toLowerCase()));
  }
}
