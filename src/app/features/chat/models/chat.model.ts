export interface ChatDataProducts {
    platforms: string[];
    total_conversations: number;
    active_conversations: number;
    total_messages: number;
    online_agents: number;
    conversation_categories: { [key: string]: number };
    sentiment_distribution: { [key: string]: number };
}

export interface Conversation {
    id: string;
    platform: string;
    user_name: string;
    user_id: string;
    last_message: string;
    last_message_time: string;
    message_count: number;
    status: string;
    agent: string;
    category: string;
    sentiment: string;
    response_time: string;
    resolution_time: string | null;
    messages?: Message[];
    conversation_duration?: string;
    first_response_time?: string;
    customer_satisfaction?: number;
    escalated?: boolean;
    tags?: string[];
}

export interface Message {
    id: string;
    conversation_id: string;
    sender: string;
    sender_name: string;
    content: string;
    timestamp: string;
    message_type: string;
    sentiment: string;
    intent: string;
}

export interface Agent {
    id: string;
    name: string;
    email: string;
    status: string;
    active_conversations: number;
    total_conversations: number;
    average_response_time: string;
    satisfaction_rating: number;
    specialization: string[];
    languages: string[];
    shift: string;
}

export interface ChatAnalytics {
    period: string;
    overview: {
        total_conversations: number;
        active_conversations: number;
        resolved_conversations: number;
        resolution_rate: string;
        total_messages: number;
        average_response_time: string;
        customer_satisfaction: number;
    };
    platform_distribution: { [key: string]: number };
    category_breakdown: { [key: string]: number };
    sentiment_analysis: { [key: string]: number };
    agent_performance: {
        agent: string;
        conversations: number;
        avg_response_time: string;
        satisfaction: number;
    }[];
    hourly_volume: {
        hour: string;
        conversations: number;
        messages: number;
    }[];
    response_time_distribution: { [key: string]: string };
}

export interface ChatSummary {
    domain: string;
    summary: {
        total_conversations: number;
        active_conversations: number;
        resolved_conversations: number;
        platforms_integrated: number;
        agents_active: number;
        avg_response_time: string;
        customer_satisfaction: number;
        last_updated: string;
    };
    quick_stats: {
        domains_managed: number;
        data_products: number;
        api_endpoints: number;
        monthly_cost: number;
        quality_score: number;
    };
    recent_activities: {
        type: string;
        user?: string;
        agent?: string;
        platform?: string;
        timestamp: string;
    }[];
    performance_metrics: {
        total_messages: number;
        avg_resolution_time: string;
        first_response_time: string;
        satisfaction_rate: string;
    };
}

export interface ApiResponse<T> {
    message: string;
    data: T;
    total: number;
    filters?: any;
}
