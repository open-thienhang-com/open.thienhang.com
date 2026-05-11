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
  providers: [MessageService, ConfirmationService],
  styles: [`
    .branch-profile-page { background: #f1f5f9; min-height: 100vh; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    /* ── Cover ─────────────────────────────────────────────── */
    .profile-cover {
      position: relative;
      background: linear-gradient(135deg, #14b8a6 0%, #0891b2 60%, #1e40af 100%);
      padding: 32px 40px 80px;
      overflow: hidden;
    }
    .cover-gradient {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at top right, rgba(255,255,255,.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .profile-header-content {
      position: relative;
      display: flex; align-items: flex-end; gap: 24px;
      max-width: 1200px; margin: 0 auto;
    }
    .profile-avatar-wrap { position: relative; flex-shrink: 0; }
    .profile-avatar {
      width: 96px; height: 96px; border-radius: 24px;
      background: rgba(255,255,255,.15); border: 4px solid rgba(255,255,255,.4);
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(10px);
    }
    .profile-avatar i { font-size: 2.5rem; color: #fff; }
    .profile-status-dot {
      position: absolute; bottom: -4px; right: -4px;
      width: 22px; height: 22px; border-radius: 50%;
      border: 4px solid #fff;
    }
    .dot-active { background: #22c55e; }
    .dot-inactive { background: #ef4444; }

    .profile-hero { flex: 1; padding-bottom: 4px; }
    .profile-name-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .profile-name { font-size: 2.25rem; font-weight: 800; color: #fff; margin: 0; }
    .profile-status-tag { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    .profile-meta-text { color: rgba(255,255,255,.75); margin: 6px 0 10px; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; }
    .profile-meta-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .meta-chip {
      background: rgba(255,255,255,.15); color: rgba(255,255,255,.9);
      border: 1px solid rgba(255,255,255,.2);
      padding: 4px 12px; border-radius: 999px; font-size: 0.8rem;
      display: flex; align-items: center; gap: 6px; backdrop-filter: blur(8px);
    }
    .meta-chip.mono { font-family: monospace; }

    .profile-header-actions { display: flex; gap: 10px; flex-shrink: 0; padding-bottom: 4px; align-items: center; }
    .profile-header-actions button { color: #fff !important; border-color: rgba(255,255,255,.4) !important; }
    .profile-header-actions .p-button-text { color: rgba(255,255,255,.8) !important; }

    /* ── Body ──────────────────────────────────────────────── */
    .profile-body {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 24px;
      max-width: 1200px; margin: -44px auto 0;
      padding: 0 40px 48px;
      position: relative;
    }
    @media (max-width: 1024px) {
      .profile-body { grid-template-columns: 1fr; }
    }

    /* ── Sidebar ────────────────────────────────────────────── */
    .profile-sidebar { display: flex; flex-direction: column; gap: 16px; }

    .stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .stat-card {
      background: #fff; border-radius: 16px; padding: 16px 12px;
      text-align: center; box-shadow: 0 1px 10px rgba(0,0,0,.06);
    }
    .stat-icon { font-size: 1.25rem; color: #14b8a6; display: block; margin-bottom: 6px; }
    .stat-value { font-size: 1.4rem; font-weight: 700; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-top: 2px; }

    .info-card {
      background: #fff; border-radius: 16px;
      box-shadow: 0 1px 10px rgba(0,0,0,.06); overflow: hidden;
    }
    .info-card-header {
      padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #f1f5f9;
      font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
      color: #0d9488; display: flex; align-items: center; gap: 8px;
    }
    .info-list { padding: 8px 0; }
    .info-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 18px; border-bottom: 1px solid #f8fafc; gap: 8px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-key { font-size: 0.78rem; color: #94a3b8; font-weight: 500; flex-shrink: 0; }
    .info-val { font-size: 0.875rem; color: #1e293b; font-weight: 600; text-align: right; display: flex; align-items: center; gap: 4px; }

    .id-card .id-code {
      display: block; padding: 14px 18px;
      font-family: monospace; font-size: 0.75rem;
      color: #64748b; word-break: break-all; line-height: 1.6;
    }

    /* ── Main cards ─────────────────────────────────────────── */
    .profile-main { display: flex; flex-direction: column; gap: 20px; }

    .profile-card {
      background: #fff; border-radius: 20px;
      box-shadow: 0 1px 12px rgba(0,0,0,.06); overflow: hidden;
    }
    .profile-card.no-pad { padding: 0; }
    .card-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
    .card-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 8px; }
    .card-subtitle { font-size: 0.8rem; color: #94a3b8; margin: 4px 0 0; }
    .card-body { padding: 24px; }

    /* ── TabView ── */
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav {
      background: #f8fafc; padding: 0 24px; border-bottom: 1px solid #f1f5f9;
    }
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav li .p-tabview-nav-link {
      background: transparent; border: none; padding: 18px 24px; font-weight: 700;
      font-size: 0.9rem; color: #64748b; box-shadow: none;
    }
    :host ::ng-deep .profile-tabview.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
      color: #0d9488; border-bottom: 2px solid #0d9488;
    }

    /* ── Tree ── */
    :host ::ng-deep .profile-tree.p-tree { border: none; padding: 0; }
    :host ::ng-deep .profile-tree .p-treenode-label { font-weight: 600; color: #334155; }
    :host ::ng-deep .profile-tree .p-treenode-icon { color: #14b8a6; }

    /* ── Table ── */
    :host ::ng-deep .profile-table.p-datatable .p-datatable-thead > tr > th {
      background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: .05em; padding: 12px 24px;
    }
    :host ::ng-deep .profile-table.p-datatable .p-datatable-tbody > tr > td {
      padding: 16px 24px; border-bottom: 1px solid #f1f5f9;
    }

    /* ── Loading ─────────────────────────────────────── */
    .profile-loading, .profile-not-found {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 60vh; gap: 12px; color: #64748b;
    }
  `]
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

  deleteBranch(): void {
    const code = this.branch?.code;
    if (!code) return;
    this.confirmationService.confirm({
      message: `Delete branch "${this.branch?.name}"? This cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.governanceServices.deleteBranch(code!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Branch deleted' });
            setTimeout(() => this.router.navigate(['/governance/branches']), 800);
          },
          error: (err: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Failed to delete' })
        });
      }
    });
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
