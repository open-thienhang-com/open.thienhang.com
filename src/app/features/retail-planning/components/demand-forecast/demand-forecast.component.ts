import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import {
  DemandService,
  ProductDemandSummary,
  DemandForecastResult,
} from '../../services/demand.service';

@Component({
  selector: 'app-demand-forecast',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    ChartModule,
    DialogModule,
    TableModule,
    TagModule,
    ToastModule,
    TooltipModule,
    InputNumberModule,
  ],
  providers: [MessageService],
  templateUrl: './demand-forecast.component.html',
  styleUrl: './demand-forecast.component.css',
})
export class DemandForecastComponent implements OnInit {
  products: ProductDemandSummary[] = [];
  selectedProduct: ProductDemandSummary | null = null;
  selectedWarehouseId: string | null = null;
  horizonDays = 30;

  forecastResult: DemandForecastResult | null = null;
  loadingProducts = false;
  forecasting = false;
  showInfoModal = false;

  chartData: any = null;
  chartOptions: any = null;

  warehouseOptions = [
    { label: 'All Warehouses', value: null },
    { label: 'WH-HCM-01 (Bình Dương)', value: 'WH-HCM-01' },
    { label: 'WH-HCM-02 (Quận 9)', value: 'WH-HCM-02' },
    { label: 'WH-HCM-03 (Bình Chánh)', value: 'WH-HCM-03' },
  ];

  visibleTabs = 6;

  constructor(
    private demandSvc: DemandService,
    private messageSvc: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loadingProducts = true;
    this.demandSvc.getProductsSummary().subscribe({
      next: data => {
        this.products = data;
        this.loadingProducts = false;
        if (data.length > 0) {
          this.selectedProduct = data[0];
          this.runForecast();
        }
      },
      error: () => {
        this.loadingProducts = false;
        this.messageSvc.add({ severity: 'error', summary: 'Error', detail: 'Failed to load products' });
      }
    });
  }

  selectProduct(product: ProductDemandSummary) {
    this.selectedProduct = product;
    this.forecastResult = null;
    this.chartData = null;
    if (product.data_points > 0) {
      this.runForecast();
    }
  }

  runForecast() {
    if (!this.selectedProduct) return;
    this.forecasting = true;
    this.forecastResult = null;
    this.chartData = null;

    this.demandSvc.runForecast({
      product_id: this.selectedProduct.product_id,
      warehouse_id: this.selectedWarehouseId ?? null,
      horizon_days: this.horizonDays,
    }).subscribe({
      next: result => {
        this.forecastResult = result;
        this.forecasting = false;
        if (result.data_points > 0) {
          this.buildChart(result);
        }
      },
      error: err => {
        this.forecasting = false;
        const detail = err?.error?.detail || 'Forecast failed';
        this.messageSvc.add({ severity: 'error', summary: 'Forecast Error', detail });
      }
    });
  }

  buildChart(r: DemandForecastResult) {
    if (!isPlatformBrowser(this.platformId)) return;

    const histDates  = r.history.map(h => h.date.substring(0, 10));
    const histQty    = r.history.map(h => h.quantity);
    const histFitted = r.history.map(h => h.predicted);
    const fcDates    = r.forecast.map(f => f.date.substring(0, 10));
    const fcPred     = r.forecast.map(f => f.predicted);
    const fcLower    = r.forecast.map(f => f.ci_lower);
    const fcUpper    = r.forecast.map(f => f.ci_upper);

    const hn = histDates.length;
    const fn = fcDates.length;
    const labels = [...histDates, ...fcDates];

    const pad = (arr: number[], before: number, after: number) =>
      [...Array(before).fill(null), ...arr, ...Array(after).fill(null)];

    this.chartData = {
      labels,
      datasets: [
        {
          label: 'Historical Demand',
          data: pad(histQty, 0, fn),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
          order: 1,
        },
        {
          label: 'GPR Fit',
          data: pad(histFitted, 0, fn),
          borderColor: '#94a3b8',
          backgroundColor: 'transparent',
          borderDash: [6, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
          fill: false,
          order: 2,
        },
        {
          label: 'Forecast',
          data: pad(fcPred, hn, 0),
          borderColor: '#f97316',
          backgroundColor: 'transparent',
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: false,
          order: 3,
        },
        {
          label: '95% CI Upper',
          data: pad(fcUpper, hn, 0),
          borderColor: 'transparent',
          backgroundColor: 'rgba(249,115,22,0.13)',
          borderWidth: 0,
          pointRadius: 0,
          tension: 0.4,
          fill: '+1',
          order: 4,
        },
        {
          label: '95% CI Lower',
          data: pad(fcLower, hn, 0),
          borderColor: 'transparent',
          backgroundColor: 'rgba(249,115,22,0.13)',
          borderWidth: 0,
          pointRadius: 0,
          tension: 0.4,
          fill: false,
          order: 5,
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, padding: 16, font: { size: 12 } },
          onClick: (_: any, item: any, legend: any) => {
            const idx = item.datasetIndex;
            // Hide CI datasets together
            if (idx === 3 || idx === 4) {
              const m3 = legend.chart.getDatasetMeta(3);
              const m4 = legend.chart.getDatasetMeta(4);
              const hidden = !m3.hidden;
              m3.hidden = hidden;
              m4.hidden = hidden;
            } else {
              const meta = legend.chart.getDatasetMeta(idx);
              meta.hidden = !meta.hidden;
            }
            legend.chart.update();
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              if (ctx.parsed.y == null) return '';
              const label = ctx.dataset.label || '';
              if (label.includes('CI')) return '';
              return `${label}: ${ctx.parsed.y.toFixed(1)}`;
            },
          },
          filter: (item: any) => item.parsed.y != null && !item.dataset.label?.includes('CI'),
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxTicksLimit: 14, font: { size: 11 }, maxRotation: 45 },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Quantity (units)', font: { size: 11 } },
          ticks: { font: { size: 11 } },
        },
      },
    };
  }

  get r2Severity(): 'success' | 'warn' | 'danger' {
    const r2 = this.forecastResult?.r2_score ?? 0;
    if (r2 >= 0.75) return 'success';
    if (r2 >= 0.5)  return 'warn';
    return 'danger';
  }

  get topProducts(): ProductDemandSummary[] {
    return this.products.slice(0, this.visibleTabs);
  }

  get remainingCount(): number {
    return Math.max(0, this.products.length - this.visibleTabs);
  }

  get hasData(): boolean {
    return (this.selectedProduct?.data_points ?? 0) > 0;
  }

  fmt(n: number): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n ?? 0);
  }

  fmtDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  ciWidth(p: any): number {
    return Math.round((p.ci_upper - p.ci_lower) * 10) / 10;
  }
}
