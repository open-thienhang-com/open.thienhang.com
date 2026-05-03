import { MenuItem } from './models/menu-item';

export const sidebarGroups: MenuItem[] = [];

export const menu: MenuItem[] = [
    {
        label: 'Governance',
        icon: 'pi pi-shield',
        type: 'item',
        expanded: false,
        children: [
            { label: 'Onboarding', url: '/governance/proposal', icon: 'pi pi-th-large' },
            {
                label: 'Identity',
                icon: 'pi pi-id-card',
                expanded: false,
                children: [
                    { label: 'Tenants', url: '/governance/tenants', icon: 'pi pi-sitemap' },
                    { label: 'Users', url: '/governance/users', icon: 'pi pi-user' },
                    { label: 'Accounts', url: '/governance/accounts', icon: 'pi pi-building' },
                    { label: 'Teams', url: '/governance/teams', icon: 'pi pi-users' },
                    // { label: 'Branches', url: '/governance/branches', icon: 'pi pi-sitemap' },
                ]
            },
            {
                label: 'Access Control',
                icon: 'pi pi-lock',
                expanded: false,
                children: [
                    { label: 'Roles', url: '/governance/roles', icon: 'pi pi-tag' },
                    { label: 'Permissions', url: '/governance/permissions', icon: 'pi pi-key' },
                    { label: 'Policies', url: '/governance/policies', icon: 'pi pi-lock' },
                    { label: 'Assets', url: '/governance/assets', icon: 'pi pi-database' },
                    // { label: 'Entitlements', url: '/governance/entitlements', icon: 'pi pi-key' },
                ]
            },
            // {
            //     label: 'RBAC & Admin',
            //     icon: 'pi pi-cog',
            //     expanded: false,
            //     children: [
            //         { label: 'RBAC Engine', url: '/governance/casbin', icon: 'pi pi-shield' },
            //         { label: 'Admin Tools', url: '/governance/admin', icon: 'pi pi-wrench' },
            //     ]
            // },
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
                    { label: 'Warehouses', url: '/inventory/delivery-points', icon: 'pi pi-map-marker' },
                ]
            },
            {
                label: 'Inventory',
                icon: 'pi pi-box',
                children: [
                    { label: 'Stock Analytics', url: '/inventory/analytics', icon: 'pi pi-chart-bar' },
                ]
            },
            {
                label: 'Forecasting',
                icon: 'pi pi-chart-line',
                children: [
                    { label: 'Demand Forecast', url: '/inventory/forecast/demand', icon: 'pi pi-chart-bar' },
                ]
            },
            {
                label: 'Fleet & Routes',
                icon: 'pi pi-truck',
                children: [
                    { label: 'Truck', url: '/inventory/fleet', icon: 'pi pi-truck' },
                    { label: 'Vehicles', url: '/planning/vehicles', icon: 'pi pi-list' },
                    { label: 'Planning', url: '/planning/auto-planning', icon: 'pi pi-directions' },
                ]
            },
        ]
    },
    {
        label: 'Sales & Commerce',
        icon: 'pi pi-shopping-bag',
        type: 'item',
        expanded: true,
        children: [
            { label: 'Overview', url: '/retail/overview', icon: 'pi pi-th-large' },
            { label: 'Transactions', url: '/retail/transactions', icon: 'pi pi-receipt' },
            { label: 'Orders', url: '/retail/orders', icon: 'pi pi-list' },
            { label: 'Ecommerce', url: '/retail/ecommerce', icon: 'pi pi-shopping-cart' },
            { label: 'POS', url: '/retail/pos', icon: 'pi pi-desktop' },
            { label: 'Payment', url: '/retail/payment', icon: 'pi pi-credit-card' },
        ]
    },
];
