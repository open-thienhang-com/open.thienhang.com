import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-hotel-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    DividerModule,
    TagModule
  ],
  templateUrl: './hotel-overview.component.html',
  styleUrl: './hotel-overview.component.scss'
})
export class HotelOverviewComponent implements OnInit {
  
  businessValues = [
    {
      icon: 'pi pi-chart-line',
      title: 'Revenue Optimization',
      description: 'Theo dõi tỷ lệ lấp đầy phòng và doanh thu theo thời gian thực',
      color: '#10b981'
    },
    {
      icon: 'pi pi-star',
      title: 'Customer Experience',
      description: 'Quản lý đánh giá và rating để cải thiện dịch vụ',
      color: '#f59e0b'
    },
    {
      icon: 'pi pi-cog',
      title: 'Operational Efficiency',
      description: 'Tự động hóa quy trình booking và quản lý phòng',
      color: '#3b82f6'
    },
    {
      icon: 'pi pi-chart-bar',
      title: 'Data-Driven Decisions',
      description: 'Analytics về xu hướng booking và hiệu suất kinh doanh',
      color: '#8b5cf6'
    }
  ];

  businessFlows = [
    {
      step: '1',
      title: 'Quản lý căn hộ (Apartments)',
      icon: 'pi pi-building',
      description: 'Mỗi căn hộ được catalog với đầy đủ tiện nghi, vị trí, giá cả',
      features: [
        'Tích hợp bản đồ và thông tin địa phương',
        'Phân loại theo loại hình (studio, 1 phòng ngủ, penthouse...)',
        'Quản lý tiện nghi và hình ảnh'
      ],
      route: '/hotel/apartments',
      color: '#fa709a'
    },
    {
      step: '2',
      title: 'Quản lý phòng (Rooms)',
      icon: 'pi pi-door-open',
      description: 'Định nghĩa loại phòng, số giường, tiện nghi và trạng thái',
      features: [
        'Inventory Setup: Định nghĩa loại phòng, số giường, tiện nghi',
        'Availability Management: Theo dõi trạng thái phòng',
        'Dynamic Pricing: Điều chỉnh giá dựa trên nhu cầu và mùa vụ'
      ],
      route: '/hotel/rooms',
      color: '#fee140'
    },
    {
      step: '3',
      title: 'Quy trình đặt phòng (Booking)',
      icon: 'pi pi-calendar-check',
      description: 'Quản lý toàn bộ quy trình từ tìm kiếm đến check-out',
      features: [
        'Search & Discovery: Browse căn hộ theo vị trí, giá, tiện nghi',
        'Reservation: Chọn ngày check-in/out, số khách',
        'Payment Processing: Tích hợp cổng thanh toán',
        'Check-in/out: Quản lý quá trình nhận/trả phòng'
      ],
      route: '/hotel/bookings',
      color: '#30cfd0'
    },
    {
      step: '4',
      title: 'Hệ thống đánh giá (Reviews & Ratings)',
      icon: 'pi pi-star-fill',
      description: 'Xây dựng niềm tin và cải thiện chất lượng dịch vụ',
      features: [
        'Trust Building: Đánh giá chân thực từ khách hàng thực tế',
        'Quality Assurance: Giám sát chất lượng dịch vụ',
        'Marketing: Sử dụng reviews tốt để thu hút khách mới'
      ],
      route: '/hotel/reviews',
      color: '#330867'
    }
  ];

  analyticsCategories = [
    {
      title: 'Revenue Analytics',
      icon: 'pi pi-dollar',
      items: [
        'Occupancy Rate: Tỷ lệ lấp đầy phòng theo thời gian',
        'Revenue per Room: Doanh thu trung bình mỗi phòng',
        'Seasonal Trends: Xu hướng booking theo mùa',
        'Geographic Performance: Hiệu suất theo khu vực'
      ],
      color: '#10b981'
    },
    {
      title: 'Customer Insights',
      icon: 'pi pi-users',
      items: [
        'Booking Patterns: Thời gian lưu trú trung bình',
        'Cancellation Rates: Tỷ lệ hủy phòng',
        'Customer Segmentation: Phân loại khách hàng',
        'Satisfaction Scores: Điểm hài lòng tổng thể'
      ],
      color: '#3b82f6'
    },
    {
      title: 'Operational Metrics',
      icon: 'pi pi-cog',
      items: [
        'Maintenance Tracking: Theo dõi bảo trì phòng',
        'Staff Performance: Hiệu suất nhân viên',
        'Inventory Turnover: Tốc độ luân chuyển phòng',
        'Response Times: Thời gian phản hồi booking'
      ],
      color: '#f59e0b'
    }
  ];

  userJourneys = [
    {
      role: 'Chủ căn hộ (Host)',
      icon: 'pi pi-user',
      steps: [
        'Onboarding: Đăng ký và verify tài khoản',
        'Property Setup: Thêm căn hộ với ảnh, mô tả, tiện nghi',
        'Pricing Strategy: Thiết lập giá cơ bản và dynamic pricing',
        'Availability Calendar: Quản lý lịch trống/bận',
        'Booking Management: Xác nhận và quản lý bookings',
        'Revenue Tracking: Theo dõi doanh thu và hiệu suất'
      ],
      color: '#fa709a'
    },
    {
      role: 'Khách hàng (Guest)',
      icon: 'pi pi-user-plus',
      steps: [
        'Search: Tìm căn hộ theo tiêu chí (vị trí, giá, tiện nghi)',
        'Compare: So sánh các lựa chọn',
        'Book: Đặt phòng với payment bảo mật',
        'Stay: Nhận hướng dẫn check-in',
        'Review: Để lại đánh giá sau khi ở xong'
      ],
      color: '#30cfd0'
    },
    {
      role: 'Quản trị viên (Admin)',
      icon: 'pi pi-shield',
      steps: [
        'Platform Oversight: Giám sát toàn bộ hệ thống',
        'Quality Control: Đảm bảo chất lượng listings',
        'Fraud Prevention: Ngăn chặn booking giả mạo',
        'Analytics Dashboard: Báo cáo kinh doanh chi tiết'
      ],
      color: '#330867'
    }
  ];

  businessBenefits = [
    {
      category: 'Revenue Growth',
      icon: 'pi pi-arrow-up',
      items: [
        'Higher Occupancy: Tối ưu hóa tỷ lệ lấp đầy',
        'Dynamic Pricing: Tăng giá trong mùa cao điểm',
        'Upselling: Gợi ý thêm dịch vụ (dọn phòng, đưa đón...)'
      ],
      color: '#10b981'
    },
    {
      category: 'Cost Reduction',
      icon: 'pi pi-arrow-down',
      items: [
        'Automated Operations: Giảm chi phí vận hành',
        'Predictive Maintenance: Bảo trì phòng trước khi hỏng',
        'Fraud Detection: Giảm tổn thất từ booking giả'
      ],
      color: '#f59e0b'
    },
    {
      category: 'Customer Satisfaction',
      icon: 'pi pi-heart',
      items: [
        'Personalized Experience: Đề xuất căn hộ phù hợp',
        'Transparent Pricing: Không phí ẩn',
        'Reliable Service: Đảm bảo chất lượng qua reviews'
      ],
      color: '#ec4899'
    },
    {
      category: 'Scalability',
      icon: 'pi pi-expand',
      items: [
        'Multi-property Management: Quản lý nhiều căn hộ cùng lúc',
        'Market Expansion: Mở rộng sang nhiều khu vực',
        'API Integration: Kết nối với các hệ thống khác'
      ],
      color: '#3b82f6'
    }
  ];

  integrations = [
    { name: 'Payment Gateways', items: ['VNPay', 'Momo', 'Stripe'], icon: 'pi pi-credit-card' },
    { name: 'Calendar Systems', items: ['Google Calendar', 'Outlook'], icon: 'pi pi-calendar' },
    { name: 'Communication', items: ['Email', 'SMS notifications'], icon: 'pi pi-send' },
    { name: 'Analytics Platforms', items: ['Google Analytics', 'Mixpanel'], icon: 'pi pi-chart-line' },
    { name: 'CRM Systems', items: ['HubSpot', 'Salesforce'], icon: 'pi pi-briefcase' }
  ];

  quickActions = [
    { label: 'Quản lý Căn hộ', route: '/hotel/apartments', icon: 'pi pi-building', color: '#fa709a' },
    { label: 'Quản lý Đặt phòng', route: '/hotel/bookings', icon: 'pi pi-calendar-check', color: '#30cfd0' },
    { label: 'Quản lý Phòng', route: '/hotel/rooms', icon: 'pi pi-door-open', color: '#fee140' },
    { label: 'Đánh giá & Rating', route: '/hotel/reviews', icon: 'pi pi-star', color: '#330867' }
  ];

  ngOnInit(): void {
    // Component initialization
  }
}
