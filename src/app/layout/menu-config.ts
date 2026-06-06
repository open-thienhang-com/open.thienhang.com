import { MenuItem } from './models/menu-item';

export const sidebarGroups: MenuItem[] = [
    {
        label: 'Explore',
        icon: 'pi pi-compass',
        expanded: false,
        hidden: true,
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
    // {
    //     label: 'Data Mesh Management',
    //     icon: 'pi pi-sitemap',
    //     type: 'item',
    //     expanded: true,
    //     children: [
    //         {
    //             label: 'Data Products',
    //             icon: 'pi pi-shopping-cart',
    //             expanded: false,
    //             children: [
    //                 { label: 'Catalog', url: '/data-mesh/data-products/catalog', icon: 'pi pi-list' },
    //                 { label: 'Discovery', url: '/data-mesh/data-products/discovery', icon: 'pi pi-search' },
    //                 { label: 'Assets', url: '/data-mesh/data-products/assets', icon: 'pi pi-database' },
    //                 { label: 'Lineage', url: '/data-mesh/data-products/lineage', icon: 'pi pi-share-alt' },
    //                 { label: 'Policies', url: '/data-mesh/data-products/policies', icon: 'pi pi-lock' },
    //                 { label: 'Monitoring', url: '/data-mesh/data-products/monitoring', icon: 'pi pi-chart-line' }
    //             ]
    //         },

    //     ]
    // },
    {
        label: 'Governance',
        icon: 'pi pi-shield',
        type: 'item',
        casbinPath: '/governance/*',
        expanded: false,
        children: [
            { label: 'Overview', url: '/governance/proposal', icon: 'pi pi-th-large', casbinPath: '/governance/*' },
            {
                label: 'Identity',
                icon: 'pi pi-id-card',
                expanded: false,
                children: [
                    { label: 'Tenants',  url: '/governance/tenants',  icon: 'pi pi-sitemap',  casbinPath: '/governance/tenant*' },
                    { label: 'Users',    url: '/governance/users',    icon: 'pi pi-user',     casbinPath: '/governance/user*' },
                    { label: 'Accounts', url: '/governance/accounts', icon: 'pi pi-building', casbinPath: '/governance/account*' },
                    { label: 'Teams',    url: '/governance/teams',    icon: 'pi pi-users',    casbinPath: '/governance/team*' },
                    { label: 'Branches', url: '/governance/branches', icon: 'pi pi-sitemap',  casbinPath: '/governance/branch*' },
                ]
            },
            {
                label: 'Access Control',
                icon: 'pi pi-lock',
                expanded: false,
                children: [
                    { label: 'Roles',        url: '/governance/roles',        icon: 'pi pi-tag',      casbinPath: '/governance/role*' },
                    { label: 'Permissions',  url: '/governance/permissions',  icon: 'pi pi-key',      casbinPath: '/governance/permission*' },
                    { label: 'Policies',     url: '/governance/policies',     icon: 'pi pi-lock',     casbinPath: '/governance/polic*' },
                    { label: 'Assets',       url: '/governance/assets',       icon: 'pi pi-database', casbinPath: '/governance/asset*' },
                    { label: 'Entitlements', url: '/governance/entitlements', icon: 'pi pi-key',      casbinPath: '/governance/entitlement*' },
                ]
            },
            {
                label: 'RBAC & Admin',
                icon: 'pi pi-cog',
                expanded: false,
                children: [
                    { label: 'RBAC Engine', url: '/governance/casbin', icon: 'pi pi-shield', casbinPath: '/governance/casbin*' },
                    { label: 'Admin Tools', url: '/governance/admin',  icon: 'pi pi-wrench', casbinPath: '/governance/admin*' },
                ]
            },
        ]
    },
    {
        label: 'Inventory',
        icon: 'pi pi-box',
        type: 'item',
        casbinPath: '/inventory/*',
        expanded: true,
        children: [
            { label: 'Overview', url: '/inventory/overview', icon: 'pi pi-th-large', casbinPath: '/inventory/*' },
            {
                label: 'Resources',
                icon: 'pi pi-server',
                casbinPath: '/inventory/*',
                children: [
                    { label: 'Products',   url: '/inventory/products',        icon: 'pi pi-tag' },
                    { label: 'Categories', url: '/inventory/categories',       icon: 'pi pi-list' },
                    { label: 'Suppliers',  url: '/inventory/suppliers',        icon: 'pi pi-truck' },
                    { label: 'Partners',   url: '/inventory/partners',         icon: 'pi pi-users' },
                    { label: 'Warehouses', url: '/inventory/delivery-points',  icon: 'pi pi-map-marker' },
                    { label: 'Truck',      url: '/inventory/fleet',            icon: 'pi pi-truck' },
                    { label: 'Vehicles',   url: '/planning/vehicles',          icon: 'pi pi-car' },
                ]
            },
            {
                label: 'Stochastic',
                icon: 'pi pi-chart-line',
                casbinPath: '/inventory/*',
                children: [
                    { label: 'Stock Analytics', url: '/inventory/analytics',       icon: 'pi pi-chart-bar' },
                    { label: 'Demand Forecast', url: '/inventory/forecast/demand', icon: 'pi pi-chart-bar' },
                ]
            },
            {
                label: 'Fleet & Routes',
                icon: 'pi pi-directions',
                casbinPath: '/planning/*',
                hidden: true,
                children: [
                    { label: 'Planning', url: '/planning/auto-planning', icon: 'pi pi-directions' },
                ]
            },
        ]
    },
    {
        label: 'Customers',
        icon: 'pi pi-users',
        type: 'item',
        casbinPath: '/loyalty/*',
        expanded: false,
        children: [
            { label: 'Overview', url: '/loyalty/overview', icon: 'pi pi-home' },
            { label: 'Members', url: '/loyalty/members', icon: 'pi pi-users' },
            { label: 'Customers', url: '/retail/customers', icon: 'pi pi-user' },
            { label: 'Channels', url: '/loyalty/channels', icon: 'pi pi-share-alt' },
            { label: 'Rewards Catalog', url: '/loyalty/rewards', icon: 'pi pi-gift' },
            { label: 'Campaigns', url: '/loyalty/campaigns', icon: 'pi pi-megaphone' },
            { label: 'Segments', url: '/loyalty/segments', icon: 'pi pi-filter' },
            { label: 'Automation', url: '/loyalty/automation', icon: 'pi pi-bolt' },
            { label: 'Loyalty Strategy', url: '/loyalty/strategy', icon: 'pi pi-sitemap' },
            { label: 'Analytics', url: '/loyalty/analytics', icon: 'pi pi-chart-bar' }
        ]
    },
    {
        label: 'Sales & Commerce',
        icon: 'pi pi-shopping-bag',
        type: 'item',
        casbinPath: '/retail/*',
        expanded: true,
        children: [
            { label: 'Overview', url: '/retail/overview', icon: 'pi pi-th-large' },
            { label: 'Transactions', url: '/retail/transactions', icon: 'pi pi-receipt' },
            { label: 'Orders', url: '/retail/orders', icon: 'pi pi-list' },
            { label: 'Ecommerce', url: '/retail/ecommerce', icon: 'pi pi-shopping-cart' },
            { label: 'POS', url: '/retail/pos', icon: 'pi pi-desktop' },
            { label: 'Payment', url: '/retail/payment', icon: 'pi pi-credit-card' },
            { label: 'Support', url: '/cmc/workspace', icon: 'pi pi-comments' },
        ]
    },
    {
        label: 'Support',
        icon: 'pi pi-comments',
        type: 'item',
        casbinPath: '/cmc/*',
        expanded: true,
        children: [
            { label: 'Overview',    url: '/cmc/overview',  icon: 'pi pi-home' },
            { label: 'Workspace',   url: '/cmc/workspace', icon: 'pi pi-inbox' },
            { label: 'Templates',   url: '/cmc/explore',   icon: 'pi pi-copy' },
            { label: 'Automation',  url: '/cmc/automation', icon: 'pi pi-bolt' },
        ]
    },

    {
        label: 'Ad Manager',
        icon: 'pi pi-bullhorn',
        type: 'item',
        expanded: false,
        hidden: true,
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
        hidden: true,
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
        label: 'Map',
        icon: 'pi pi-map-marker',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Address Extraction', url: '/map/address-extraction', icon: 'pi pi-map-marker' }
        ]
    },
    {
        label: 'Hotel Management',
        icon: 'pi pi-building',
        type: 'item',
        expanded: false,
        hidden: true,
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
