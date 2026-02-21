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
        label: 'Planning',
        icon: 'pi pi-truck',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Auto Planning', url: '/planning/auto-planning', icon: 'pi pi-cog' },
            { label: 'Stochastic', url: '/planning/stochastic', icon: 'pi pi-chart-pie' },
            { label: 'Fleet', url: '/planning/fleet', icon: 'pi pi-truck' }
        ]
    },
    {
        label: 'Travel',
        icon: 'pi pi-globe',
        type: 'item',
        url: '/travel'
    },
    // Settings intentionally removed from sidebar menu config; Settings is a standalone app
];
