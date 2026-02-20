import { Routes } from '@angular/router';

export const bloggerRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./blogger-overview.component').then(m => m.BloggerOverviewComponent),
    },
    {
        path: 'authors',
        loadComponent: () => import('./pages/authors/authors.component').then(m => m.BloggerAuthorsComponent),
    },
    {
        path: 'posts',
        loadComponent: () => import('./pages/posts/posts.component').then(m => m.BloggerPostsComponent),
    }
];
