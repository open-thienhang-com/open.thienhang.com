import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiConfigService, ApiConfig as ApiConfigType, ApiEnvironment } from '../../services/api-config.service';

@Component({
  selector: 'app-api-config',
  imports: [CommonModule],
  templateUrl: './api-config.html',
  styleUrl: './api-config.css',
})
export class ApiConfigComponent implements OnInit {
  currentConfig: ApiConfigType;
  availableConfigs: ApiConfigType[] = [];
  isTestingConnection = false;
  connectionTestResult: { success: boolean; message: string } | null = null;

  constructor(private apiConfigService: ApiConfigService) {
    this.currentConfig = this.apiConfigService.getCurrentConfig();
  }

  ngOnInit(): void {
    this.availableConfigs = this.apiConfigService.getAvailableConfigs();

    // Subscribe to config changes
    this.apiConfigService.currentConfig$.subscribe(config => {
      this.currentConfig = config;
    });
  }

  /**
   * Switch to a different API environment
   */
  switchEnvironment(environment: ApiEnvironment): void {
    this.apiConfigService.switchEnvironment(environment);
    this.connectionTestResult = null; // Reset test result
  }

  /**
   * Test connection to current API host
   */
  testConnection(): void {
    this.isTestingConnection = true;
    this.connectionTestResult = null;

    this.apiConfigService.testConnection().subscribe({
      next: (result) => {
        this.isTestingConnection = false;
        if (result.success) {
          this.connectionTestResult = {
            success: true,
            message: `✅ Connected to ${result.host}`
          };
        } else {
          this.connectionTestResult = {
            success: false,
            message: `❌ Failed to connect to ${result.host}${result.status ? ` (Status: ${result.status})` : ''}${result.error ? ` - ${result.error}` : ''}`
          };
        }
      },
      error: (error) => {
        this.isTestingConnection = false;
        this.connectionTestResult = {
          success: false,
          message: `❌ Connection test failed: ${error.message || 'Unknown error'}`
        };
      }
    });
  }

  /**
   * Check if an environment is currently selected
   */
  isSelected(environment: ApiEnvironment): boolean {
    return this.currentConfig.environment === environment;
  }
}
