import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GovernanceServices, Branch, BranchAssignment, BranchHierarchy } from '../../../../core/services/governance.services';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';
import { BranchComponent } from '../branch/branch.component';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, BranchComponent,
    ButtonModule, CardModule, TabViewModule, ToastModule, TagModule,
    InputTextModule, TableModule, DialogModule, TreeModule,
    ProgressSpinnerModule, ConfirmDialogModule, TooltipModule, DividerModule
  ],
  templateUrl: './branch-detail.component.html',
  providers: [MessageService, ConfirmationService]
})
export class BranchDetailComponent implements OnInit {
  branch?: Branch;
  loading = false;
  saving = false;
  editMode = false;

  assignments: BranchAssignment[] = [];
  assignmentsLoading = false;

  hierarchy: TreeNode[] = [];
  hierarchyLoading = false;

  allBranches: Branch[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private governanceServices: GovernanceServices,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      this.loadBranch(code);
    }
  }

  loadBranch(code: string) {
    this.loading = true;
    this.governanceServices.getBranch(code).subscribe({
      next: (res) => {
        this.branch = res.data;
        this.loading = false;
        if (this.branch) {
          this.loadAssignments(this.branch.code);
          this.loadHierarchy(this.branch.code);
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branch details' });
        this.loading = false;
      }
    });
    
    // Load all branches for parent dropdown in edit mode
    this.governanceServices.getBranches().subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        this.allBranches = data?.data || (Array.isArray(res.data) ? res.data : []);
      }
    });
  }

  loadAssignments(code: string) {
    this.assignmentsLoading = true;
    this.governanceServices.getBranchAssignments({ branch_code: code }).subscribe({
      next: (res) => {
        const data = (res as any)?.data;
        this.assignments = data?.data || (Array.isArray(res.data) ? res.data : []);
        this.assignmentsLoading = false;
      },
      error: () => {
        this.assignmentsLoading = false;
      }
    });
  }

  loadHierarchy(code: string) {
    this.hierarchyLoading = true;
    this.governanceServices.getBranchHierarchy(code).subscribe({
      next: (res) => {
        if (res.data) {
          this.hierarchy = [this.mapHierarchyToTreeNode(res.data)];
        }
        this.hierarchyLoading = false;
      },
      error: () => {
        this.hierarchyLoading = false;
      }
    });
  }

  private mapHierarchyToTreeNode(h: BranchHierarchy): TreeNode {
    return {
      label: h.branch.name,
      data: h.branch,
      expanded: true,
      icon: 'pi pi-building',
      children: h.children?.map(c => this.mapHierarchyToTreeNode(c)) || []
    };
  }

  onUpdate(updatedBranch: Branch) {
    if (!this.branch) return;
    this.saving = true;
    this.governanceServices.updateBranch(this.branch.code, updatedBranch).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Branch updated successfully' });
        this.branch = res.data;
        this.editMode = false;
        this.saving = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
        this.saving = false;
      }
    });
  }

  removeAssignment(id: string) {
    this.confirmationService.confirm({
      message: 'Remove this branch assignment?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.governanceServices.deleteBranchAssignment(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Removed', detail: 'Assignment removed' });
            if (this.branch) this.loadAssignments(this.branch.code);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Removal failed' });
          }
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/governance/branches']);
  }

  getSettingsJson(): string {
    if (!this.branch?.metadata) return '{}';
    return JSON.stringify(this.branch.metadata, null, 2);
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleString();
  }
}
