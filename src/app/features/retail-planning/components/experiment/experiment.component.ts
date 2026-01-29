import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

interface Experiment {
  id: string;
  title: string;
  description: string;
  model: string;
  dataset: string;
  status: 'active' | 'completed' | 'draft';
  accuracy?: string;
  lastRun?: string;
  colabLink: string;
  githubLink?: string;
  tags: string[];
}

interface Guide {
  title: string;
  steps: string[];
}

@Component({
  selector: 'app-planning-experiment',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TabViewModule,
    AccordionModule,
    TagModule,
    DividerModule,
    TooltipModule
  ],
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss'],
})
export class ExperimentComponent {
  showInstructions = signal(true);

  experiments: Experiment[] = [
    {
      id: 'exp-001',
      title: 'Dự báo nhu cầu (Demand Prediction)',
      description: 'Dự đoán nhu cầu sản phẩm dựa trên dữ liệu lịch sử, mùa vụ, và các yếu tố bên ngoài',
      model: 'XGBoost + LSTM',
      dataset: 'GHN Operational Data (2020-2024)',
      status: 'active',
      accuracy: '94.2%',
      lastRun: '2024-01-15',
      colabLink: 'https://colab.research.google.com/github/open-thienhang-com/exp.thienhang.com/blob/main/notebooks/demand_prediction.ipynb',
      githubLink: 'https://github.com/open-thienhang-com/exp.thienhang.com/blob/main/notebooks/demand_prediction.ipynb',
      tags: ['Time Series', 'Forecasting', 'Production']
    },
    {
      id: 'exp-002',
      title: 'Tối ưu tuyến đường (Route Optimization)',
      description: 'Tối ưu hóa tuyến đường giao hàng để giảm chi phí và thời gian vận chuyển',
      model: 'Genetic Algorithm + Deep RL',
      dataset: 'GHN Route Data + OSM Vietnam',
      status: 'active',
      accuracy: '89.7%',
      lastRun: '2024-01-20',
      colabLink: 'https://colab.research.google.com/github/open-thienhang-com/exp.thienhang.com/blob/main/notebooks/route_optimization.ipynb',
      githubLink: 'https://github.com/open-thienhang-com/exp.thienhang.com/blob/main/notebooks/route_optimization.ipynb',
      tags: ['Optimization', 'Logistics', 'RL']
    },
    {
      id: 'exp-003',
      title: 'Phân loại khách hàng (Customer Segmentation)',
      description: 'Phân nhóm khách hàng dựa trên hành vi mua hàng và đặc điểm nhân khẩu học',
      model: 'K-Means + AutoEncoder',
      dataset: 'GHN Customer Database',
      status: 'completed',
      accuracy: '91.5%',
      lastRun: '2024-01-10',
      colabLink: 'https://colab.research.google.com/github/open-thienhang-com/exp.thienhang.com/blob/main/notebooks/customer_segmentation.ipynb',
      githubLink: 'https://github.com/open-thienhang-com/exp.thienhang.com/blob/main/notebooks/customer_segmentation.ipynb',
      tags: ['Clustering', 'Marketing', 'Unsupervised']
    },
    {
      id: 'exp-004',
      title: 'Phát hiện gian lận (Fraud Detection)',
      description: 'Phát hiện các giao dịch bất thường và hành vi gian lận trong hệ thống',
      model: 'Isolation Forest + LSTM',
      dataset: 'GHN Transaction Logs',
      status: 'draft',
      colabLink: 'https://colab.research.google.com/github/open-thienhang-com/exp.thienhang.com/blob/main/notebooks/fraud_detection.ipynb',
      tags: ['Anomaly Detection', 'Security', 'Classification']
    }
  ];

  // Featured quick-access notebooks (prominent links)
  featuredNotebooks: Experiment[] = [
    {
      id: 'feat-demand-001',
      title: 'Quick: Demand Prediction Notebook',
      description: 'Open the official demand prediction Colab notebook for quick experimentation.',
      model: 'XGBoost + LSTM',
      dataset: 'GHN Operational Data',
      status: 'active',
      colabLink: 'https://colab.research.google.com/github/open-thienhang-com/exp.thienhang.com/blob/main/notebooks/demand_prediction.ipynb',
      githubLink: 'https://github.com/open-thienhang-com/exp.thienhang.com/blob/main/notebooks/demand_prediction.ipynb',
      tags: ['Featured', 'Colab']
    }
  ];

  guides: Guide[] = [
    {
      title: 'Cách sử dụng Google Colab',
      steps: [
        'Click vào nút "Open in Colab" của experiment bạn muốn chạy',
        'Đăng nhập vào Google Account của bạn',
        'Chọn "File" > "Save a copy in Drive" để lưu một bản sao',
        'Chạy các cell code theo thứ tự từ trên xuống dưới bằng cách click vào nút play (▶️)',
        'Đợi mỗi cell chạy xong trước khi chạy cell tiếp theo',
        'Kết quả và visualization sẽ hiển thị ngay bên dưới mỗi cell'
      ]
    },
    {
      title: 'Cách thay đổi dataset',
      steps: [
        'Trong notebook, tìm đến cell có chứa code load data',
        'Upload dataset của bạn lên Colab bằng cách click vào icon folder bên trái',
        'Click vào icon "Upload to session storage" và chọn file',
        'Thay đổi đường dẫn file trong code để trỏ đến file bạn vừa upload',
        'Đảm bảo format của data tương tự như ví dụ trong notebook',
        'Chạy lại các cell để train model với data mới'
      ]
    },
    {
      title: 'Cách tinh chỉnh model',
      steps: [
        'Tìm cell chứa hyperparameters (learning_rate, epochs, batch_size, etc.)',
        'Thay đổi giá trị các parameters theo nhu cầu',
        'Lưu ý: tăng epochs có thể cải thiện độ chính xác nhưng tốn thời gian hơn',
        'Chạy lại cell training để train với parameters mới',
        'So sánh kết quả với lần chạy trước để xem có cải thiện không',
        'Lưu lại cấu hình tốt nhất trong một cell riêng'
      ]
    },
    {
      title: 'Cách export và sử dụng model',
      steps: [
        'Sau khi train xong, tìm cell có code export model',
        'Chạy cell đó để lưu model thành file (.h5, .pkl, .joblib, etc.)',
        'Download file model về máy bằng cách right-click > Download',
        'Upload model lên server của bạn hoặc sử dụng trong application',
        'Load model trong code Python: model = joblib.load("model.pkl")',
        'Sử dụng model.predict() để dự đoán trên data mới'
      ]
    }
  ];

  tips: string[] = [
    'Luôn chạy các cell theo thứ tự từ trên xuống dưới để tránh lỗi',
    'Sử dụng GPU runtime để tăng tốc training: Runtime > Change runtime type > GPU',
    'Lưu checkpoint định kỳ để tránh mất dữ liệu khi session timeout',
    'Comment code và ghi chú lại các thay đổi quan trọng',
    'Test model trên validation set trước khi deploy vào production',
    'Theo dõi metrics như accuracy, precision, recall, F1-score để đánh giá model',
    'Visualize data và kết quả để dễ hiểu và debug',
    'Backup notebook về máy thường xuyên: File > Download > Download .ipynb'
  ];

  prerequisites: string[] = [
    'Google Account để sử dụng Google Colab',
    'Kiến thức cơ bản về Python và pandas',
    'Hiểu biết về Machine Learning cơ bản (optional nhưng nên có)',
    'Browser hiện đại (Chrome, Firefox, Edge) với kết nối internet ổn định'
  ];

  toggleInstructions(): void {
    this.showInstructions.update(v => !v);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'secondary' | 'warning' {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'draft': return 'warning';
      default: return 'secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Đang chạy';
      case 'completed': return 'Hoàn thành';
      case 'draft': return 'Nháp';
      default: return status;
    }
  }
}

