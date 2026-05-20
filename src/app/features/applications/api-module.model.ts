export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ModuleType = 'Platform' | 'Domain Adapter';
export type ModuleStatus = 'stable' | 'minimal' | 'planned';

export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  auth: boolean;
  description: string;
}

export interface ApiFeature {
  name: string;
  description: string;
}

export interface ApiModuleData {
  key: string;
  name: string;
  type: ModuleType;
  mountPoints: string[];
  description: string;
  status: ModuleStatus;
  features: ApiFeature[];
  endpoints: ApiEndpoint[];
  dataModels: string[];
  icon: string;
}
