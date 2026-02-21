export interface FilesVersion {
  adapter: string;
  version: string;
  description: string;
  status: string;
  last_updated: string;
}

export interface FilesOverview {
  domain: string;
  total_files: number;
  total_size: number;
  providers: string[];
  supported_formats: string[];
  features: string[];
  uptime: string;
  last_backup: string;
}

export interface FilesQuality {
  score: number;
  metrics: {
    availability: number;
    reliability: number;
    performance: number;
    security: number;
  };
  issues: string[];
  last_check: string;
}

export interface FilesCost {
  monthly_cost: number;
  currency: string;
  breakdown: {
    storage: number;
    bandwidth: number;
    compute: number;
    backup: number;
  };
  usage_gb: number;
  cost_per_gb: number;
  trend: string;
}

export interface FilesFeatures {
  core_features: string[];
  storage_providers: string[];
  supported_formats: string[];
  api_features: string[];
  security: string[];
}

export interface FilesSummary {
  adapter: string;
  status: string;
  health: string;
  total_files: number;
  total_size_gb: number;
  providers: number;
  quality_score: number;
  monthly_cost: number;
  uptime: string;
  last_updated: string;
}

export interface ManagedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  storage_provider: string;
  upload_date: string;
  uploaded_by: string;
  tags: string[];
  metadata: Record<string, string | number | boolean>;
}

export interface FilesListResponse {
  files: ManagedFile[];
  total: number;
  limit: number;
  offset: number;
}

export interface ProviderStat {
  files: number;
  size: number;
}

export interface TypeStat {
  count: number;
  size: number;
}

export interface FilesStatsSummary {
  total_files: number;
  total_size: number;
  storage_by_provider: Record<string, ProviderStat>;
  file_types: Record<string, TypeStat>;
}

export interface DailyUpload {
  date: string;
  count: number;
  size: number;
}

export interface TopUploader {
  user: string;
  files: number;
  size: number;
}

export interface FilesUsageStats {
  daily_uploads: DailyUpload[];
  top_uploaders: TopUploader[];
  storage_trends: {
    weekly_growth: number;
    monthly_growth: number;
    predicted_next_month: number;
  };
}

export interface FileUploadResponse {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  storage_provider: string;
  upload_date: string;
  status: string;
}
