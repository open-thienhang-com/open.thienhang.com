export const FRESH_RETAIL_FEATURE_CONFIG = {
  title: 'Fresh Retail Platform',
  subtitle: 'A multi-tenant platform for digital inventory control, demand forecasting, and omnichannel retail operations for fresh goods in Vietnam.',
  icon: 'pi pi-shop',
  accent: '#15803d',
  stats: [
    { label: 'Target Users', value: 'Small retailers', trend: 'Households to local chains' },
    { label: 'Core Promise', value: 'Less spoilage', trend: 'Smarter replenishment' },
    { label: 'Forecast Inputs', value: 'Sales + chat', trend: 'Demand signals unified' },
    { label: 'Architecture', value: 'Multi-tenant', trend: 'Tenant isolation by design' }
  ],
  actions: [
    { label: 'Explore Inventory', icon: 'pi pi-box', description: 'Track stock, product movement, and supplier relationships' },
    { label: 'Review Demand Forecast', icon: 'pi pi-chart-line', description: 'Use sales, seasonality, and digital inquiries to estimate demand' },
    { label: 'Open Auto Planning', icon: 'pi pi-directions', description: 'Turn warehouse, demand, and vehicle data into route plans' }
  ],
  highlights: [
    { label: 'Business model', value: 'Multi-tenant workspace for independent retailers' },
    { label: 'Planning signal', value: 'Sales history, seasonality, and chat demand signals' },
    { label: 'Target market', value: 'Vietnam fresh food households, stores, and local chains' },
    { label: 'Operational goal', value: 'Reduce waste while keeping products available daily' }
  ],
  sections: [
    {
      title: 'Inventory Control',
      description: 'Track quantities, stock movements, supplier relationships, and warehouse activity in one shared operational model.'
    },
    {
      title: 'Demand Forecasting',
      description: 'Use historical sales, seasonal shifts, and customer inquiries from digital channels to estimate future demand more accurately.'
    },
    {
      title: 'Omni-channel Demand Signals',
      description: 'Capture requests from messaging apps, social channels, and online chat to expose early buying intent before demand is visible in sales.'
    },
    {
      title: 'Tenant Isolation and Access',
      description: 'Support multiple retailers on one platform while keeping data isolated and access governed through role-based controls.'
    }
  ],
  checklist: [
    'Centralized inventory visibility for fresh goods',
    'Demand forecasting using historical and communication data',
    'Role-based access control for each retailer',
    'Scalable multi-tenant workspace with secure data isolation'
  ],
  readinessScore: 92
};
