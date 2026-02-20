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
        AvatarModule
    ],
    providers: [MessageService],
    template: `
    <div class="blogger-posts-container p-4 md:p-6">
      <p-toast position="top-right"></p-toast>

      <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-color">Blog Posts</h1>
            <p class="text-color-secondary">Manage all articles and content</p>
        </div>
        <button
            pButton
            type="button"
            icon="pi pi-refresh"
            (click)="loadPosts()"
            [loading]="loading"
            pTooltip="Refresh posts"
            tooltipPosition="top"
            class="p-button-secondary"
        ></button>
      </div>

      <p-card styleClass="ui-card">
        <p-table
            *ngIf="!error"
            [value]="posts"
            [rows]="10"
            [paginator]="true"
            [loading]="loading"
            responsiveLayout="scroll"
            styleClass="p-datatable-striped p-datatable-gridlines"
        >
            <ng-template pTemplate="header">
            <tr>
                <th pSortableColumn="title" style="width: 40%">Title <p-sortIcon field="title"></p-sortIcon></th>
                <th pSortableColumn="author.display_name" style="width: 20%">Author <p-sortIcon field="author.display_name"></p-sortIcon></th>
                <th pSortableColumn="published" style="width: 20%">Published <p-sortIcon field="published"></p-sortIcon></th>
                <th style="width: 20%; text-align: center">Actions</th>
            </tr>
            </ng-template>

            <ng-template pTemplate="body" let-post>
            <tr>
                <td>
                    <div class="flex flex-col">
                        <a [href]="post.url" target="_blank" class="font-semibold text-primary-500 hover:underline">{{ post.title }}</a>
                        <span class="text-sm text-color-secondary mt-1">{{ post.excerpt | slice:0:100 }}...</span>
                    </div>
                </td>
                <td>
                    <div class="flex items-center gap-2">
                        <p-avatar [image]="'https:' + post.author.image" shape="circle" size="small"></p-avatar>
                        <span>{{ post.author.display_name }}</span>
                    </div>
                </td>
                <td>
                    <div class="flex flex-col text-sm">
                        <span class="font-medium">{{ post.published | date:'mediumDate' }}</span>
                        <span class="text-color-secondary">{{ post.published | date:'shortTime' }}</span>
                    </div>
                </td>
                <td class="text-center">
                    <div class="flex gap-2 justify-center">
                        <button pButton icon="pi pi-eye" (click)="viewPost(post)" pTooltip="View Details" class="p-button-sm p-button-secondary"></button>
                        <button pButton icon="pi pi-chart-bar" (click)="viewAnalytics(post)" pTooltip="View Analytics" class="p-button-sm p-button-secondary"></button>
                        <button pButton icon="pi pi-comments" (click)="viewComments(post)" pTooltip="View Comments" class="p-button-sm p-button-secondary" [badge]="post.replies.total_items" badgeClass="p-badge-danger"></button>
                    </div>
                </td>
            </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
                <tr><td colspan="4" class="text-center p-4">No posts found.</td></tr>
            </ng-template>
            <ng-template pTemplate="loadingbody">
                <tr><td colspan="4" class="text-center p-4"><i class="pi pi-spin pi-spinner text-2xl"></i></td></tr>
            </ng-template>
        </p-table>
        <div *ngIf="error" class="text-center p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
            <i class="pi pi-exclamation-triangle text-xl mr-2"></i>
            <span>{{ error }}</span>
            <button pButton label="Retry" (click)="loadPosts()" class="p-button-sm p-button-danger ml-4"></button>
        </div>
      </p-card>

      <!-- DIALOGS -->
      <p-dialog [(visible)]="displayDialog" [header]="selectedPost?.title" [modal]="true" [style]="{width: '70vw', minWidth: '320px'}" [maximizable]="true" styleClass="post-detail-dialog">
        <ng-container *ngIf="!loadingDetail && selectedPost">
            <div class="post-detail-grid">
                <div class="post-content">
                    <div class="prose max-w-none" [innerHTML]="sanitizedContent"></div>
                </div>
                <div class="post-metadata">
                    <p-card styleClass="ui-card-flat">
                        <ng-template pTemplate="title">
                            <div class="flex items-center gap-3 mb-3">
                                <p-avatar [image]="'https:' + selectedPost.author.image" shape="circle" size="large"></p-avatar>
                                <div>
                                    <p class="font-semibold text-lg">{{ selectedPost.author.display_name }}</p>
                                    <a [href]="selectedPost.url" target="_blank" class="text-sm text-primary-500 hover:underline">
                                        View on Blog <i class="pi pi-external-link ml-1"></i>
                                    </a>
                                </div>
                            </div>
                        </ng-template>
                        <ng-template pTemplate="content">
                            <div class="text-sm space-y-3">
                                <div>
                                    <p class="font-semibold text-color-secondary">Published</p>
                                    <p>{{ selectedPost.published | date:'fullDate' }}</p>
                                </div>
                                <div>
                                    <p class="font-semibold text-color-secondary">Last Updated</p>
                                    <p>{{ selectedPost.updated | date:'medium' }}</p>
                                </div>
                                <div *ngIf="selectedPost.labels?.length > 0">
                                    <p class="font-semibold text-color-secondary">Labels</p>
                                    <div class="flex flex-wrap gap-1 mt-1">
                                        <p-tag *ngFor="let label of selectedPost.labels" [value]="label"></p-tag>
                                    </div>
                                </div>
                            </div>
                        </ng-template>
                    </p-card>
                </div>
            </div>
        </ng-container>
        <div *ngIf="loadingDetail" class="flex items-center justify-center p-8">
            <i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i>
        </div>
        <ng-template pTemplate="footer">
            <button pButton type="button" label="Close" (click)="displayDialog=false" class="p-button-text"></button>
        </ng-template>
      </p-dialog>

      <p-dialog [(visible)]="displayAnalyticsDialog" header="Post Analytics" [modal]="true" [style]="{width: '50vw', minWidth: '320px'}">
        <div *ngIf="loadingAnalytics" class="flex items-center justify-center p-8"><i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i></div>
        <div *ngIf="analyticsError" class="p-4 text-center bg-red-50 text-red-700 border border-red-200 rounded-md">{{ analyticsError }}</div>
        <div *ngIf="postAnalytics" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-surface-100 rounded-lg">
                <p class="text-sm text-color-secondary">Comment Count</p>
                <p class="text-3xl font-bold text-primary-500">{{ postAnalytics.comment_count }}</p>
            </div>
            <div class="p-4 bg-surface-100 rounded-lg">
                <p class="text-sm text-color-secondary">Published Date</p>
                <p class="text-lg font-semibold">{{ postAnalytics.published | date:'medium' }}</p>
            </div>
            <div class="p-4 bg-surface-100 rounded-lg col-span-1 md:col-span-2">
                <p class="text-sm text-color-secondary">Last Updated</p>
                <p class="text-lg font-semibold">{{ postAnalytics.updated | date:'medium' }}</p>
            </div>
        </div>
        <ng-template pTemplate="footer">
            <button pButton type="button" label="Close" (click)="displayAnalyticsDialog=false" class="p-button-text"></button>
        </ng-template>
      </p-dialog>

      <p-dialog [(visible)]="displayCommentsDialog" [header]="'Comments for ' + selectedPost?.title" [modal]="true" [style]="{width: '60vw', minWidth: '320px'}">
        <div *ngIf="loadingComments" class="flex items-center justify-center p-8"><i class="pi pi-spin pi-spinner text-3xl text-primary-500"></i></div>
        <div *ngIf="commentsError" class="p-4 text-center bg-red-50 text-red-700 border border-red-200 rounded-md">{{ commentsError }}</div>
        <div *ngIf="!loadingComments && comments.length > 0" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div *ngFor="let comment of comments" class="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
            <p-avatar [image]="'https:' + comment.author.image" shape="circle" size="large"></p-avatar>
            <div class="flex-1">
                <div class="flex justify-between items-center">
                    <span class="font-semibold">{{ comment.author.display_name }}</span>
                    <span class="text-xs text-color-secondary">{{ comment.published | date:'short' }}</span>
                </div>
                <div [innerHTML]="comment.content" class="prose prose-sm mt-1 text-color"></div>
            </div>
          </div>
        </div>
        <div *ngIf="!loadingComments && comments.length === 0 && !commentsError" class="text-center p-8">
          <i class="pi pi-inbox text-4xl text-gray-400"></i>
          <p class="mt-2 text-color-secondary">No comments found for this post.</p>
        </div>
        <ng-template pTemplate="footer">
            <button pButton type="button" label="Close" (click)="displayCommentsDialog=false" class="p-button-text"></button>
        </ng-template>
      </p-dialog>
    </div>
  `,
    styles: [`
    :host {
        display: block;
        background-color: var(--surface-ground);
        min-height: 100%;
    }
    .blogger-posts-container {
        max-width: 1600px;
        margin: 0 auto;
    }
    .prose {
        color: var(--text-color);
    }
    .prose a {
        color: var(--primary-color);
    }
    .post-detail-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }
    @media (min-width: 1024px) {
        .post-detail-grid {
            grid-template-columns: 3fr 1fr;
        }
    }
    .post-content {
        max-height: 70vh;
        overflow-y: auto;
        padding-right: 1rem;
    }
    .post-metadata {
        background-color: var(--surface-50);
        border-radius: var(--border-radius);
        padding: 0.5rem;
    }
    :host ::ng-deep {
        .p-card, .p-datatable {
            box-shadow: var(--card-shadow);
            border-radius: var(--border-radius);
        }
        .ui-card {
            border: 1px solid var(--surface-border);
        }
        .ui-card-flat {
            background: transparent;
            box-shadow: none;
            border: none;
        }
    }
  `]
})
export class BloggerPostsComponent implements OnInit {
    private bloggerService = inject(BloggerService);
    private messageService = inject(MessageService);
    private sanitizer = inject(DomSanitizer);

    posts: BlogPost[] = [];
    loading = false;
    error: string | null = null;

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
        this.bloggerService.getPosts('published', 20, 0).subscribe({
            next: (response: PostsResponse) => {
                this.posts = response.data;
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to load blog posts. Please try again.';
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: this.error });
            }
        });
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
