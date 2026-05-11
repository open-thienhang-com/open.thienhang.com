import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-notification-api',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextarea, DropdownModule, CardModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss']
})
export class NotificationApiComponent implements OnInit {
  endpoints = [
    { label: 'POST /notification/notifications', value: 'post_notification' },
    { label: 'POST /notification/notifications/batch', value: 'post_batch' },
    { label: 'POST /notification/email/send', value: 'post_email' },
    { label: 'GET /notification/health', value: 'get_health' }
  ];

  selectedEndpoint = 'post_notification';
  requestBody = '{\n  "recipient": "customer&#64;example.com",\n  "channel": "email",\n  "subject": "Hello",\n  "body": "World"\n}';
  response = '// Click Send Request...';
  curlCommand = '';
  loading = false;

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.updateCurl();
  }

  updateCurl(): void {
    const url = `http://localhost:8082/${this.selectedEndpoint.replace('_', '/')}`;
    this.curlCommand = `curl -X ${this.selectedEndpoint.startsWith('get') ? 'GET' : 'POST'} "${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${this.requestBody.replace(/\n/g, '')}'`;
  }

  onEndpointChange(): void {
    if (this.selectedEndpoint === 'get_health') {
      this.requestBody = '';
    } else {
      this.requestBody = '{\n  "recipient": "customer&#64;example.com",\n  "channel": "email",\n  "subject": "Hello",\n  "body": "World"\n}';
    }
    this.updateCurl();
  }

  sendRequest(): void {
    const url = `http://localhost:8082/${this.selectedEndpoint.replace('_', '/')}`;
    this.loading = true;
    this.response = '// Sending request...';

    const req = this.selectedEndpoint.startsWith('get') 
      ? this.http.get(url) 
      : this.http.post(url, JSON.parse(this.requestBody || '{}'));

    req.subscribe({
      next: (res) => {
        this.response = JSON.stringify(res, null, 2);
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Request completed' });
      },
      error: (err) => {
        this.response = JSON.stringify(err.error || err, null, 2);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Request failed' });
      }
    });
  }
}
