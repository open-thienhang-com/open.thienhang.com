export interface ChatWorkspaceLink {
  label: string;
  description: string;
  icon: string;
  route: string;
}

export const CHAT_WORKSPACE_LINKS: ChatWorkspaceLink[] = [
  {
    label: 'Telegram Workspace',
    description: 'Inbox and active conversations for support agents.',
    icon: 'pi pi-comments',
    route: '/cmc'
  },
  {
    label: 'Templates',
    description: 'Reusable replies and welcome messages.',
    icon: 'pi pi-file-edit',
    route: '/cmc/templates'
  },
  {
    label: 'Automation',
    description: 'Commands and broadcast operations.',
    icon: 'pi pi-bolt',
    route: '/cmc/automation'
  },
  {
    label: 'Bot Settings',
    description: 'Telegram identity, routing, and contact links.',
    icon: 'pi pi-cog',
    route: '/cmc/bot-settings'
  },
  {
    label: 'Delivery Health',
    description: 'Webhook sync and operational counters.',
    icon: 'pi pi-shield',
    route: '/cmc/delivery-health'
  }
];
