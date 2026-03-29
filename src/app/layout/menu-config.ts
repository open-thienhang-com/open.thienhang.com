import { MenuItem } from './models/menu-item';

export const sidebarGroups: MenuItem[] = [
    {
        label: 'Explore',
        icon: 'pi pi-compass',
        expanded: false,
        children: [
            {
                label: 'Data Mesh',
                icon: 'pi pi-sitemap',
                children: [
                    { label: 'Data Products', url: '/data-mesh/data-products', icon: 'pi pi-shopping-cart' },
                    { label: 'Domains', url: '/data-mesh/domains', icon: 'pi pi-book' },
                    { label: 'API Explorer', url: '/data-mesh/api-explorer', icon: 'pi pi-code' },
                ]
            },
            { label: 'Database', url: '/explore/database', icon: 'pi pi-database' },
            { label: 'Pipelines', url: '/explore/pipelines', icon: 'pi pi-sliders-h' },
            { label: 'Topics', url: '/explore/topics', icon: 'pi pi-tags' },
            { label: 'ML Models', url: '/explore/ml-models', icon: 'pi pi-brain' },
            { label: 'Container', url: '/explore/container', icon: 'pi pi-box' },
            { label: 'Search', url: '/explore/search', icon: 'pi pi-search' }
        ]
    }
];

export const menu: MenuItem[] = [
    {
        label: 'Data Mesh Management',
        icon: 'pi pi-sitemap',
        type: 'item',
        expanded: true,
        children: [
            {
                label: 'Data Products',
                icon: 'pi pi-shopping-cart',
                expanded: false,
                children: [
                    { label: 'Catalog', url: '/data-mesh/data-products/catalog', icon: 'pi pi-list' },
                    { label: 'Discovery', url: '/data-mesh/data-products/discovery', icon: 'pi pi-search' },
                    { label: 'Assets', url: '/data-mesh/data-products/assets', icon: 'pi pi-database' },
                    { label: 'Lineage', url: '/data-mesh/data-products/lineage', icon: 'pi pi-share-alt' },
                    { label: 'Policies', url: '/data-mesh/data-products/policies', icon: 'pi pi-lock' },
                    { label: 'Monitoring', url: '/data-mesh/data-products/monitoring', icon: 'pi pi-chart-line' }
                ]
            },
            {
                label: 'Data Domains',
                icon: 'pi pi-book',
                expanded: false,
                children: [
                    { label: 'Catalog', url: '/data-mesh/domains/catalog', icon: 'pi pi-list' },
                    { label: 'Discovery', url: '/data-mesh/domains/discovery', icon: 'pi pi-search' },
                    { label: 'Assets', url: '/data-mesh/domains/assets', icon: 'pi pi-database' },
                    { label: 'Lineage', url: '/data-mesh/domains/lineage', icon: 'pi pi-share-alt' },
                    { label: 'Policies', url: '/data-mesh/domains/policies', icon: 'pi pi-lock' },
                    { label: 'Monitoring', url: '/data-mesh/domains/monitoring', icon: 'pi pi-chart-line' }
                ]
            },
        ]
    },
    {
        label: 'Governance',
        icon: 'pi pi-shield',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Teams', url: '/governance/teams', icon: 'pi pi-users' },
            { label: 'Users', url: '/governance/users', icon: 'pi pi-user' },
            { label: 'Accounts', url: '/governance/accounts', icon: 'pi pi-building' },
            { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database' },
            { label: 'Permissions', url: '/governance/permissions', icon: 'pi pi-key' },
            { label: 'Roles', url: '/governance/roles', icon: 'pi pi-users' },
            { label: 'Policies', url: '/governance/policies', icon: 'pi pi-lock' }
        ]
    },
    {
        label: 'Inventory Management',
        icon: 'pi pi-box',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Overview', url: '/inventory/overview', icon: 'pi pi-th-large' },
            { label: 'Products', url: '/inventory/products', icon: 'pi pi-tag' },
            { label: 'Categories', url: '/inventory/categories', icon: 'pi pi-list' },
            { label: 'Warehouses', url: '/inventory/warehouses', icon: 'pi pi-building' },
            { label: 'Suppliers', url: '/inventory/suppliers', icon: 'pi pi-truck' },
            { label: 'Partners', url: '/inventory/partners', icon: 'pi pi-users' },
            { label: 'Stock Analytics', url: '/inventory/analytics', icon: 'pi pi-chart-bar' },
        ]
    },
    {
        label: 'Loyalty & CRM',
        icon: 'pi pi-heart',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Loyalty Overview', url: '/loyalty/overview', icon: 'pi pi-home' },
            { label: 'Members', url: '/loyalty/members', icon: 'pi pi-users' },
            { label: 'Rewards Catalog', url: '/loyalty/rewards', icon: 'pi pi-gift' },
            { label: 'Campaigns', url: '/loyalty/campaigns', icon: 'pi pi-megaphone' },
            { label: 'Channels', url: '/loyalty/channels', icon: 'pi pi-share-alt' },
        ]
    },
    {
        label: 'Retail Operations',
        icon: 'pi pi-shopping-bag',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Store Analytics', url: '/retail/analytics', icon: 'pi pi-chart-line' },
            { label: 'Order Management', url: '/retail/orders', icon: 'pi pi-send' },
            {
                label: 'Point of Sale (POS)',
                icon: 'pi pi-desktop',
                children: [
                    { label: 'Register', url: '/retail/pos/register', icon: 'pi pi-calculator' },
                    { label: 'Transactions', url: '/retail/pos/transactions', icon: 'pi pi-receipt' },
                    { label: 'Session History', url: '/retail/pos/sessions', icon: 'pi pi-history' },
                    { label: 'Terminal Settings', url: '/retail/pos/settings', icon: 'pi pi-cog' }
                ]
            },
            { label: 'Retail Settings', url: '/retail/settings', icon: 'pi pi-cog' },
        ]
    },
    {
        label: 'Chat & Collaboration',
        icon: 'pi pi-comments',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Chat Overview', url: '/chat', icon: 'pi pi-home' },
            { label: 'Channels', url: '/chat/channels', icon: 'pi pi-hashtag' },
            { label: 'Direct Messages', url: '/chat/messages', icon: 'pi pi-user' },
            { label: 'Chat Analytics', url: '/chat/analytics', icon: 'pi pi-chart-bar' },
            { label: 'Chat Settings', url: '/chat/settings', icon: 'pi pi-cog' }
        ]
    },
    {
        label: 'Ad Manager',
        icon: 'pi pi-bullhorn',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Ad Overview', url: '/ad-manager', icon: 'pi pi-chart-line' },
            { label: 'Campaigns', url: '/ad-manager/campaigns', icon: 'pi pi-megaphone' },
            { label: 'Creative Library', url: '/ad-manager/creatives', icon: 'pi pi-images' },
            { label: 'Ad Placements', url: '/ad-manager/placements', icon: 'pi pi-map-marker' },
            { label: 'Settings', url: '/ad-manager/settings', icon: 'pi pi-cog' }
        ]
    },
    {
        label: 'Blogger',
        icon: 'pi pi-pencil',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Dashboard', url: '/blogger', icon: 'pi pi-home' },
            { label: 'Posts', url: '/blogger/posts', icon: 'pi pi-file-edit' },
            { label: 'Authors', url: '/blogger/authors', icon: 'pi pi-users' },
            { label: 'Categories', url: '/blogger/categories', icon: 'pi pi-tags' }
        ]
    },
    {
        label: 'File Manager',
        icon: 'pi pi-folder',
        type: 'item',
        expanded: false,
        children: [
            { label: 'My Files', url: '/files', icon: 'pi pi-folder-open' },
            { label: 'Shared with Me', url: '/files/shared', icon: 'pi pi-users' },
            { label: 'Recent', url: '/files/recent', icon: 'pi pi-clock' },
            { label: 'Trash', url: '/files/trash', icon: 'pi pi-trash' }
        ]
    },
    {
        label: 'Travel',
        icon: 'pi pi-globe',
        type: 'item',
        url: '/travel'
    },
    {
        label: 'Notification Center',
        icon: 'pi pi-bell',
        type: 'item',
        url: '/notification',
        expanded: true,
        children: [
            { label: 'Overview', url: '/notification', icon: 'pi pi-home' },
            {
                label: 'Templates',
                icon: 'pi pi-copy',
                expanded: true,
                children: [
                    { label: 'Explorer', url: '/notification/explorer', icon: 'pi pi-list' },
                    { label: 'Composer', url: '/notification/composer', icon: 'pi pi-send' },
                    { label: 'Create Template', url: '/notification/templates/create', icon: 'pi pi-plus' }
                ]
            },
            {
                label: 'Monitoring',
                icon: 'pi pi-chart-line',
                expanded: false,
                children: [
                    { label: 'Audit Log', url: '/notification/audit', icon: 'pi pi-history' },
                    { label: 'Reliability', url: '/notification/reliability', icon: 'pi pi-shield' },
                    { label: 'Performance', url: '/notification/scheduling', icon: 'pi pi-clock' },
                ]
            },
            {
                label: 'Development',
                icon: 'pi pi-code',
                expanded: false,
                children: [
                    { label: 'API Playground', url: '/notification/api', icon: 'pi pi-terminal' },
                ]
            }
        ]
    },
    // Settings intentionally removed from sidebar menu config; Settings is a standalone app
];
