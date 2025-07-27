import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataAssetsService } from '../data-mesh-management/assets-tab/data-assets.service';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, TabViewModule, CardModule],
  template: `
    <div class="w-full min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto p-0 md:p-8">
        <div class="flex items-center gap-6 mb-8 bg-white rounded-lg shadow-lg p-8">
          <div class="flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 overflow-hidden">
            <img *ngIf="asset?.image" [src]="asset.image" alt="Asset Image" class="w-full h-full object-cover" />
            <i *ngIf="!asset?.image" class="pi pi-database text-5xl text-blue-700"></i>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-blue-700 flex items-center gap-2">
              <i class="pi pi-tag"></i>
              {{ asset?.name || 'No Name' }}
            </h1>
            <div class="flex flex-wrap gap-4 mt-2 text-base text-gray-500">
              <span class="flex items-center gap-1"><i class="pi pi-box"></i>Type: <span class="font-semibold">{{ asset?.type || 'N/A' }}</span></span>
              <span class="flex items-center gap-1"><i class="pi pi-shield"></i>Sensitivity: <span class="font-semibold">{{ asset?.sensitivity || 'N/A' }}</span></span>
              <span class="flex items-center gap-1"><i class="pi pi-user"></i>Owner: <span class="font-semibold">{{ asset?.owner || 'N/A' }}</span></span>
              <span class="flex items-center gap-1"><i class="pi pi-map-marker"></i>Location: <span class="font-semibold">{{ asset?.location || 'N/A' }}</span></span>
              <span class="flex items-center gap-1"><i class="pi pi-info-circle"></i>Status: <span class="font-semibold">{{ asset?.status || 'N/A' }}</span></span>
            </div>
          </div>
        </div>
        <!-- Tabs for details -->
        <p-tabView>
          <p-tabPanel header="General Info" leftIcon="pi pi-info-circle">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p-card>
                  <div class="mb-2 flex items-center gap-2"><i class="pi pi-link"></i><span class="font-semibold text-gray-700">Source:</span> {{ asset?.source || 'N/A' }}</div>
                  <div class="mb-2 flex items-center gap-2"><i class="pi pi-align-left"></i><span class="font-semibold text-gray-700">Description:</span> {{ asset?.description || 'N/A' }}</div>
                  <div class="mb-2 flex items-center gap-2"><i class="pi pi-calendar-plus"></i><span class="font-semibold text-gray-700">Created At:</span><span *ngIf="asset?.created_at; else noCreated">{{ asset.created_at | date:'short' }}</span><ng-template #noCreated><span class="text-gray-400">N/A</span></ng-template></div>
                  <div class="mb-2 flex items-center gap-2"><i class="pi pi-calendar-minus"></i><span class="font-semibold text-gray-700">Updated At:</span><span *ngIf="asset?.updated_at; else noUpdated">{{ asset.updated_at | date:'short' }}</span><ng-template #noUpdated><span class="text-gray-400">N/A</span></ng-template></div>
                </p-card>
              </div>
              <div>
                <p-card>
                  <div class="mb-2 flex items-center gap-2"><i class="pi pi-lock"></i><span class="font-semibold text-gray-700">Classification:</span> {{ asset?.classification || 'N/A' }}</div>
                  <div class="mb-2 flex items-center gap-2"><i class="pi pi-refresh"></i><span class="font-semibold text-gray-700">Version:</span> {{ asset?.version || 'N/A' }}</div>
                  <div class="mb-2 flex items-center gap-2"><i class="pi pi-users"></i><span class="font-semibold text-gray-700">Access Controls:</span> {{ asset?.access_controls || 'N/A' }}</div>
                  <div class="mb-2 flex items-center gap-2"><i class="pi pi-share-alt"></i><span class="font-semibold text-gray-700">Lineage:</span> {{ asset?.lineage || 'N/A' }}</div>
                </p-card>
              </div>
            </div>
          </p-tabPanel>
          <p-tabPanel header="Tags & Compliance" leftIcon="pi pi-tags">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <p-card header="Tags">
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let tag of asset?.tags" class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">{{ tag }}</span>
                  <span *ngIf="!asset?.tags?.length" class="text-gray-400">No tags</span>
                </div>
              </p-card>
              <p-card header="Compliance Tags">
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let tag of asset?.compliance_tags" class="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">{{ tag }}</span>
                  <span *ngIf="!asset?.compliance_tags?.length" class="text-gray-400">No compliance tags</span>
                </div>
              </p-card>
            </div>
          </p-tabPanel>
          <p-tabPanel header="Quality & Docs" leftIcon="pi pi-check">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <p-card header="Quality Rules">
                <div *ngIf="asset?.quality_rules?.length; else noQuality">
                  <ul class="list-disc pl-6 text-gray-700">
                    <li *ngFor="let rule of asset.quality_rules">{{ rule }}</li>
                  </ul>
                </div>
                <ng-template #noQuality><span class="text-gray-400">No quality rules</span></ng-template>
              </p-card>
              <p-card header="Documentation Links">
                <div *ngIf="asset?.documentation_links?.length; else noDocs">
                  <ul class="list-disc pl-6 text-blue-700">
                    <li *ngFor="let link of asset.documentation_links"><a [href]="link" target="_blank" class="underline flex items-center gap-1"><i class="pi pi-external-link"></i>{{ link }}</a></li>
                  </ul>
                </div>
                <ng-template #noDocs><span class="text-gray-400">No documentation links</span></ng-template>
              </p-card>
            </div>
          </p-tabPanel>
          <p-tabPanel header="Backup & Audit" leftIcon="pi pi-save">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <p-card header="Backup Policy">
                <span *ngIf="asset?.backup_policy; else noBackup">{{ asset.backup_policy }}</span>
                <ng-template #noBackup><span class="text-gray-400">No backup policy</span></ng-template>
              </p-card>
              <p-card header="Audit Log">
                <div *ngIf="asset?.audit_log?.length; else noAudit">
                  <ul class="list-disc pl-6 text-gray-700">
                    <li *ngFor="let log of asset.audit_log">{{ log }}</li>
                  </ul>
                </div>
                <ng-template #noAudit><span class="text-gray-400">No audit log</span></ng-template>
              </p-card>
            </div>
          </p-tabPanel>
          <p-tabPanel header="Alerts" leftIcon="pi pi-bell">
            <p-card header="Alerts">
              <div *ngIf="asset?.alerts?.length; else noAlerts">
                <ul class="list-disc pl-6 text-red-700">
                  <li *ngFor="let alert of asset.alerts">{{ alert }}</li>
                </ul>
              </div>
              <ng-template #noAlerts><span class="text-gray-400">No alerts</span></ng-template>
            </p-card>
          </p-tabPanel>
        </p-tabView>
        <!-- Back button -->
        <div class="flex justify-end mt-8">
          <button routerLink="/explore" class="px-6 py-2 bg-blue-600 text-white rounded shadow flex items-center gap-2">
            <i class="pi pi-arrow-left"></i>Back to Catalog
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class AssetDetailComponent implements OnInit {
  asset: any;
  assetKeys: string[] = [];
  constructor(private route: ActivatedRoute, private dataAssetsService: DataAssetsService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataAssetsService.getAssetById(id).subscribe(res => {
        this.asset = res;
        if (res) {
          this.assetKeys = Object.keys(res).filter(k => !['name','type','subtype','owner','status','assets','health','lastSynced','_id'].includes(k));
        }
      }, err => {
        this.asset = null;
      });
    } else {
      this.asset = null;
    }
  }
}
