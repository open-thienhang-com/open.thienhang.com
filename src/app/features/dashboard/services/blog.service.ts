import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface BlogItem {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    author?: string;
}

export interface Announcement {
    id: string;
    message: string;
    date: string;
}

@Injectable({ providedIn: 'root' })
export class BlogService {
    private mockBlogs: BlogItem[] = [
        { id: 'b1', title: 'Release: New Data Product APIs', excerpt: 'We released a new set of APIs to query data products with filtering and lineage.', date: '2025-10-01', author: 'Platform Team' },
        { id: 'b2', title: 'Policy Update: Data Retention', excerpt: 'Updated retention rules for financial datasets. Please review impacted assets.', date: '2025-09-25', author: 'Governance Team' }
    ];

    private mockAnnouncements: Announcement[] = [
        { id: 'a1', message: 'Scheduled maintenance on Oct 12, 02:00 - 04:00 UTC.', date: '2025-10-08' },
        { id: 'a2', message: 'New analytics dashboard coming next week.', date: '2025-10-05' }
    ];

    getBlogs(): Observable<BlogItem[]> {
        // simulate network delay
        return of(this.mockBlogs).pipe(delay(200));
    }

    getAnnouncements(): Observable<Announcement[]> {
        return of(this.mockAnnouncements).pipe(delay(150));
    }
}
