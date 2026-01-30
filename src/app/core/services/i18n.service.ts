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
  private currentLanguageSubject = new BehaviorSubject<string>('vi'); // Default to Vietnamese
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: { [lang: string]: TranslationKey } = {
    vi: {
      // Common
      common: {
        loading: 'Đang tải...',
        save: 'Lưu',
        cancel: 'Hủy',
        delete: 'Xóa',
        edit: 'Chỉnh sửa',
        view: 'Xem',
        search: 'Tìm kiếm',
        filter: 'Lọc',
        clear: 'Xóa',
        refresh: 'Làm mới',
        export: 'Xuất',
        import: 'Nhập',
        settings: 'Cài đặt',
        profile: 'Hồ sơ',
        logout: 'Đăng xuất',
        login: 'Đăng nhập',
        register: 'Đăng ký',
        confirm: 'Xác nhận',
        close: 'Đóng',
        back: 'Quay lại',
        next: 'Tiếp theo',
        previous: 'Trước',
        submit: 'Gửi',
        reset: 'Đặt lại',
        select: 'Chọn',
        all: 'Tất cả',
        none: 'Không có'
      },
      
      // Navigation
      navigation: {
        dashboard: 'Bảng điều khiển',
        dataProducts: 'Sản phẩm dữ liệu',
        dataMesh: 'Lưới dữ liệu',
        domainCatalog: 'Danh mục miền',
        marketplace: 'Marketplace',
        explore: 'Khám phá',
        governance: 'Quản trị',
        observability: 'Quan sát',
        settings: 'Cài đặt',
        profile: 'Hồ sơ',
        help: 'Trợ giúp'
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
        noResultsDesc: 'Try adjusting your search terms or check back later for new products.'
      },

      // Domain Catalog
      domainCatalog: {
        title: 'Danh mục miền dữ liệu',
        subtitle: 'Khám phá và tìm hiểu các miền dữ liệu trong tổ chức của bạn. Duyệt qua các sản phẩm dữ liệu, API và chính sách quản trị theo miền cụ thể.',
        totalDomains: 'Tổng số miền',
        activeDomains: 'Miền hoạt động',
        dataProducts: 'Sản phẩm dữ liệu',
        systemHealth: 'Tình trạng hệ thống',
        excellent: 'Xuất sắc',
        healthy: 'Tốt',
        searchPlaceholder: 'Tìm kiếm theo tên, mô tả hoặc thẻ...',
        allStatus: 'Tất cả trạng thái',
        allTeams: 'Tất cả nhóm',
        clearFilters: 'Xóa bộ lọc',
        gridView: 'Dạng lưới',
        listView: 'Dạng danh sách',
        domainPortfolio: 'Danh mục miền',
        domains: 'miền',
        domain: 'miền',
        viewDetails: 'Xem chi tiết',
        products: 'Sản phẩm',
        quality: 'Chất lượng',
        subscribers: 'Người đăng ký',
        uptime: 'Thời gian hoạt động',
        team: 'Nhóm',
        owner: 'Chủ sở hữu',
        unassigned: 'Chưa phân công',
        tbd: 'Chưa xác định',
        noDomainsFound: 'Không tìm thấy miền nào',
        noDomainsMessage: 'Chúng tôi không thể tìm thấy miền nào phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.',
        addDomain: 'Thêm miền',
        lastUpdated: 'Cập nhật lần cuối',
        allSystemsOperational: 'Tất cả hệ thống hoạt động bình thường',
        thisWeek: 'tuần này',
        acrossDomains: 'trên các miền'
      },

      // Data Products
      dataProduct: {
        title: 'Sản phẩm dữ liệu',
        name: 'Tên',
        description: 'Mô tả',
        domain: 'Miền',
        owner: 'Chủ sở hữu',
        status: 'Trạng thái',
        version: 'Phiên bản',
        type: 'Loại',
        tags: 'Thẻ',
        created: 'Tạo lúc',
        updated: 'Cập nhật lúc',
        qualityScore: 'Điểm chất lượng',
        subscribers: 'Người đăng ký',
        apis: 'APIs',
        documentation: 'Tài liệu',
        schema: 'Lược đồ',
        metrics: 'Số liệu',
        overview: 'Tổng quan',
        details: 'Chi tiết',
        api: 'API',
        swagger: 'Swagger',
        subscribe: 'Đăng ký',
        unsubscribe: 'Hủy đăng ký',
        
        // Hotel-specific translations
        hotel: {
          title: 'Hệ thống quản lý khách sạn',
          description: 'Giải pháp dữ liệu tích hợp cho quản lý khách sạn',
          dataProduct: {
            actions: {
              downloadSchema: 'Tải xuống Schema',
              assets: 'Tài sản',
              viewSwagger: 'Xem Swagger',
              subscribe: 'Đăng ký',
              unsubscribe: 'Hủy đăng ký',
              demo: 'Demo'
            },
            tabs: {
              documentation: {
                title: 'Tài liệu',
                description: 'Tài liệu API tương tác được cung cấp bởi Swagger'
              },
              rooms: {
                title: 'Quản lý phòng',
                description: 'Hệ thống quản lý phòng và tỷ lệ lấp đầy toàn diện'
              },
              assets: {
                title: 'Quản lý tài sản',
                description: 'Theo dõi và quản lý tài sản khách sạn'
              },
              bookings: {
                title: 'Quản lý đặt phòng',
                description: 'Hệ thống quản lý đặt phòng hoàn chỉnh'
              },
              customers: {
                title: 'Quản lý khách hàng',
                description: 'Phân tích và quản lý dữ liệu khách hàng'
              },
              onlineChannels: {
                title: 'Kênh đặt phòng trực tuyến',
                description: 'Tích hợp với các nền tảng đặt phòng trực tuyến'
              }
            },
            features: {
              rooms: {
                management: {
                  title: 'Quản lý phòng thông minh',
                  description: 'Hệ thống quản lý phòng toàn diện với theo dõi thời gian thực'
                }
              }
            },
            metrics: {
              totalRooms: 'Tổng phòng',
              occupancyRate: 'Tỷ lệ lấp đầy',
              averageRating: 'Đánh giá trung bình'
            },
            roomTypes: {
              standard: 'Phòng tiêu chuẩn',
              standardDesc: 'Phòng thoải mái với đầy đủ tiện nghi cơ bản',
              deluxe: 'Phòng cao cấp',
              deluxeDesc: 'Phòng rộng rãi với view đẹp và tiện nghi nâng cao',
              suite: 'Phòng suite',
              suiteDesc: 'Phòng sang trọng với không gian riêng biệt'
            },
            assets: {
              equipment: {
                title: 'Thiết bị',
                computers: 'Máy tính',
                phones: 'Điện thoại',
                tvs: 'TV'
              },
              furniture: {
                title: 'Nội thất',
                beds: 'Giường',
                tables: 'Bàn',
                chairs: 'Ghế'
              },
              maintenance: {
                title: 'Bảo trì',
                scheduled: 'Đã lên lịch',
                pending: 'Đang chờ',
                completed: 'Hoàn thành'
              }
            },
            bookings: {
              stats: {
                total: 'Tổng đặt phòng',
                confirmed: 'Đã xác nhận',
                pending: 'Đang chờ',
                cancelled: 'Đã hủy'
              },
              channels: {
                title: 'Kênh đặt phòng',
                direct: 'Đặt trực tiếp',
                ota: 'Đại lý trực tuyến',
                phone: 'Điện thoại'
              }
            },
            customers: {
              stats: {
                total: 'Tổng khách hàng',
                newThisMonth: 'Mới tháng này',
                loyal: 'Khách hàng thân thiết',
                satisfaction: 'Mức độ hài lòng'
              },
              segments: {
                title: 'Phân khúc khách hàng',
                business: 'Công tác',
                leisure: 'Du lịch',
                group: 'Nhóm'
              }
            },
            onlineChannels: {
              facebook: {
                title: 'Facebook',
                followers: 'Người theo dõi',
                bookings: 'Đặt phòng',
                rating: 'Đánh giá'
              },
              zalo: {
                title: 'Zalo',
                followers: 'Người theo dõi',
                bookings: 'Đặt phòng',
                rating: 'Đánh giá'
              },
              google: {
                title: 'Google',
                reviews: 'Đánh giá',
                bookings: 'Đặt phòng',
                rating: 'Đánh giá'
              }
            }
          },
          features: {
            apartments: 'Quản lý căn hộ',
            rooms: 'Quản lý phòng',
            bookings: 'Hệ thống đặt phòng',
            ratings: 'Đánh giá',
            reviews: 'Nhận xét',
            metadata: 'Thông tin meta'
          },
          endpoints: {
            create: 'Tạo mới',
            read: 'Xem',
            update: 'Cập nhật',
            delete: 'Xóa',
            list: 'Danh sách',
            cancel: 'Hủy',
            version: 'Phiên bản',
            overview: 'Tổng quan',
            quality: 'Chất lượng',
            cost: 'Chi phí',
            features: 'Tính năng',
            summary: 'Tóm tắt',
            healthCheck: 'Kiểm tra sức khỏe'
          },
          actions: {
            testEndpoint: 'Kiểm tra endpoint',
            copyUrl: 'Sao chép URL',
            viewSwagger: 'Xem Swagger',
            downloadSchema: 'Tải xuống schema'
          }
        }
      },

      // Settings
      settings: {
        title: 'Cài đặt',
        general: 'Chung',
        language: 'Ngôn ngữ',
        theme: 'Giao diện',
        notifications: 'Thông báo',
        privacy: 'Quyền riêng tư',
        security: 'Bảo mật',
        account: 'Tài khoản',
        preferences: 'Tùy chọn',
        selectLanguage: 'Chọn ngôn ngữ',
        vietnamese: 'Tiếng Việt',
        english: 'English'
      },

      // Status
      status: {
        active: 'Hoạt động',
        inactive: 'Không hoạt động',
        pending: 'Đang chờ',
        approved: 'Đã duyệt',
        rejected: 'Bị từ chối',
        draft: 'Bản nháp',
        published: 'Đã xuất bản',
        archived: 'Đã lưu trữ',
        deprecated: 'Không dùng nữa',
        maintenance: 'Bảo trì'
      },

      // Messages
      messages: {
        success: 'Thành công',
        error: 'Lỗi',
        warning: 'Cảnh báo',
        info: 'Thông tin',
        loadingError: 'Có lỗi xảy ra khi tải dữ liệu',
        saveSuccess: 'Lưu thành công',
        deleteSuccess: 'Xóa thành công',
        updateSuccess: 'Cập nhật thành công',
        noDataFound: 'Không tìm thấy dữ liệu'
      },

      // Profile
      profile: {
        title: 'Hồ sơ cá nhân',
        subtitle: 'Quản lý thông tin tài khoản và tùy chọn cá nhân',
        
        // Account section
        account: {
          title: 'Thông tin tài khoản',
          subtitle: 'Thông tin cá nhân và chi tiết liên hệ',
          fullName: 'Họ và tên',
          email: 'Địa chỉ email',
          phone: 'Số điện thoại',
          userId: 'Mã người dùng',
          status: 'Trạng thái',
          role: 'Vai trò',
          verified: 'Đã xác minh'
        },

        // User management section
        users: {
          title: 'Quản lý người dùng',
          subtitle: 'Xem và quản lý tất cả người dùng trong hệ thống',
          user: 'Người dùng',
          fullName: 'Họ và tên',
          email: 'Email',
          role: 'Vai trò',
          status: 'Trạng thái',
          joinedDate: 'Ngày tham gia',
          totalUsers: 'người dùng',
          searchPlaceholder: 'Tìm kiếm người dùng...',
          noUsers: 'Không có người dùng nào',
          noUsersMessage: 'Không có người dùng nào được tìm thấy.',
          active: 'Hoạt động',
          inactive: 'Không hoạt động'
        },

        // Security section
        security: {
          title: 'Bảo mật & Quyền riêng tư',
          subtitle: 'Quản lý cài đặt bảo mật tài khoản',
          password: 'Mật khẩu',
          passwordSubtitle: 'Thay đổi lần cuối 30 ngày trước',
          changePassword: 'Đổi mật khẩu',
          twoFactor: 'Xác thực hai yếu tố',
          enabled: 'Đã bật',
          disabled: 'Đã tắt',
          enable: 'Bật',
          disable: 'Tắt',
          privacy: 'Cài đặt quyền riêng tư',
          privacySubtitle: 'Kiểm soát khả năng hiển thị dữ liệu',
          manage: 'Quản lý',
          dataExport: 'Xuất dữ liệu',
          dataExportSubtitle: 'Tải xuống dữ liệu của bạn',
          export: 'Xuất'
        },

        // Actions section
        actions: {
          title: 'Hành động nhanh',
          subtitle: 'Các tác vụ quản lý tài khoản phổ biến',
          editProfile: 'Chỉnh sửa hồ sơ',
          changePassword: 'Đổi mật khẩu',
          settings: 'Cài đặt tài khoản',
          downloadData: 'Tải xuống dữ liệu',
          refresh: 'Làm mới'
        },

        // Sessions section
        sessions: {
          title: 'Phiên đang hoạt động',
          subtitle: 'Quản lý các phiên đăng nhập đang hoạt động',
          count: 'phiên',
          sessionNumber: 'Phiên',
          active: 'Hoạt động',
          sessionId: 'Mã phiên',
          expiresIn: 'Hết hạn sau',
          location: 'Vị trí',
          lastActivity: 'Hoạt động cuối cùng',
          terminate: 'Kết thúc'
        },

        // Role display
        roles: {
          admin: 'Quản trị viên',
          manager: 'Quản lý',
          analyst: 'Phân tích viên dữ liệu',
          viewer: 'Người xem',
          user: 'Người dùng'
        },

        // Status display
        statusDisplay: {
          active: 'Tài khoản hoạt động',
          inactive: 'Tài khoản không hoạt động',
          verified: 'Email đã xác minh',
          unverified: 'Email chưa xác minh'
        },

        // Stats
        stats: {
          userId: 'Mã người dùng',
          activeSessions: 'Phiên hoạt động',
          memberSince: 'Thành viên từ'
        },

        // Footer
        footer: {
          lastUpdated: 'Cập nhật lần cuối',
          needHelp: 'Cần trợ giúp?',
          contactSupport: 'Liên hệ hỗ trợ'
        }
      }
    },

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
