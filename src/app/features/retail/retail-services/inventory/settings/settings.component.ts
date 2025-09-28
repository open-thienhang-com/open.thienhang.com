import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { TabViewModule } from 'primeng/tabview';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

interface InventorySettings {
  general: {
    companyName: string;
    defaultCurrency: string;
    defaultLanguage: string;
    timezone: string;
    fiscalYearStart: string;
  };
  notifications: {
    lowStockAlerts: boolean;
    stockOutAlerts: boolean;
    expiryAlerts: boolean;
    reorderAlerts: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
  stock: {
    defaultLocation: string;
    autoGenerateSKU: boolean;
    negativeStockAllowed: boolean;
    batchTracking: boolean;
    expiryTracking: boolean;
    lowStockThreshold: number;
    reorderPoint: number;
  };
  pricing: {
    priceIncludesTax: boolean;
    defaultTaxRate: number;
    multiCurrency: boolean;
    priceRounding: string;
  };
  integration: {
    barcodeScanning: boolean;
    rfidIntegration: boolean;
    apiAccess: boolean;
    thirdPartySync: boolean;
  };
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    InputNumberModule,
    TabViewModule,
    MessageModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settings: InventorySettings = {
    general: {
      companyName: 'My Company',
      defaultCurrency: 'USD',
      defaultLanguage: 'en',
      timezone: 'UTC',
      fiscalYearStart: '01-01'
    },
    notifications: {
      lowStockAlerts: true,
      stockOutAlerts: true,
      expiryAlerts: true,
      reorderAlerts: true,
      emailNotifications: true,
      smsNotifications: false
    },
    stock: {
      defaultLocation: '',
      autoGenerateSKU: true,
      negativeStockAllowed: false,
      batchTracking: true,
      expiryTracking: true,
      lowStockThreshold: 10,
      reorderPoint: 20
    },
    pricing: {
      priceIncludesTax: false,
      defaultTaxRate: 8.5,
      multiCurrency: false,
      priceRounding: 'nearest'
    },
    integration: {
      barcodeScanning: true,
      rfidIntegration: false,
      apiAccess: true,
      thirdPartySync: false
    }
  };

  currencyOptions = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'JPY - Japanese Yen', value: 'JPY' },
    { label: 'CAD - Canadian Dollar', value: 'CAD' },
    { label: 'AUD - Australian Dollar', value: 'AUD' }
  ];

  languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Chinese', value: 'zh' }
  ];

  timezoneOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'EST - Eastern Time', value: 'EST' },
    { label: 'PST - Pacific Time', value: 'PST' },
    { label: 'GMT - Greenwich Mean Time', value: 'GMT' }
  ];

  roundingOptions = [
    { label: 'Nearest Cent', value: 'nearest' },
    { label: 'Always Round Up', value: 'up' },
    { label: 'Always Round Down', value: 'down' },
    { label: 'No Rounding', value: 'none' }
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    // Load settings from service/API
    // For now, using default values
  }

  saveSettings() {
    // Save settings to service/API
    this.messageService.add({
      severity: 'success',
      summary: 'Settings Saved',
      detail: 'Inventory settings have been updated successfully'
    });
  }

  resetToDefaults() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to reset all settings to default values?',
      header: 'Reset Settings',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.settings = {
          general: {
            companyName: 'My Company',
            defaultCurrency: 'USD',
            defaultLanguage: 'en',
            timezone: 'UTC',
            fiscalYearStart: '01-01'
          },
          notifications: {
            lowStockAlerts: true,
            stockOutAlerts: true,
            expiryAlerts: true,
            reorderAlerts: true,
            emailNotifications: true,
            smsNotifications: false
          },
          stock: {
            defaultLocation: '',
            autoGenerateSKU: true,
            negativeStockAllowed: false,
            batchTracking: true,
            expiryTracking: true,
            lowStockThreshold: 10,
            reorderPoint: 20
          },
          pricing: {
            priceIncludesTax: false,
            defaultTaxRate: 8.5,
            multiCurrency: false,
            priceRounding: 'nearest'
          },
          integration: {
            barcodeScanning: true,
            rfidIntegration: false,
            apiAccess: true,
            thirdPartySync: false
          }
        };
        this.messageService.add({
          severity: 'info',
          summary: 'Settings Reset',
          detail: 'All settings have been reset to default values'
        });
      }
    });
  }

  exportSettings() {
    const settingsJson = JSON.stringify(this.settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-settings.json';
    a.click();
    window.URL.revokeObjectURL(url);

    this.messageService.add({
      severity: 'success',
      summary: 'Export Complete',
      detail: 'Settings have been exported successfully'
    });
  }

  importSettings(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          this.settings = { ...this.settings, ...importedSettings };
          this.messageService.add({
            severity: 'success',
            summary: 'Import Complete',
            detail: 'Settings have been imported successfully'
          });
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Import Failed',
            detail: 'Invalid settings file format'
          });
        }
      };
      reader.readAsText(file);
    }
  }
}
