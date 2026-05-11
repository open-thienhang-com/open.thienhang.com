import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguageSubject = new BehaviorSubject<string>('en'); // Default to English
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: { [lang: string]: TranslationKey } = {
    en: {
      // Common
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        search: 'Search',
        filter: 'Filter',
        clear: 'Clear',
        refresh: 'Refresh',
        export: 'Export',
        import: 'Import',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout',
        login: 'Login',
        register: 'Register',
        confirm: 'Confirm',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit',
        reset: 'Reset',
        select: 'Select',
        all: 'All',
        notProvided: 'Not provided',
        unknown: 'Unknown',
        justNow: 'Just now',
        pagination: 'Showing {first} to {last} of {totalRecords} entries'
      },

      // Navigation
      nav: {
        dashboard: 'Dashboard',
        dataMesh: 'Data Mesh',
        domainCatalog: 'Domain Catalog',
        dataProducts: 'Data Products',
        governance: 'Governance',
        observability: 'Observability',
        discovery: 'Discovery',
        explore: 'Explore',
        marketplace: 'Marketplace',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout',
        search: 'Search...',
        notifications: 'Notifications',
        help: 'Help',
        dataContracts: 'Data Contracts'
      },

      // Marketplace translations
      marketplace: {
        title: 'Data Product Marketplace',
        subtitle: 'Discover and manage data products across all domains',
        search: 'Search products...',
        loading: 'Loading products...',
        features: 'Available Features',
        viewDetails: 'View Details',
        getStarted: 'Get Started',
        noResults: 'No products found',
        noResultsDesc: 'Try adjusting your search terms or check back later for new products.',
        
        // Domain-specific features
        domains: {
          hotel: {
            name: 'Hotel Management',
            features: {
              apartmentManagement: 'Apartment Management',
              roomManagement: 'Room Management',
              bookingSystem: 'Booking System',
              ratingReviews: 'Rating & Reviews',
              customerManagement: 'Customer Management',
              assetManagement: 'Asset Management',
              onlineChannels: 'Online Channels'
            }
          },
          device_detector: {
            name: 'Device Detection',
            features: {
              deviceIdentification: 'Device Identification',
              browserDetection: 'Browser Detection',
              mobileDetection: 'Mobile Detection',
              osDetection: 'OS Detection',
              analytics: 'Analytics'
            }
          },
          inventory: {
            name: 'Inventory Management',
            features: {
              stockManagement: 'Stock Management',
              orderTracking: 'Order Tracking',
              supplierManagement: 'Supplier Management',
              reporting: 'Reporting',
              forecasting: 'Forecasting'
            }
          },
          files: {
            name: 'File Management',
            features: {
              fileStorage: 'File Storage',
              fileSharing: 'File Sharing',
              versionControl: 'Version Control',
              metadata: 'Metadata',
              security: 'Security'
            }
          },
          chat: {
            name: 'Chat Platform',
            features: {
              messaging: 'Messaging',
              groupChat: 'Group Chat',
              fileSharing: 'File Sharing',
              notifications: 'Notifications',
              moderation: 'Moderation'
            }
          },
          blogger: {
            name: 'Blogger Platform',
            features: {
              contentManagement: 'Content Management',
              publishing: 'Publishing',
              analytics: 'Analytics',
              seo: 'SEO',
              social: 'Social Media'
            }
          },
          base: {
            name: 'Base Domain',
            features: {
              dataManagement: 'Data Management',
              apiAccess: 'API Access',
              documentation: 'Documentation',
              monitoring: 'Monitoring',
              security: 'Security'
            }
          },
          application: {
            name: 'Application',
            features: {
              deployment: 'Deployment',
              monitoring: 'Monitoring',
              scaling: 'Scaling',
              security: 'Security',
              integration: 'Integration'
            }
          },
          data_warehouse: {
            name: 'Data Warehouse',
            features: {
              dataStorage: 'Data Storage',
              etl: 'ETL',
              analytics: 'Analytics',
              reporting: 'Reporting',
              dataGovernance: 'Data Governance'
            }
          },
          storage: {
            name: 'Storage',
            features: {
              cloudStorage: 'Cloud Storage',
              backup: 'Backup',
              recovery: 'Recovery',
              encryption: 'Encryption',
              scalability: 'Scalability'
            }
          }
        },
        
        // General features for unknown domains
        domainSpecific: 'Domain-specific features available',
        dataAccess: 'Data Access',
        apiIntegration: 'API Integration',
        documentation: 'Documentation',
        monitoring: 'Monitoring',
        security: 'Security'
      },

      // Language
      language: {
        current: 'English',
        vietnamese: 'Vietnamese',
        english: 'English',
        switchTo: 'Switch to'
      },

      // Actions
      actions: {
        create: 'Create',
        edit: 'Edit',
        delete: 'Delete',
        view: 'View',
        save: 'Save',
        cancel: 'Cancel',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        refresh: 'Refresh',
        loadMore: 'Load More',
        showAll: 'Show All',
        collapseAll: 'Collapse All',
        expandAll: 'Expand All'
      },

      // Status
      status: {
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        draft: 'Draft',
        published: 'Published',
        archived: 'Archived',
        deprecated: 'Deprecated',
        maintenance: 'Maintenance'
      },

      // Messages
      messages: {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
        loadingError: 'An error occurred while loading data',
        saveSuccess: 'Successfully saved',
        deleteSuccess: 'Successfully deleted',
        updateSuccess: 'Successfully updated',
        noDataFound: 'No data found'
      },

      // Data Products
      dataProduct: {
        title: 'Data Products',
        name: 'Name',
        description: 'Description',
        domain: 'Domain',
        owner: 'Owner',
        status: 'Status',
        version: 'Version',
        type: 'Type',
        tags: 'Tags',
        created: 'Created',
        updated: 'Updated',
        qualityScore: 'Quality Score',
        subscribers: 'Subscribers',
        apis: 'APIs',
        documentation: 'Documentation',
        schema: 'Schema',
        metrics: 'Metrics',
        overview: 'Overview',
        details: 'Details',
        api: 'API',
        swagger: 'Swagger',
        subscribe: 'Subscribe',
        unsubscribe: 'Unsubscribe',
        
        // Hotel-specific translations
        hotel: {
          title: 'Hotel Management System',
          description: 'Integrated data solution for hotel management',
          dataProduct: {
            actions: {
              downloadSchema: 'Download Schema',
              assets: 'Assets',
              viewSwagger: 'View Swagger',
              subscribe: 'Subscribe',
              unsubscribe: 'Unsubscribe',
              demo: 'Demo'
            },
            tabs: {
              documentation: {
                title: 'Documentation',
                description: 'Interactive API documentation powered by Swagger'
              },
              rooms: {
                title: 'Room Management',
                description: 'Comprehensive room management and occupancy system'
              },
              assets: {
                title: 'Asset Management',
                description: 'Track and manage hotel assets'
              },
              bookings: {
                title: 'Booking Management',
                description: 'Complete booking management system'
              },
              customers: {
                title: 'Customer Management',
                description: 'Customer data analytics and management'
              },
              onlineChannels: {
                title: 'Online Booking Channels',
                description: 'Integration with online booking platforms'
              }
            },
            features: {
              rooms: {
                management: {
                  title: 'Smart Room Management',
                  description: 'Comprehensive room management system with real-time tracking'
                }
              }
            },
            metrics: {
              totalRooms: 'Total Rooms',
              occupancyRate: 'Occupancy Rate',
              averageRating: 'Average Rating'
            },
            roomTypes: {
              standard: 'Standard Room',
              standardDesc: 'Comfortable room with basic amenities',
              deluxe: 'Deluxe Room',
              deluxeDesc: 'Spacious room with beautiful view and enhanced amenities',
              suite: 'Suite Room',
              suiteDesc: 'Luxurious room with separate living space'
            },
            assets: {
              equipment: {
                title: 'Equipment',
                computers: 'Computers',
                phones: 'Phones',
                tvs: 'TVs'
              },
              furniture: {
                title: 'Furniture',
                beds: 'Beds',
                tables: 'Tables',
                chairs: 'Chairs'
              },
              maintenance: {
                title: 'Maintenance',
                scheduled: 'Scheduled',
                pending: 'Pending',
                completed: 'Completed'
              }
            },
            bookings: {
              stats: {
                total: 'Total Bookings',
                confirmed: 'Confirmed',
                pending: 'Pending',
                cancelled: 'Cancelled'
              },
              channels: {
                title: 'Booking Channels',
                direct: 'Direct Booking',
                ota: 'Online Travel Agency',
                phone: 'Phone'
              }
            },
            customers: {
              stats: {
                total: 'Total Customers',
                newThisMonth: 'New This Month',
                loyal: 'Loyal Customers',
                satisfaction: 'Satisfaction'
              },
              segments: {
                title: 'Customer Segments',
                business: 'Business',
                leisure: 'Leisure',
                group: 'Group'
              }
            },
            onlineChannels: {
              facebook: {
                title: 'Facebook',
                followers: 'Followers',
                bookings: 'Bookings',
                rating: 'Rating'
              },
              zalo: {
                title: 'Zalo',
                followers: 'Followers',
                bookings: 'Bookings',
                rating: 'Rating'
              },
              google: {
                title: 'Google',
                reviews: 'Reviews',
                bookings: 'Bookings',
                rating: 'Rating'
              }
            }
          },
          features: {
            apartments: 'Apartment Management',
            rooms: 'Room Management',
            bookings: 'Booking System',
            ratings: 'Ratings',
            reviews: 'Reviews',
            metadata: 'Metadata'
          },
          endpoints: {
            create: 'Create',
            read: 'Read',
            update: 'Update',
            delete: 'Delete',
            list: 'List',
            cancel: 'Cancel',
            version: 'Version',
            overview: 'Overview',
            quality: 'Quality',
            cost: 'Cost',
            features: 'Features',
            summary: 'Summary',
            healthCheck: 'Health Check'
          },
          actions: {
            testEndpoint: 'Test Endpoint',
            copyUrl: 'Copy URL',
            viewSwagger: 'View Swagger',
            downloadSchema: 'Download Schema'
          }
        }
      },

      // Profile
      profile: {
        title: 'My Profile',
        subtitle: 'Manage your account information and preferences',
        
        // Account section
        account: {
          title: 'Account Information',
          subtitle: 'Your personal details and contact information',
          fullName: 'Full Name',
          email: 'Email Address',
          phone: 'Phone Number',
          userId: 'User ID',
          status: 'Status',
          role: 'Role',
          verified: 'Verified'
        },

        // User management section
        users: {
          title: 'User Management',
          subtitle: 'View and manage all users in the system',
          user: 'User',
          fullName: 'Full Name',
          email: 'Email',
          role: 'Role',
          status: 'Status',
          joinedDate: 'Joined Date',
          totalUsers: 'users',
          searchPlaceholder: 'Search users...',
          noUsers: 'No Users Found',
          noUsersMessage: 'No users were found.',
          active: 'Active',
          inactive: 'Inactive'
        },

        // Security section
        security: {
          title: 'Security & Privacy',
          subtitle: 'Manage your account security settings',
          password: 'Password',
          passwordSubtitle: 'Last changed 30 days ago',
          changePassword: 'Change',
          twoFactor: 'Two-Factor Authentication',
          enabled: 'Enabled',
          disabled: 'Disabled',
          enable: 'Enable',
          disable: 'Disable',
          privacy: 'Privacy Settings',
          privacySubtitle: 'Control your data visibility',
          manage: 'Manage',
          dataExport: 'Data Export',
          dataExportSubtitle: 'Download your data',
          export: 'Export'
        },

        // Actions section
        actions: {
          title: 'Quick Actions',
          subtitle: 'Common account management tasks',
          editProfile: 'Edit Profile',
          changePassword: 'Change Password',
          settings: 'Account Settings',
          downloadData: 'Download Data',
          refresh: 'Refresh'
        },

        // Sessions section
        sessions: {
          title: 'Active Sessions',
          subtitle: 'Manage your active login sessions',
          count: 'session(s)',
          sessionNumber: 'Session',
          active: 'Active',
          sessionId: 'Session ID',
          expiresIn: 'Expires in',
          location: 'Location',
          lastActivity: 'Last activity',
          terminate: 'Terminate'
        },

        // Role display
        roles: {
          admin: 'Administrator',
          manager: 'Manager',
          analyst: 'Data Analyst',
          viewer: 'Viewer',
          user: 'User'
        },

        // Status display
        statusDisplay: {
          active: 'Active Account',
          inactive: 'Inactive Account',
          verified: 'Email Verified',
          unverified: 'Email Not Verified'
        },

        // Stats
        stats: {
          userId: 'User ID',
          activeSessions: 'Active Sessions',
          memberSince: 'Member Since'
        },

        // Footer
        footer: {
          lastUpdated: 'Last updated',
          needHelp: 'Need help?',
          contactSupport: 'Contact Support'
        }
      }
    }
  };

  public availableLanguages: Language[] = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  constructor() {
    // Load saved language from localStorage or default to Vietnamese
    const savedLang = localStorage.getItem('app-language') || 'vi';
    this.setLanguage(savedLang);
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  setLanguage(languageCode: string): void {
    if (this.translations[languageCode]) {
      this.currentLanguageSubject.next(languageCode);
      localStorage.setItem('app-language', languageCode);
    }
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage();
    const keys = key.split('.');
    let translation: any = this.translations[currentLang];

    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to English if key not found in current language
        translation = this.translations['en'];
        for (const fallbackKey of keys) {
          if (translation && typeof translation === 'object' && fallbackKey in translation) {
            translation = translation[fallbackKey];
          } else {
            return key; // Return the key itself if translation not found
          }
        }
        break;
      }
    }

    return typeof translation === 'string' ? translation : key;
  }

  // Get all translations for a specific namespace
  getTranslations(namespace: string): TranslationKey {
    const currentLang = this.getCurrentLanguage();
    const translations = this.translations[currentLang];
    return translations[namespace] as TranslationKey || {};
  }
}
