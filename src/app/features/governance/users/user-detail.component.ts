import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  standalone: true,
  selector: 'app-user-detail',
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, DividerModule, ProgressSpinnerModule],
  template: `
    <div class="max-w-4xl mx-auto p-4">
      <button pButton type="button" class="p-button-text" icon="pi pi-arrow-left" (click)="goBack()">Back</button>

      <div *ngIf="loading" class="text-center py-12">
        <p-progressSpinner styleClass="mx-auto"></p-progressSpinner>
        <div class="mt-3 text-surface-600">Loading user details...</div>
      </div>

      <div *ngIf="!loading && user" class="space-y-4">
        <p-card>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-semibold">{{ user.full_name || (user.first_name + ' ' + (user.last_name || '')) || user.kid }}</h2>
              <div class="text-sm text-surface-600">{{ user.email || 'No email' }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm">Account: <strong>{{ user.account || user.kid }}</strong></div>
              <div class="text-sm">ID: {{ user.id || user.kid }}</div>
            </div>
          </div>
        </p-card>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p-card>
            <h3 class="font-semibold mb-2">Governance</h3>
            <div class="space-y-3">
              <div>
                <div class="text-sm font-medium">Roles</div>
                <div *ngIf="user.governance?.roles?.length; else noRoles" class="mt-2 flex flex-wrap gap-2">
                  <p-tag *ngFor="let r of user.governance.roles" [value]="r"></p-tag>
                </div>
                <ng-template #noRoles><div class="text-xs text-surface-600">No roles assigned</div></ng-template>
              </div>

              <div>
                <div class="text-sm font-medium">Permissions</div>
                <div *ngIf="user.governance?.permissions?.length; else noPerms" class="mt-2">
                  <div *ngFor="let p of user.governance.permissions" class="text-xs">• {{ p }}</div>
                </div>
                <ng-template #noPerms><div class="text-xs text-surface-600">No explicit permissions</div></ng-template>
              </div>

              <div>
                <div class="text-sm font-medium">Policies</div>
                <div *ngIf="user.governance?.policies?.length; else noPolicies" class="mt-2">
                  <div *ngFor="let pol of user.governance.policies" class="text-xs">• {{ pol }}</div>
                </div>
                <ng-template #noPolicies><div class="text-xs text-surface-600">No policies</div></ng-template>
              </div>

              <div>
                <div class="text-sm font-medium">Teams</div>
                <div *ngIf="user.governance?.teams?.length; else noTeams" class="mt-2 flex flex-wrap gap-2">
                  <p-tag *ngFor="let t of user.governance.teams" [value]="t"></p-tag>
                </div>
                <ng-template #noTeams><div class="text-xs text-surface-600">Not part of any team</div></ng-template>
              </div>
            </div>
          </p-card>

          <p-card>
            <h3 class="font-semibold mb-2">Account Info</h3>
            <div *ngIf="user.governance?.account">
              <div class="text-sm"><strong>Name:</strong> {{ user.governance.account.full_name }}</div>
              <div class="text-sm"><strong>Email:</strong> {{ user.governance.account.email }}</div>
              <div class="text-sm"><strong>Active:</strong> {{ user.governance.account.is_active }}</div>
            </div>
            <div *ngIf="!user.governance?.account" class="text-xs text-surface-600">Account details not available</div>
          </p-card>
        </div>

        <p-card>
          <h3 class="font-semibold mb-2">Raw JSON</h3>
          <pre style="max-height:360px;overflow:auto;background:#f8f9fb;padding:8px;border-radius:6px">{{ user | json }}</pre>
        </p-card>
      </div>
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  user: any = null;
  loading = true;
  localProfileSource = 'http://localhost:8080';

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    const kid = this.route.snapshot.paramMap.get('kid');
    if (!kid) {
      this.loading = false;
      return;
    }

    const url = `${this.localProfileSource}/authentication/user/${encodeURIComponent(kid)}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.user = res?.data || res || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load user detail', err);
        this.loading = false;
      }
    });
  }

  goBack() {
    history.back();
  }
}
