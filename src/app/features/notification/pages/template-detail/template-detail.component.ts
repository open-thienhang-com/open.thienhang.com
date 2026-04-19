import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NotificationService, NotificationTemplate } from '../../../../core/services/notification.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-notification-template-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    CheckboxModule,
    ToastModule,
    TooltipModule,
    TagModule,
    TabViewModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './template-detail.component.html',
  styleUrls: ['./template-detail.component.scss']
})
export class NotificationTemplateDetailComponent implements OnInit {
  templateForm: FormGroup;
  isEditMode = false;
  loading = false;
  saving = false;
  
  channels = [
    { label: 'Email', value: 'email', icon: 'pi pi-envelope' },
    { label: 'SMS', value: 'sms', icon: 'pi pi-comment' },
    { label: 'Internal', value: 'internal', icon: 'pi pi-bell' },
    { label: 'Webhook', value: 'webhook', icon: 'pi pi-globe' }
  ];

  locales = [
    { label: 'Vietnamese (vi)', value: 'vi' },
    { label: 'English (en)', value: 'en' }
  ];

  previewData: any = null;
  previewVariables: any = {};
  discoveredVariables: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    this.templateForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_\-]+$/)]],
      locale: ['vi', Validators.required],
      channel: ['email', Validators.required],
      subject: [''],
      body: ['', Validators.required],
      description: [''],
      is_builtin: [false],
      version: [1]
    });
  }

  isViewMode = false;

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    const queryParams = this.route.snapshot.queryParams;

    if (queryParams['view'] === 'detail') {
      this.isViewMode = true;
      this.isEditMode = true;
      this.loadTemplate(queryParams['code'], queryParams['locale'], queryParams['channel']);
    } else if (params['code'] && params['locale'] && params['channel']) {
      this.isEditMode = true;
      this.loadTemplate(params['code'], params['locale'], params['channel']);
    }

    this.templateForm.get('body')?.valueChanges.subscribe(() => {
      this.extractVariables();
    });
  }

  loadTemplate(code: string, locale: string, channel: string): void {
    this.loading = true;
    this.notificationService.getTemplate(code, locale, channel).subscribe({
      next: (resp) => {
        if (resp.success && resp.data) {
          this.templateForm.patchValue(resp.data);
          // Disable identity fields in edit mode
          this.templateForm.get('code')?.disable();
          this.templateForm.get('locale')?.disable();
          this.templateForm.get('channel')?.disable();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Template not found' });
          this.router.navigate(['/notification/explorer']);
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load template' });
        this.loading = false;
      }
    });
  }

  extractVariables(): void {
    const body = this.templateForm.get('body')?.value || '';
    const subject = this.templateForm.get('subject')?.value || '';
    const combined = body + ' ' + subject;
    
    // Regular expression for {{variable}} or {{ variable }}
    const regex = /\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}/g;
    const matches = combined.matchAll(regex);
    const variables = new Set<string>();
    
    for (const match of matches) {
      variables.add(match[1]);
    }
    
    this.discoveredVariables = Array.from(variables);
    
    // Initialize previewVariables if not exists
    this.discoveredVariables.forEach(v => {
      if (this.previewVariables[v] === undefined) {
        this.previewVariables[v] = `[${v}]`;
      }
    });
  }

  get renderedBody(): string {
    let result = this.templateForm.get('body')?.value || '';
    this.discoveredVariables.forEach(v => {
      const val = this.previewVariables[v] || `{{${v}}}`;
      result = result.split(`{{${v}}}`).join(val);
      // Also handle with spaces: {{ v }}
      result = result.split(`{{ ${v} }}`).join(val);
    });
    return result;
  }

  get renderedSubject(): string {
    let result = this.templateForm.get('subject')?.value || '';
    this.discoveredVariables.forEach(v => {
      const val = this.previewVariables[v] || `{{${v}}}`;
      result = result.split(`{{${v}}}`).join(val);
      result = result.split(`{{ ${v} }}`).join(val);
    });
    return result;
  }

  onSave(): void {
    if (this.templateForm.invalid) {
      return;
    }

    this.saving = true;
    const formValue = this.templateForm.getRawValue();
    
    const obs = this.isEditMode 
      ? this.notificationService.updateTemplate(formValue)
      : this.notificationService.createTemplate(formValue);

    obs.subscribe({
      next: (resp) => {
        if (resp.success) {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Success', 
            detail: `Template ${this.isEditMode ? 'updated' : 'created'} successfully` 
          });
          setTimeout(() => this.router.navigate(['/notification/explorer']), 1500);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.message || 'Action failed' });
        }
        this.saving = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Server error' });
        this.saving = false;
      }
    });
  }

  onPreview(): void {
    const formValue = this.templateForm.getRawValue();
    const payload = {
      code: formValue.code,
      locale: formValue.locale,
      channel: formValue.channel,
      variables: this.previewVariables
    };

    // If we're in create mode and haven't saved, we might need a "temporary" preview using the raw body
    // But since the API takes code/locale/channel, we'll assume we're previewing the last saved version
    // OR the backend supports raw preview.
    // Given the API: PreviewNotificationTemplateRequest uses code/locale/channel.
    
    this.notificationService.previewTemplate(payload).subscribe({
      next: (resp) => {
        if (resp.success) {
          this.previewData = resp.data;
        } else {
          this.messageService.add({ severity: 'warning', summary: 'Preview Failed', detail: resp.message });
        }
      }
    });
  }

  getChannelIcon(channel: string): string {
    return this.channels.find(c => c.value === channel)?.icon || 'pi pi-bell';
  }

  getSafeHtml(html: string): SafeHtml {
    if (!html) return '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  onEdit(): void {
    const code = this.templateForm.get('code')?.value;
    const locale = this.templateForm.get('locale')?.value;
    const channel = this.templateForm.get('channel')?.value;
    this.router.navigate(['/notification/templates/edit', code, locale, channel]);
  }

  onBack(): void {
    this.router.navigate(['/notification/explorer']);
  }
}
