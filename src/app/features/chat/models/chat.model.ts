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

export interface TelegramBotProfile {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
    can_connect_to_business: boolean;
    has_main_web_app: boolean;
    has_topics_enabled: boolean;
    allows_users_to_create_topics: boolean;
}

export interface TelegramBotConfig {
    enabled: boolean;
    auto_reply: boolean;
    human_handoff: boolean;
    default_language: string;
}

export interface TelegramCounters {
    total_conversations: number;
    active_conversations: number;
    pending_human: number;
    unread_messages: number;
    templates: number;
    commands: number;
    broadcasts: number;
}

export interface TelegramWebhook {
    enabled: boolean;
    url: string | null;
    secret_token_configured: boolean;
    last_error_date: string | null;
    last_error_message: string | null;
    pending_update_count: number;
    last_sync_at: string | null;
}

export interface TelegramDashboard {
    bot: TelegramBotConfig;
    counters: TelegramCounters;
    webhook: TelegramWebhook;
    updated_at: string;
}

export interface TelegramMessage {
    id: string;
    _id?: string;
    message_id?: string;
    sender: string;
    sender_name: string;
    content: string;
    timestamp: string;
    message_type: string;
    delivery_status: string;
}

export interface TelegramInternalNote {
    note: string;
    created_at: string;
}

export interface TelegramConversation {
    id: string;
    _id?: string;
    conversation_id?: string;
    chat_id: number;
    platform: string;
    user_name: string;
    username: string;
    user_id: string;
    last_message: string;
    last_message_time: string;
    message_count: number;
    status: string;
    priority: string;
    agent: string | null;
    agent_id: string | null;
    category: string;
    sentiment: string;
    tags: string[];
    unread_count: number;
    is_bot_enabled: boolean;
    created_at: string;
    updated_at: string;
    messages: TelegramMessage[];
    internal_notes?: TelegramInternalNote[];
}

export interface TelegramConversationListResponse {
    data: TelegramConversation[];
    total: number;
    page: number;
    page_size: number;
    filters: {
        status: string | null;
        assigned: string | null;
        keyword: string | null;
    };
}

export interface TelegramAssignPayload {
    agent_id: string;
    agent_name: string;
}

export interface TelegramStatusPayload {
    status: string;
    note: string;
}

export interface TelegramSendMessagePayload {
    chat_id: number;
    text: string;
    disable_notification: boolean;
}

export interface TelegramReplyParameters {
    message_id: number;
}

export interface TelegramInlineKeyboardButton {
    text: string;
    url?: string;
}

export interface TelegramInlineKeyboardMarkup {
    inline_keyboard: TelegramInlineKeyboardButton[][];
}

export interface TelegramSendPhotoPayload {
    chat_id: number;
    photo: string;
    caption?: string;
    parse_mode?: string;
    caption_entities?: unknown[];
    reply_markup?: TelegramInlineKeyboardMarkup | null;
    disable_notification?: boolean;
    protect_content?: boolean;
    has_spoiler?: boolean;
    message_thread_id?: number;
    reply_parameters?: TelegramReplyParameters;
    native_payload?: Record<string, unknown>;
}

export interface TelegramSendDocumentPayload {
    chat_id: number;
    document: string;
    caption?: string;
    parse_mode?: string;
    caption_entities?: unknown[];
    disable_content_type_detection?: boolean;
    reply_markup?: TelegramInlineKeyboardMarkup | null;
    disable_notification?: boolean;
    protect_content?: boolean;
    message_thread_id?: number;
    reply_parameters?: TelegramReplyParameters;
    native_payload?: Record<string, unknown>;
}

export interface TelegramSendTemplatePayload {
    chat_id: number;
    template_id: string;
    variables: Record<string, string>;
    disable_notification: boolean;
}

export interface TelegramTemplate {
    id: string;
    _id?: string;
    template_id?: string;
    name: string;
    category: string;
    content: string;
    enabled: boolean;
    variables: string[];
    created_at?: string;
    updated_at: string;
}

export interface TelegramCreateTemplatePayload {
    name: string;
    category: string;
    content: string;
    enabled: boolean;
    variables: string[];
}

export interface TelegramSettings {
    bot_name: string;
    bot_username: string;
    default_language: string;
    timezone: string;
    bot_enabled: boolean;
    allow_group_chat: boolean;
    enable_auto_reply: boolean;
    enable_human_handoff: boolean;
    welcome_template_id: string | null;
    fallback_template_id: string | null;
    web_app_url: string | null;
    support_url: string | null;
    contact_email: string | null;
    updated_at: string;
}

export interface TelegramCommand {
    command: string;
    description: string;
    enabled: boolean;
    scope: string;
    sort_order: number;
}

export interface TelegramBroadcast {
    id: string;
    name: string;
    message: string;
    target_status: string;
    target_tags: string[];
    scheduled_at: string;
    status: string;
    recipient_count_estimate: number;
    created_at: string;
}

export interface TelegramCreateBroadcastPayload {
    name: string;
    message: string;
    target_status: string;
    target_tags: string[];
    scheduled_at: string;
    recipient_count_estimate: number;
}
