import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { OverlayPanelModule } from 'primeng/overlaypanel';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface Tutorial {
  title: string;
  description: string;
  videoUrl?: string;
  steps: string[];
  category: string;
}

interface HelpTopic {
  title: string;
  description: string;
  icon: string;
  content: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TabViewModule,
    AccordionModule,
    DialogModule,
    TooltipModule,
    OverlayPanelModule
  ],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss'
})
export class SupportComponent implements OnInit {
  activeTabIndex = 0;
  searchTerm = '';

  // FAQ data
  faqs: FAQ[] = [
    {
      question: 'How do I add a new product?',
      answer: 'Go to Products section, click "Add Product" button, fill in the required fields like name, SKU, category, and save.',
      category: 'Products'
    },
    {
      question: 'How to create an inbound movement?',
      answer: 'Navigate to Movements section, click "New Movement", select "Inbound" type, choose product, enter quantity and supplier details.',
      category: 'Movements'
    },
    {
      question: 'What does low stock alert mean?',
      answer: 'Low stock alert appears when product quantity falls below the minimum stock level you set. Check the Overview dashboard for alerts.',
      category: 'Alerts'
    },
    {
      question: 'How to generate reports?',
      answer: 'Go to Reports section, select the report type, set date range and filters, then click "Generate Report" or export options.',
      category: 'Reports'
    },
    {
      question: 'How to scan barcodes?',
      answer: 'Use the barcode scanner feature in mobile app or connect external barcode scanner to quickly add/remove inventory items.',
      category: 'Scanning'
    }
  ];

  filteredFaqs: FAQ[] = [];

  // Tutorials data
  tutorials: Tutorial[] = [
    {
      title: 'Getting Started with Inventory',
      description: 'Learn the basics of inventory management',
      steps: [
        'Navigate to Overview for dashboard insights',
        'Add your first products in Products section',
        'Set up suppliers and categories',
        'Create your first inbound movement'
      ],
      category: 'Basics'
    },
    {
      title: 'Managing Stock Movements',
      description: 'How to handle inbound and outbound transactions',
      steps: [
        'Go to Movements section',
        'Click "New Movement"',
        'Select movement type (Inbound/Outbound)',
        'Fill product and quantity details',
        'Confirm and save the movement'
      ],
      category: 'Movements'
    },
    {
      title: 'Setting Up Alerts',
      description: 'Configure stock level notifications',
      steps: [
        'Edit product settings',
        'Set minimum and maximum stock levels',
        'Enable notifications in settings',
        'Monitor alerts in Overview dashboard'
      ],
      category: 'Alerts'
    }
  ];

  // Help topics
  helpTopics: HelpTopic[] = [
    {
      title: 'Quick Start Guide',
      description: 'Get up and running in minutes',
      icon: 'pi pi-play-circle',
      content: 'Follow our step-by-step guide to set up your inventory system quickly and efficiently.'
    },
    {
      title: 'Product Management',
      description: 'Learn about adding and managing products',
      icon: 'pi pi-box',
      content: 'Comprehensive guide on product catalog management, categories, and product information.'
    },
    {
      title: 'Stock Control',
      description: 'Understanding stock levels and alerts',
      icon: 'pi pi-exclamation-triangle',
      content: 'How to monitor stock levels, set up alerts, and maintain optimal inventory levels.'
    },
    {
      title: 'Reporting',
      description: 'Generate and analyze inventory reports',
      icon: 'pi pi-chart-bar',
      content: 'Learn to create various reports for inventory analysis and business insights.'
    },
    {
      title: 'Mobile Access',
      description: 'Using inventory on mobile devices',
      icon: 'pi pi-mobile',
      content: 'Access your inventory system on smartphones and tablets with full functionality.'
    }
  ];

  // Search and filter
  selectedCategory = '';
  categories = ['All', 'Products', 'Movements', 'Alerts', 'Reports', 'Scanning', 'Basics'];

  constructor() { }

  ngOnInit() {
    this.filteredFaqs = [...this.faqs];
  }

  onSearch() {
    this.filterFaqs();
  }

  onCategoryChange() {
    this.filterFaqs();
  }

  filterFaqs() {
    this.filteredFaqs = this.faqs.filter(faq => {
      const matchesSearch = !this.searchTerm ||
        faq.question.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = !this.selectedCategory || this.selectedCategory === 'All' ||
        faq.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filterFaqs();
  }

  getCategoryTutorials(category: string): Tutorial[] {
    return this.tutorials.filter(t => t.category === category);
  }

  openHelpDialog(topic: HelpTopic) {
    // Implement help dialog
    console.log('Opening help for:', topic.title);
  }

  contactSupport() {
    // Implement contact support
    console.log('Contacting support...');
  }

  downloadUserGuide() {
    // Implement download guide
    console.log('Downloading user guide...');
  }
}