import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-hotel-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    ButtonModule, CardModule, InputTextModule, InputTextarea,
    DropdownModule, ToastModule, DividerModule, ToggleButtonModule
  ],
  providers: [MessageService],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settings = {
    general: {
      hotelName: 'Hotel Management System',
      email: 'info@hotel.com',
      phone: '+1-234-567-8900',
      address: '123 Main Street, City, State 12345',
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en'
    },
    booking: {
      defaultCheckInTime: '14:00',
      defaultCheckOutTime: '11:00',
      cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
      requirePaymentConfirmation: true,
      autoConfirmBookings: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      bookingConfirmation: true,
      bookingCancellation: true,
      paymentReminder: true
    },
    maintenance: {
      autoMaintenanceReminders: true,
      maintenanceScheduleDays: 30
    }
  };

  timezoneOptions = [
    { label: 'America/New_York (EST)', value: 'America/New_York' },
    { label: 'America/Chicago (CST)', value: 'America/Chicago' },
    { label: 'America/Denver (MST)', value: 'America/Denver' },
    { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
    { label: 'UTC', value: 'UTC' }
  ];

  currencyOptions = [
    { label: 'USD ($)', value: 'USD' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'GBP (£)', value: 'GBP' },
    { label: 'JPY (¥)', value: 'JPY' }
  ];

  languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' }
  ];

  constructor(
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('hotelSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }

  saveSettings(): void {
    localStorage.setItem('hotelSettings', JSON.stringify(this.settings));
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Settings saved successfully'
    });
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      localStorage.removeItem('hotelSettings');
      this.loadSettings();
      this.messageService.add({
        severity: 'info',
        summary: 'Reset',
        detail: 'Settings reset to default'
      });
    }
  }
}
