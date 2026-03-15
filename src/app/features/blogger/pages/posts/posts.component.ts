import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ChipsModule } from 'primeng/chips';
import { AvatarModule } from 'primeng/avatar';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { BloggerService, BlogPost, PostsResponse, PostDetailResponse, PostAnalytics, Comment } from '../../services/blogger.service';

@Component({
    selector: 'app-blogger-posts',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        CardModule,
        ToastModule,
        TooltipModule,
        ChipsModule,
        AvatarModule,
        DropdownModule
    ],
    providers: [MessageService],
    templateUrl: './posts.component.html',
    styleUrls: ['./posts.component.scss']
})
export class BloggerPostsComponent implements OnInit {
    private bloggerService = inject(BloggerService);
    private messageService = inject(MessageService);
    private sanitizer = inject(DomSanitizer);

    // Data
    posts: BlogPost[] = [];
    filteredPosts: BlogPost[] = [];
    totalPosts = 0;
    loading = false;
    error: string | null = null;

    // View & Layout
    viewMode: 'grid' | 'table' = 'grid';
    searchQuery = '';
    selectedLabels: string[] = [];
    availableLabels: string[] = [];
    
    // Status Filter
    selectedStatus = 'published';
    statusOptions = [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' }
    ];

    // Blog context
    currentBlogId = '4875950892035845487'; // Default sample blog

    // Dialogs
    displayDialog = false;
    selectedPost: BlogPost | null = null;
    sanitizedContent: SafeHtml = '';
    loadingDetail = false;

    displayAnalyticsDialog = false;
    postAnalytics: PostAnalytics | null = null;
    loadingAnalytics = false;
    analyticsError: string | null = null;

    displayCommentsDialog = false;
    comments: Comment[] = [];
    loadingComments = false;
    commentsError: string | null = null;

    ngOnInit() {
        this.loadPosts();
    }

    loadPosts() {
        this.loading = true;
        this.error = null;
        this.bloggerService.getBlogPosts(this.currentBlogId, this.selectedStatus, 50, 0).subscribe({
            next: (response: PostsResponse) => {
                this.posts = response.data;
                this.totalPosts = response.total || response.data.length;
                this.extractLabels();
                this.applyFilters();
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load blog posts. Please try again.';
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
            }
        });
    }

    private extractLabels() {
        const labels = new Set<string>();
        this.posts.forEach(post => {
            post.labels?.forEach(label => labels.add(label));
        });
        this.availableLabels = Array.from(labels).sort();
    }

    applyFilters() {
        this.filteredPosts = this.posts.filter(post => {
            const matchesSearch = !this.searchQuery || 
                post.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                post.excerpt?.toLowerCase().includes(this.searchQuery.toLowerCase());
            
            const matchesLabels = this.selectedLabels.length === 0 || 
                this.selectedLabels.some(label => post.labels?.includes(label));

            return matchesSearch && matchesLabels;
        });
    }

    onSearch() {
        this.applyFilters();
    }

    toggleLabel(label: string) {
        const index = this.selectedLabels.indexOf(label);
        if (index > -1) {
            this.selectedLabels.splice(index, 1);
        } else {
            this.selectedLabels.push(label);
        }
        this.applyFilters();
    }

    setViewMode(mode: 'grid' | 'table') {
        this.viewMode = mode;
    }

    clearFilters() {
        this.searchQuery = '';
        this.selectedLabels = [];
        this.selectedStatus = 'published';
        this.loadPosts();
    }

    get activeFilterCount(): number {
        return (this.searchQuery ? 1 : 0) + (this.selectedLabels.length > 0 ? 1 : 0) + (this.selectedStatus !== 'published' ? 1 : 0);
    }

    get hasSearchOrFilters(): boolean {
        return !!this.searchQuery || this.selectedLabels.length > 0 || this.selectedStatus !== 'published';
    }

    viewPost(post: BlogPost) {
        this.selectedPost = post;
        this.loadingDetail = true;
        this.displayDialog = true;
        this.bloggerService.getPostDetail(post.id).subscribe({
            next: (response: PostDetailResponse) => {
                this.selectedPost = response.data;
                this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(response.data.content);
                this.loadingDetail = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load post details' });
                this.loadingDetail = false;
                this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(post.content); // Fallback
            }
        });
    }

    viewAnalytics(post: BlogPost) {
        this.postAnalytics = null;
        this.analyticsError = null;
        this.loadingAnalytics = true;
        this.displayAnalyticsDialog = true;
        this.bloggerService.getPostAnalytics(post.id).subscribe({
            next: (response) => {
                this.postAnalytics = response.data;
                this.loadingAnalytics = false;
            },
            error: (err) => {
                this.analyticsError = 'Failed to load analytics for this post.';
                this.loadingAnalytics = false;
            }
        });
    }

    viewComments(post: BlogPost) {
        this.selectedPost = post;
        this.comments = [];
        this.commentsError = null;
        this.loadingComments = true;
        this.displayCommentsDialog = true;
        this.bloggerService.getPostComments(post.id).subscribe({
            next: (response) => {
                this.comments = response.data;
                this.loadingComments = false;
            },
            error: (err) => {
                this.commentsError = 'Failed to load comments for this post.';
                this.loadingComments = false;
            }
        });
    }
}
