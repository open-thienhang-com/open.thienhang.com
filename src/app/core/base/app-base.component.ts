import {ConfirmationService, MessageService} from 'primeng/api';
import {Component, Injector} from '@angular/core';
import {Observable} from 'rxjs';

@Component({
  standalone: true,
  imports: [],
  template: '',
})
export abstract class AppBaseComponent {
  messageService: MessageService;
  confirmationService: ConfirmationService;
  tableRowsPerPage = 10;
  isTableLoading = false;

  constructor(injector: Injector) {
    this.messageService = injector.get(MessageService);
    this.confirmationService = injector.get(ConfirmationService);
  }

  showSuccess(message) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  showError(message) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  confirmOnDelete(event: Event, asyncTask: Observable<any>, callbackOnSuccess?) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Confirmation',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },

      accept: () => {
        asyncTask.subscribe(res => {
          if (!res) {
            return;
          }
          this.showSuccess('Delete record successfully.');
          if (callbackOnSuccess) {
            callbackOnSuccess();
          }
        })
      },
    });
  }
}
