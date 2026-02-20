import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getApiBase } from '../../../core/config/api-config';

export interface Author {
    id: string;
    display_name: string;
    url: string;
    image: string;
}

export interface AuthorsResponse {
    message: string;
    data: Author[];
    total: number;
    pagination: {
        offset: number;
        limit: number;
        has_next: boolean;
    };
}

export interface BlogPost {
    id: string;
    title: string;
    content: string;
    url: string;
    published: string;
    updated: string;
    labels: string[];
    author: Author;
    replies: {
        total_items: string;
        comments: any[];
    };
    blog_id: string;
    images: string[];
    excerpt: string;
}

export interface PostDetailResponse {
    message: string;
    data: BlogPost;
    total: number;
}

export interface PostsResponse {
    message: string;
    data: BlogPost[];
    total: number;
    pagination: {
        offset: number;
        limit: number;
        has_next: boolean;
    };
    filters: {
        status: string;
        author: string | null;
        category: string | null;
        tag: string | null;
    };
}

export interface PostAnalytics {
    post_id: string;
    title: string;
    comment_count: string;
    published: string;
    updated: string;
}

export interface PostAnalyticsResponse {
    message: string;
    data: PostAnalytics;
    total: number;
}

export interface Comment {
    id: string;
    post_id: string;
    author: {
        id: string;
        display_name: string;
        url: string;
        image: string;
    };
    content: string;
    published: string;
    updated: string;
    status: string; // e.g., 'live', 'pending', 'spam'
}

export interface CommentsResponse {
    message: string;
    data: Comment[];
    total: number;
    pagination: {
        offset: number;
        limit: number;
        has_next: boolean;
    };
    filters: {
        post_id: string;
        approved: boolean | null;
    };
}

export interface BloggerVersion {
    domain: string;
    version: string;
    api_version: string;
    build_date: string;
    status: string;
    description: string;
}

export interface BloggerVersionResponse {
    message: string;
    data: BloggerVersion;
    total: number;
}

export interface BloggerOverview {
    domain: string;
    display_name: string;
    purpose: string;
    description: string;
    tags: string[];
    assets: string[];
    capabilities: string[];
    data_products: number;
    total_authors: number;
    total_comments: number;
    last_updated: string;
}

export interface BloggerOverviewResponse {
    message: string;
    data: BloggerOverview;
    total: number;
}

export interface BloggerQuality {
    domain: string;
    overall_score: number;
    data_freshness: number;
    data_completeness: number;
    data_accuracy: number;
    data_consistency: number;
    schema_compliance: number;
    metrics: {
        total_posts: number;
        published_posts: number;
        total_authors: number;
        total_comments: number;
        engagement_rate: string;
        content_quality_score: number;
    };
    last_assessment: string;
}

export interface BloggerQualityResponse {
    message: string;
    data: BloggerQuality;
    total: number;
}

export interface BloggerCost {
    domain: string;
    total_monthly_cost: number;
    cost_per_post: number;
    cost_breakdown: {
        content_storage: number;
        media_storage: number;
        content_delivery: number;
        analytics: number;
        search_indexing: number;
        backup: number;
    };
    cost_trends: {
        last_month: number;
        growth_rate: string;
        projection_next_month: number;
    };
    optimization_opportunities: string[];
    currency: string;
    billing_period: string;
}

export interface BloggerCostResponse {
    message: string;
    data: BloggerCost;
    total: number;
}

export interface BloggerFeature {
    name: string;
    description: string;
    status: string;
    endpoints: string[];
}

export interface BloggerFeaturesResponse {
    message: string;
    data: {
        domain: string;
        features: BloggerFeature[];
        integrations: string[];
        supported_formats: string[];
        authentication: string[];
        rate_limits: {
            default: string;
            author: string;
            admin: string;
        };
    };
    total: number;
}


@Injectable({
    providedIn: 'root'
})
export class BloggerService {
    private http = inject(HttpClient);
    private apiBase = getApiBase();

    getAuthors(limit: number = 10, offset: number = 0): Observable<AuthorsResponse> {
        const params = new HttpParams()
            .set('limit', limit.toString())
            .set('offset', offset.toString());

        return this.http.get<AuthorsResponse>(
            `${this.apiBase}/data-mesh/domains/blogger/authors`,
            { params }
        );
    }

    getAuthorById(id: string): Observable<Author> {
        return this.http.get<Author>(
            `${this.apiBase}/data-mesh/domains/blogger/authors/${id}`
        );
    }

    getPosts(status: string = 'published', limit: number = 10, offset: number = 0): Observable<PostsResponse> {
        const params = new HttpParams()
            .set('status', status)
            .set('limit', limit.toString())
            .set('offset', offset.toString());

        return this.http.get<PostsResponse>(
            `${this.apiBase}/data-mesh/domains/blogger`,
            { params }
        );
    }

    getPostDetail(postId: string): Observable<PostDetailResponse> {
        return this.http.get<PostDetailResponse>(
            `${this.apiBase}/data-mesh/domains/blogger/posts/${postId}`
        );
    }

    getPostById(id: string): Observable<BlogPost> {
        return this.http.get<BlogPost>(
            `${this.apiBase}/data-mesh/domains/blogger/${id}`
        );
    }

    getPostAnalytics(postId: string): Observable<PostAnalyticsResponse> {
        return this.http.get<PostAnalyticsResponse>(
            `${this.apiBase}/data-mesh/domains/blogger/posts/${postId}/analytics`
        );
    }

    getPostComments(postId: string, limit: number = 10, offset: number = 0): Observable<CommentsResponse> {
        const params = new HttpParams()
            .set('limit', limit.toString())
            .set('offset', offset.toString());
        return this.http.get<CommentsResponse>(
            `${this.apiBase}/data-mesh/domains/blogger/posts/${postId}/comments`,
            { params }
        );
    }

    getBloggerVersion(): Observable<BloggerVersionResponse> {
        return this.http.get<BloggerVersionResponse>(
            `${this.apiBase}/data-mesh/domains/blogger/version`
        );
    }

    getBloggerOverview(): Observable<BloggerOverviewResponse> {
        return this.http.get<BloggerOverviewResponse>(
            `${this.apiBase}/data-mesh/domains/blogger/overview`
        );
    }

    getBloggerQuality(): Observable<BloggerQualityResponse> {
        return this.http.get<BloggerQualityResponse>(
            `${this.apiBase}/data-mesh/domains/blogger/quality`
        );
    }

    getBloggerCost(): Observable<BloggerCostResponse> {
        return this.http.get<BloggerCostResponse>(
            `${this.apiBase}/data-mesh/domains/blogger/cost`
        );
    }

    getBloggerFeatures(): Observable<BloggerFeaturesResponse> {
        return this.http.get<BloggerFeaturesResponse>(
            `${this.apiBase}/data-mesh/domains/blogger/features`
        );
    }
}
