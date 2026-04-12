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

                    { label: 'API Explorer', url: '/data-mesh/api-explorer', icon: 'pi pi-code' },
                ]
            },
            { label: 'Database', url: '/explore/database', icon: 'pi pi-database' },
            { label: 'Google', url: '/explore/google', icon: 'pi pi-google' },
            { label: 'Data Warehouse', url: '/explore/data-warehouse', icon: 'pi pi-server' },

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
        expanded: true,
        children: [
            {
                label: 'Dashboard',
                icon: 'pi pi-th-large',
                children: [
                    { label: 'Overview', url: '/inventory/overview', icon: 'pi pi-th-large' },
                ]
            },
            {
                label: 'Resources',
                icon: 'pi pi-server',
                children: [
                    { label: 'Products', url: '/inventory/products', icon: 'pi pi-tag' },
                    { label: 'Categories', url: '/inventory/categories', icon: 'pi pi-list' },
                    { label: 'Suppliers', url: '/inventory/suppliers', icon: 'pi pi-truck' },
                    { label: 'Partners', url: '/inventory/partners', icon: 'pi pi-users' },
                    { label: 'Delivery Points', url: '/inventory/delivery-points', icon: 'pi pi-map-marker' },
                ]
            },
            {
                label: 'Inventory',
                icon: 'pi pi-box',
                children: [
                    { label: 'Warehouses', url: '/inventory/warehouses', icon: 'pi pi-building' },
                    { label: 'Stock & Products', url: '/inventory/overview', icon: 'pi pi-box' },
                    { label: 'Stock Analytics', url: '/inventory/analytics', icon: 'pi pi-chart-bar' },
                ]
            },
            {
                label: 'Forecasting',
                icon: 'pi pi-chart-line',
                children: [
                    { label: 'Demand Forecast', url: '/inventory/forecast/demand', icon: 'pi pi-chart-bar' },
                    { label: 'Hub Forecast', url: '/inventory/forecast/hub', icon: 'pi pi-building' },
                    { label: 'Trip Forecast', url: '/inventory/forecast/trip', icon: 'pi pi-map' },
                    { label: 'Truck Load', url: '/inventory/forecast/truck', icon: 'pi pi-box' },
                ]
            },
            {
                label: 'Fleet & Routes',
                icon: 'pi pi-truck',
                children: [
                    { label: 'Fleet Management', url: '/inventory/fleet', icon: 'pi pi-truck' },
                    { label: 'Auto Planning', url: '/planning/auto-planning', icon: 'pi pi-directions' },
                ]
            },
        ]
    },
    {
        label: 'CRM & Customers',
        icon: 'pi pi-users',
        type: 'item',
        expanded: false,
        children: [
            {
                label: 'Overview & Members',
                icon: 'pi pi-home',
                type: 'item',
                expanded: false,
                children: [
                    { label: 'Overview',        url: '/loyalty/overview',  icon: 'pi pi-home' },
                    { label: 'Members',         url: '/loyalty/members',   icon: 'pi pi-users' },
                    { label: 'Customers',       url: '/retail/customers',  icon: 'pi pi-user' },
                    { label: 'Channels',        url: '/loyalty/channels',  icon: 'pi pi-share-alt' },
                ]
            },
            {
                label: 'Rewards & Campaigns',
                icon: 'pi pi-megaphone',
                type: 'item',
                expanded: false,
                children: [
                    { label: 'Rewards Catalog', url: '/loyalty/rewards',    icon: 'pi pi-gift' },
                    { label: 'Campaigns',        url: '/loyalty/campaigns',  icon: 'pi pi-megaphone' },
                    { label: 'Segments',         url: '/loyalty/segments',   icon: 'pi pi-filter' },
                    { label: 'Automation',       url: '/loyalty/automation', icon: 'pi pi-bolt' },
                ]
            },
            {
                label: 'Strategy & Analytics',
                icon: 'pi pi-chart-bar',
                type: 'item',
                expanded: false,
                children: [
                    { label: 'Loyalty Strategy', url: '/loyalty/strategy',  icon: 'pi pi-sitemap' },
                    { label: 'Analytics',        url: '/loyalty/analytics', icon: 'pi pi-chart-bar' },
                ]
            },
        ]
    },
    {
        label: 'Sales & Commerce',
        icon: 'pi pi-shopping-bag',
        type: 'item',
        expanded: false,
        children: [
            {
                label: 'Sales & Orders',
                icon: 'pi pi-send',
                children: [
                    { label: 'Overview', url: '/retail/overview', icon: 'pi pi-th-large' },
                    { label: 'Order List', url: '/retail/orders', icon: 'pi pi-list' },
                    { label: 'Transactions', url: '/retail/transactions', icon: 'pi pi-receipt' },
                    { label: 'Payment', url: '/retail/payment', icon: 'pi pi-credit-card' },
                    { label: 'Analytics', url: '/retail/analytics', icon: 'pi pi-chart-bar' },
                ]
            },
            {
                label: 'Ecommerce',
                icon: 'pi pi-tag',
                children: [
                    { label: 'Product List', url: '/retail/products', icon: 'pi pi-tags' },
                    { label: 'Ecommerce Store', url: '/retail/ecommerce', icon: 'pi pi-shopping-cart' },
                ]
            },
            {
                label: 'Omni-channel',
                icon: 'pi pi-comments',
                children: [
                    { label: 'Channels Overview', url: '/retail/omni-channel', icon: 'pi pi-share-alt' },
                    { label: 'Chat & Messaging', url: '/chat/conversations', icon: 'pi pi-hashtag' },
                ]
            },
            {
                label: 'Point of Sale',
                icon: 'pi pi-desktop',
                children: [
                    { label: 'POS Dashboard', url: '/retail/pos', icon: 'pi pi-home' },
                    { label: 'Fresh Retail', url: '/retail/fresh-retail', icon: 'pi pi-shopping-bag' },
                ]
            },
        ]
    },
    {
        label: 'Messaging Platform',
        icon: 'pi pi-comments',
        type: 'item',
        expanded: true,
        children: [
            { label: 'Overview', url: '/chat/overview', icon: 'pi pi-home' },
            {
                label: '1. Messaging',
                icon: 'pi pi-send',
                children: [
                    { label: 'Conversations', url: '/chat/conversations', icon: 'pi pi-comments' },
                    { label: 'Composer', url: '/notification/composer', icon: 'pi pi-pencil' },
                    { label: 'Explorer', url: '/notification/explorer', icon: 'pi pi-list' },
                ]
            },
            {
                label: '2. Templates',
                icon: 'pi pi-copy',
                children: [
                    { label: 'Manage Templates', url: '/chat/templates', icon: 'pi pi-list' },
                    { label: 'Create Template', url: '/notification/templates/create', icon: 'pi pi-plus' },
                ]
            },
            {
                label: '3. Automation',
                icon: 'pi pi-bolt',
                children: [
                    { label: 'Workflows', url: '/chat/automation', icon: 'pi pi-directions' },
                    { label: 'Bot Settings', url: '/chat/bot-settings', icon: 'pi pi-cog' },
                ]
            },
            {
                label: '4. Channels',
                icon: 'pi pi-share-alt',
                children: [
                    { label: 'Omni-channel', url: '/retail/omni-channel', icon: 'pi pi-sync' },
                ]
            },
            {
                label: '5. Monitoring',
                icon: 'pi pi-chart-line',
                children: [
                    { label: 'Delivery Health', url: '/chat/delivery-health', icon: 'pi pi-heart' },
                    { label: 'Reliability', url: '/notification/reliability', icon: 'pi pi-shield' },
                    { label: 'Performance', url: '/notification/scheduling', icon: 'pi pi-clock' },
                ]
            },
            {
                label: '6. System',
                icon: 'pi pi-code',
                children: [
                    { label: 'Audit Log', url: '/notification/audit', icon: 'pi pi-history' },
                    { label: 'API Playground', url: '/notification/api', icon: 'pi pi-terminal' },
                ]
            }
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
        label: 'Travel Explorer',
        icon: 'pi pi-globe',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Travel Overview', url: '/travel', icon: 'pi pi-home' },
            { label: 'Itineraries', url: '/travel/itineraries', icon: 'pi pi-list' },
            { label: 'Destinations', url: '/travel/destinations', icon: 'pi pi-map-marker' }
        ]
    },
    {
        label: 'Hotel Management',
        icon: 'pi pi-building',
        type: 'item',
        expanded: false,
        children: [
            {
                label: 'Property Management',
                icon: 'pi pi-home',
                children: [
                    { label: 'Apartments', url: '/hotel/apartments', icon: 'pi pi-building' },
                    { label: 'Rooms', url: '/hotel/rooms', icon: 'pi pi-door-open' },
                    { label: 'Inventory', url: '/hotel/inventory', icon: 'pi pi-box' }
                ]
            },
            {
                label: 'Reservations & Bookings',
                icon: 'pi pi-calendar',
                children: [
                    { label: 'Bookings', url: '/hotel/bookings', icon: 'pi pi-calendar-check' },
                    { label: 'Calendar', url: '/hotel/calendar', icon: 'pi pi-calendar' },
                    { label: 'Check-in', url: '/hotel/checkin', icon: 'pi pi-sign-in' }
                ]
            },
            {
                label: 'Guest Services',
                icon: 'pi pi-users',
                children: [
                    { label: 'Guests', url: '/hotel/guests', icon: 'pi pi-user' },
                    { label: 'Reviews', url: '/hotel/reviews', icon: 'pi pi-star' },
                    { label: 'Support', url: '/hotel/support', icon: 'pi pi-comments' }
                ]
            },
            {
                label: 'Operations & Staff',
                icon: 'pi pi-wrench',
                children: [
                    { label: 'Maintenance', url: '/hotel/maintenance', icon: 'pi pi-wrench' },
                    { label: 'Staff Management', url: '/hotel/staff', icon: 'pi pi-users' },
                    { label: 'Settings', url: '/hotel/settings', icon: 'pi pi-cog' }
                ]
            }
        ]
    },
    // Settings intentionally removed from sidebar menu config; Settings is a standalone app
];
