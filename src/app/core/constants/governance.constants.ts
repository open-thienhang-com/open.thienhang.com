export const FRESH_RETAIL_TENANT_ID = 'fresh_retail';

export const FRESH_RETAIL_TEAMS = {
  MANAGEMENT: 'team:fr:management',
  OPERATIONS: 'team:fr:operations',
  INVENTORY:  'team:fr:inventory',
} as const;

export const FRESH_RETAIL_ROLES = {
  ADMIN:         'role:tenant_admin',
  EDITOR:        'role:editor',
  VIEWER:        'role:viewer',
  USER:          'role:user',
  DATA_ENGINEER: 'role:data_engineer',
} as const;

export const FRESH_RETAIL_ASSETS = {
  DB_POS:             'asset:fr:db:pos',
  TABLE_TRANSACTIONS: 'asset:fr:table:transactions',
  TABLE_INVENTORY:    'asset:fr:table:inventory',
  TABLE_CUSTOMERS:    'asset:fr:table:customers',
  TABLE_PRODUCTS:     'asset:fr:table:products',
  TABLE_EMPLOYEES:    'asset:fr:table:employees',
  TABLE_ORDERS:       'asset:fr:table:orders',
  TABLE_BRANCHES:     'asset:fr:table:branches',
  PIPELINE_SALES_ETL: 'asset:fr:pipeline:sales-etl',
  PIPELINE_INV_SYNC:  'asset:fr:pipeline:inventory-sync',
  PIPELINE_C360:      'asset:fr:pipeline:customer-360',
  DASHBOARD_SALES:    'asset:fr:dashboard:sales',
  DASHBOARD_INV:      'asset:fr:dashboard:inventory',
  API_POS:            'asset:fr:api:pos-api',
  API_INVENTORY:      'asset:fr:api:inventory-api',
} as const;

export const FRESH_RETAIL_DATA_PRODUCTS = {
  DAILY_SALES:        'dp:fr:daily-sales',
  INVENTORY_SNAPSHOT: 'dp:fr:inventory-snapshot',
  CUSTOMER_360:       'dp:fr:customer-360',
  TRANSACTION_LOG:    'dp:fr:transaction-log',
} as const;

export const FRESH_RETAIL_POLICIES = {
  ADMIN_ACCESS:      'policy:fresh-retail:admin-access',
  SALES_ACCESS:      'policy:fresh-retail:sales-access',
  INVENTORY_ACCESS:  'policy:fresh-retail:inventory-access',
  PII_STRICT:        'policy:fresh-retail:pii-strict',
  CASHIER_OPS:       'policy:fresh-retail:cashier-ops',
  REPORTING:         'policy:fresh-retail:reporting',
  TRANSACTION_AUDIT: 'policy:fresh-retail:transaction-audit',
  DATA_QUALITY:      'policy:fresh-retail:data-quality',
} as const;

export const FRESH_RETAIL_DOMAIN_ID = 'domain:retail';
