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
    media_url?: string;
    caption?: string;
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
    customer_id?: string | null;
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
    parse_mode?: string;
    reply_markup?: TelegramInlineKeyboardMarkup | null;
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

export interface CustomerSummary {
    id: string;
    name: string;
    phone: string;
    email?: string;
    customer_type: string;
    is_active: boolean;
}

export interface ConversationPage {
    items: TelegramConversation[];
    has_more: boolean;
    skip: number;
}

export interface UnifiedTemplate {
    id: string;
    _id?: string;
    name: string;
    code: string;
    channel: string;
    category: string;
    content: string;
    enabled: boolean;
    variables: string[];
    tags?: string[];
    created_at?: string;
    updated_at: string;
}

export interface UnifiedTemplateCreate {
    name: string;
    code: string;
    channel: string;
    category: string;
    content: string;
    enabled: boolean;
    variables: string[];
    tags?: string[];
}

export interface UnifiedTemplateUpdate {
    name?: string;
    category?: string;
    content?: string;
    enabled?: boolean;
    variables?: string[];
    tags?: string[];
}

export interface ProductImageAsset {
    url?: string;
    file_id?: string;
    is_primary?: boolean;
    alt?: string;
}

export interface ProductSearchResult {
    id: string;
    _id?: string;
    name: string;
    sku: string;
    selling_price: number;
    cost_price?: number;
    category?: string;
    description?: string;
    image_url?: string;
    thumbnail?: ProductImageAsset;
    images?: ProductImageAsset[];
    is_active?: boolean;
}

// ── Labels ──────────────────────────────────────────────────────────────────
export interface Label {
    id: string;
    name: string;
    color: string;
    tenant_id?: string;
    created_at?: string;
}

export interface LabelCreate {
    name: string;
    color: string;
}

// ── Internal Notes ───────────────────────────────────────────────────────────
export interface InternalNote {
    id: string;
    author_id: string;
    author_name: string;
    content: string;
    created_at: string;
}

export interface InternalNoteCreate {
    content: string;
}

// ── Quick Replies ────────────────────────────────────────────────────────────
export interface QuickReply {
    id: string;
    shortcut: string;
    content: string;
    channel: string;
    created_at?: string;
}

export interface QuickReplyCreate {
    shortcut: string;
    content: string;
    channel: string;
}

// ── SLA ──────────────────────────────────────────────────────────────────────
export interface SlaPolicy {
    id: string;
    channel: string;
    priority: string;
    response_minutes: number;
}

export interface UnreadSummary {
    total_unread: number;
    per_channel: Record<string, number>;
}

// ── Agent Presence ───────────────────────────────────────────────────────────
export interface AgentPresence {
    status: 'online' | 'busy' | 'away';
}

export interface AgentInfo {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    roles?: string[];
    presence_status?: 'online' | 'busy' | 'away';
    active_conversation_count?: number;
}

// ── Customer Create / Order Create / Email ────────────────────────────────────
export interface CustomerCreatePayload {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    customer_type?: string;
}

export interface OrderItem {
    product_id: string;
    sku: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

export interface OrderCreatePayload {
    order_number?: string;
    customer_id: string;
    items: OrderItem[];
    total_amount: number;
    net_amount?: number;
    source?: string;
}

export interface SendEmailPayload {
    to_email: string;
    to_name?: string;
    subject: string;
    content: string;
    content_html?: string;
}

// ── Customer 360 ─────────────────────────────────────────────────────────────
export interface ConfirmationEmailLog {
    batch_id: string;
    sent_at: string;
    sent_by?: string;
    conversation_id?: string;
    recipient_email: string;
}

export interface CustomerOrder {
    id: string;
    order_number: string;
    created_at: string;
    total_amount: number;
    status: string;
    item_count: number;
    confirmation_emails?: ConfirmationEmailLog[];
}

export interface OrderConfirmationRequest {
    order_id: string;
    customer_id: string;
    subject_override?: string;
    agent_note?: string;
    agent_name?: string;
    conversation_id?: string;
    sent_by?: string;
    preview_only?: boolean;
}

export interface OrderConfirmationResult {
    batch_id?: string;
    sent_at?: string;
    recipient_email: string;
    status: 'sent' | 'preview';
    html_preview?: string;
    subject?: string;
}

export interface CustomerOrdersResponse {
    data: CustomerOrder[];
    total: number;
    lifetime_value?: number;
}

// ── Broadcast Campaign ───────────────────────────────────────────────────────
export interface BroadcastCampaign {
    id: string;
    name: string;
    channel: string;
    template_id: string;
    status: 'draft' | 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    recipient_count_estimate: number;
    scheduled_at?: string;
    created_at?: string;
    stats?: {
        sent: number;
        delivered: number;
        failed: number;
        opened: number;
    };
}

export interface BroadcastCreate {
    name: string;
    channel: string;
    template_id: string;
    variables_map: Record<string, string>;
    audience_filter: {
        tags?: string[];
        status?: string;
        channel_subscribed?: string;
    };
    scheduled_at?: string | null;
}

export interface BroadcastEstimate {
    count: number;
}

// ── Telegram Rich Templates (v2) ──────────────────────────────────────────────

export interface TelegramInlineButton {
    text: string;
    url?: string;
    callback_data?: string;
    web_app_url?: string;
    switch_inline_query?: string;
}

export interface TelegramReplyButton {
    text: string;
    request_contact?: boolean;
    request_location?: boolean;
}

export interface TelegramKeyboard {
    type: 'inline_keyboard' | 'reply_keyboard' | 'reply_keyboard_remove' | 'force_reply';
    inline_keyboard?: TelegramInlineButton[][];
    keyboard?: TelegramReplyButton[][];
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    input_field_placeholder?: string;
}

export interface TelegramTemplatePayload {
    text?: string;
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    media_url?: string;
    caption?: string;
    question?: string;
    poll_options?: { text: string }[];
    poll_type?: 'regular' | 'quiz';
    is_anonymous?: boolean;
    correct_option_id?: number;
    latitude?: number;
    longitude?: number;
    venue_title?: string;
    address?: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
    dice_emoji?: string;
    media_group?: { type: string; media: string; caption?: string }[];
    invoice_title?: string;
    invoice_description?: string;
    invoice_currency?: string;
    invoice_prices?: { label: string; amount: number }[];
    invoice_photo_url?: string;
    keyboard?: TelegramKeyboard;
    disable_notification?: boolean;
    protect_content?: boolean;
}

export interface TelegramRichTemplate {
    id: string;
    template_id: string;
    name: string;
    description?: string;
    category: string;
    message_type: string;
    payload: TelegramTemplatePayload;
    variables: string[];
    tags: string[];
    enabled: boolean;
    is_builtin: boolean;
    priority: number;
    created_at?: string;
    updated_at?: string;
}
