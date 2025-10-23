import { Injectable } from '@angular/core';

export interface ArticleMock {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  tags: string[];
  featured?: boolean;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class MockArticlesService {
  getAll(): ArticleMock[] {
    return [
      { id: 'a1', title: 'Launching the New Data Mesh Blog', excerpt: 'Welcome — a place to share patterns and practical tips.', author: 'Admin', date: '2025-10-10', tags: ['Announcement', 'Intro'], featured: true, image: '/assets/images/sign-in-bg.jpg' },
      { id: 'a2', title: 'How we model product domains for scale', excerpt: 'Principles and step-by-step guide to design product domains.', author: 'Jane Nguyen', date: '2025-09-28', tags: ['Architecture', 'Domains'], image: '/assets/images/sign-in-container.png' },
      { id: 'a3', title: 'Practical governance for data consumers', excerpt: 'Guardrails to protect consumers and enable velocity.', author: 'Liam Tran', date: '2025-09-12', tags: ['Governance'], image: '/assets/images/sign-in-img.png' },
      { id: 'a4', title: 'Reducing noise in data product contracts', excerpt: 'Pattern to reduce churn and make contracts resilient.', author: 'Minh Le', date: '2025-08-30', tags: ['Data Contracts'], image: '/assets/images/room-placeholder.svg' },
      { id: 'a5', title: 'Observability patterns for data pipelines', excerpt: 'Instrumentation tips and dashboards to reduce MTTR.', author: 'An Pham', date: '2025-08-15', tags: ['Observability'], image: '/assets/images/forgot-password.png' }
    ];
  }
}
