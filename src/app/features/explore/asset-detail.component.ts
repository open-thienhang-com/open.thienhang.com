import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataAssetsService } from '../data-mesh-management/assets-tab/data-assets.service';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, TabViewModule, CardModule, RouterModule],
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
                  <div class="mb-2 flex items-center gap-2"><i class="pi pi-server"></i><span class="font-semibold text-gray-700">Integration Status:</span> {{ asset?.integration_status || 'N/A' }}</div>
                  <div class="mb-2 flex items-center gap-2"><i class="pi pi-save"></i><span class="font-semibold text-gray-700">Backup Policy:</span> {{ asset?.backup_policy || 'N/A' }}</div>
                </p-card>
              </div>
            </div>
          </p-tabPanel>
          
          <p-tabPanel header="Domain & Product" leftIcon="pi pi-sitemap">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <p-card header="Domain Information" *ngIf="asset?.domain">
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-building"></i><span class="font-semibold text-gray-700">Domain ID:</span> {{ asset.domain.domain_id || 'N/A' }}</div>
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-tag"></i><span class="font-semibold text-gray-700">Domain Name:</span> {{ asset.domain.domain_name || 'N/A' }}</div>
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-user"></i><span class="font-semibold text-gray-700">Domain Owner:</span> {{ asset.domain.domain_owner || 'N/A' }}</div>
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-align-left"></i><span class="font-semibold text-gray-700">Description:</span> {{ asset.domain.description || 'N/A' }}</div>
              </p-card>
              <p-card header="Data Product Information" *ngIf="asset?.data_product">
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-box"></i><span class="font-semibold text-gray-700">Product ID:</span> {{ asset.data_product.product_id || 'N/A' }}</div>
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-tag"></i><span class="font-semibold text-gray-700">Product Name:</span> {{ asset.data_product.product_name || 'N/A' }}</div>
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-user"></i><span class="font-semibold text-gray-700">Product Owner:</span> {{ asset.data_product.product_owner || 'N/A' }}</div>
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-code"></i><span class="font-semibold text-gray-700">Version:</span> {{ asset.data_product.version || 'N/A' }}</div>
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-align-left"></i><span class="font-semibold text-gray-700">Description:</span> {{ asset.data_product.description || 'N/A' }}</div>
              </p-card>
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
              <p-card header="Discovery Tags" *ngIf="asset?.discovery_tags?.length">
                <div class="flex flex-wrap gap-2">
                  <span *ngFor="let tag of asset.discovery_tags" class="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">{{ tag }}</span>
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
          
          <p-tabPanel header="Schema & Business" leftIcon="pi pi-database">
            <div class="grid grid-cols-1 gap-6">
              <p-card header="Schema Information" *ngIf="asset?.schema">
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-code"></i><span class="font-semibold text-gray-700">Schema Type:</span> {{ asset.schema.schema_type || 'N/A' }}</div>
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-link"></i><span class="font-semibold text-gray-700">Registry URL:</span> {{ asset.schema.schema_registry_url || 'N/A' }}</div>
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-tag"></i><span class="font-semibold text-gray-700">Schema Version:</span> {{ asset.schema.schema_version || 'N/A' }}</div>
                <div *ngIf="asset.schema.schema_definition" class="mb-2">
                  <span class="font-semibold text-gray-700 flex items-center gap-2"><i class="pi pi-file-export"></i>Schema Definition:</span>
                  <pre class="bg-gray-100 p-3 rounded mt-2 text-sm overflow-x-auto">{{ asset.schema.schema_definition }}</pre>
                </div>
              </p-card>
              <p-card header="Business Glossary" *ngIf="asset?.business_glossary?.length">
                <div *ngFor="let term of asset.business_glossary" class="mb-4 p-3 border rounded">
                  <div class="font-semibold text-blue-700 mb-1">{{ term.term }}</div>
                  <div class="text-gray-600 mb-2">{{ term.definition }}</div>
                  <div *ngIf="term.business_rules?.length">
                    <span class="font-semibold text-gray-700">Business Rules:</span>
                    <ul class="list-disc pl-6 mt-1">
                      <li *ngFor="let rule of term.business_rules" class="text-sm text-gray-600">{{ rule }}</li>
                    </ul>
                  </div>
                </div>
              </p-card>
            </div>
          </p-tabPanel>
          
          <p-tabPanel header="Lineage & Access" leftIcon="pi pi-share-alt">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <p-card header="Data Lineage" *ngIf="asset?.lineage">
                <div *ngIf="asset.lineage.inputs?.length" class="mb-4">
                  <span class="font-semibold text-gray-700 flex items-center gap-2"><i class="pi pi-arrow-right"></i>Inputs:</span>
                  <ul class="list-disc pl-6 mt-1">
                    <li *ngFor="let input of asset.lineage.inputs" class="text-sm text-blue-600">{{ input }}</li>
                  </ul>
                </div>
                <div *ngIf="asset.lineage.outputs?.length" class="mb-4">
                  <span class="font-semibold text-gray-700 flex items-center gap-2"><i class="pi pi-arrow-left"></i>Outputs:</span>
                  <ul class="list-disc pl-6 mt-1">
                    <li *ngFor="let output of asset.lineage.outputs" class="text-sm text-green-600">{{ output }}</li>
                  </ul>
                </div>
                <div *ngIf="asset.lineage.transformations?.length">
                  <span class="font-semibold text-gray-700 flex items-center gap-2"><i class="pi pi-refresh"></i>Transformations:</span>
                  <ul class="list-disc pl-6 mt-1">
                    <li *ngFor="let transform of asset.lineage.transformations" class="text-sm text-purple-600">{{ transform }}</li>
                  </ul>
                </div>
              </p-card>
              <p-card header="Access Controls" *ngIf="asset?.access_controls">
                <div *ngIf="asset.access_controls.admin?.length" class="mb-3">
                  <span class="font-semibold text-red-700 flex items-center gap-2"><i class="pi pi-shield"></i>Admin:</span>
                  <ul class="list-disc pl-6 mt-1">
                    <li *ngFor="let admin of asset.access_controls.admin" class="text-sm">{{ admin }}</li>
                  </ul>
                </div>
                <div *ngIf="asset.access_controls.write?.length" class="mb-3">
                  <span class="font-semibold text-orange-700 flex items-center gap-2"><i class="pi pi-pencil"></i>Write:</span>
                  <ul class="list-disc pl-6 mt-1">
                    <li *ngFor="let writer of asset.access_controls.write" class="text-sm">{{ writer }}</li>
                  </ul>
                </div>
                <div *ngIf="asset.access_controls.read?.length">
                  <span class="font-semibold text-green-700 flex items-center gap-2"><i class="pi pi-eye"></i>Read:</span>
                  <ul class="list-disc pl-6 mt-1">
                    <li *ngFor="let reader of asset.access_controls.read" class="text-sm">{{ reader }}</li>
                  </ul>
                </div>
              </p-card>
            </div>
          </p-tabPanel>
          
          <p-tabPanel header="Audit & Policies" leftIcon="pi pi-save">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <p-card header="Audit Log" *ngIf="asset?.audit_log?.length">
                <div class="max-h-64 overflow-y-auto">
                  <div *ngFor="let log of asset.audit_log" class="mb-3 p-2 border rounded">
                    <div class="font-semibold text-sm">{{ log.action }}</div>
                    <div class="text-xs text-gray-600">{{ log.actor }} - {{ log.timestamp | date:'short' }}</div>
                    <div class="text-xs text-gray-500">{{ log.detail }}</div>
                  </div>
                </div>
              </p-card>
              <p-card header="Policies">
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-save"></i><span class="font-semibold text-gray-700">Backup Policy:</span> {{ asset?.backup_policy || 'N/A' }}</div>
                <div class="mb-2 flex items-center gap-2"><i class="pi pi-clock"></i><span class="font-semibold text-gray-700">Retention Policy:</span> {{ asset?.retention_policy || 'N/A' }}</div>
              </p-card>
            </div>
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
  loading: boolean = false;
  error: string = '';

  constructor(private route: ActivatedRoute, private dataAssetsService: DataAssetsService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.dataAssetsService.getAssetById(id).subscribe({
        next: (response) => {
          // Handle API response structure
          this.asset = response?.data || response;
          if (this.asset) {
            this.assetKeys = Object.keys(this.asset).filter(k => 
              !['name','type','subtype','owner','status','_id','kid'].includes(k)
            );
          } else {
            // Provide a minimal asset structure if no data returned
            this.asset = this.getDefaultAsset(id);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching asset:', err);
          this.error = 'Failed to load asset details';
          // Provide a minimal asset structure on error
          this.asset = this.getDefaultAsset(id);
          this.loading = false;
        }
      });
    } else {
      this.error = 'Invalid asset ID';
      this.asset = null;
    }
  }

  private getDefaultAsset(id: string): any {
    return {
      _id: id,
      name: 'Asset Not Found',
      type: 'N/A',
      owner: 'N/A',
      status: 'N/A',
      sensitivity: 'N/A',
      description: 'Asset details could not be loaded',
      tags: [],
      created_at: null,
      updated_at: null
    };
  }
}
