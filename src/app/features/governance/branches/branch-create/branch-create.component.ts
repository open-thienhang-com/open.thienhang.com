import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GovernanceServices, Branch } from '../../../../core/services/governance.services';
import { MessageService } from 'primeng/api';
import { BranchComponent } from '../branch/branch.component';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-branch-create',
  standalone: true,
  imports: [CommonModule, BranchComponent, ToastModule, ButtonModule, TooltipModule],
  template: `
    <p-toast></p-toast>
    <div class="bg-gray-50 min-h-screen">
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-4 h-16">
            <p-button icon="pi pi-arrow-left" [text]="true" [rounded]="true" (click)="goBack()" pTooltip="Back to Branches"></p-button>
            <h1 class="text-xl font-bold text-gray-900">Create New Branch</h1>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <app-branch-form 
          [allBranches]="allBranches"
          [loading]="saving"
          (save)="onCreate($event)"
          (cancel)="goBack()">
        </app-branch-form>
      </div>
    </div>
  `,
  providers: [MessageService]
})
export class BranchCreateComponent implements OnInit {
  saving = false;
  allBranches: Branch[] = [];

  constructor(
    private governanceServices: GovernanceServices,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.governanceServices.getBranches().subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        this.allBranches = data?.data || (Array.isArray(res.data) ? res.data : []);
      }
    });
  }

  onCreate(branch: Branch) {
    this.saving = true;
    this.governanceServices.createBranch(branch).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Branch created successfully' });
        setTimeout(() => this.goBack(), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create branch' });
        this.saving = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/governance/branches']);
  }
}
