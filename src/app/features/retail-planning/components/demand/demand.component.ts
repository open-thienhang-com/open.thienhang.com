import { Component, AfterViewInit, OnDestroy } from '@angular/core';

declare const Chart: any;
declare global {
  interface Window {
    demandComponent: any;
  }
}

@Component({
  selector: 'app-demand',
  imports: [],
  templateUrl: './demand.component.html',
  styleUrl: './demand.component.css',
})
export class DemandComponent implements AfterViewInit, OnDestroy {
  private pickupHourChart: any = null;
  private deliveryShiftChart: any = null;

  ngAfterViewInit(): void {
    // Expose component to window for demand-chart.js integration
    window.demandComponent = this;

    // Initialize the donut charts after view is ready
    setTimeout(() => {
      this.initPickupHourChart();
      this.initDeliveryShiftChart();
    }, 100);
  }

  ngOnDestroy(): void {
    // Clean up charts to prevent memory leaks
    if (this.pickupHourChart) {
      try { this.pickupHourChart.destroy(); } catch (e) { }
    }
    if (this.deliveryShiftChart) {
      try { this.deliveryShiftChart.destroy(); } catch (e) { }
    }

    // Clean up window reference
    if (window.demandComponent === this) {
      delete window.demandComponent;
    }
  }

  private initPickupHourChart(): void {
    const ctx = document.getElementById('pickupHourChart') as any;
    if (!ctx) return;

    // Generate 24-hour labels
    const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}h`);

    // Generate sample data (will be replaced with real data from API)
    const sampleData = Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));

    // Generate color palette for 24 hours (gradient from morning to night)
    const colors = this.generateHourColors();

    this.pickupHourChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: hourLabels,
        datasets: [{
          label: 'Sản lượng lấy (kg)',
          data: sampleData,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Hide legend for cleaner look with 24 items
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: ${value.toLocaleString()} kg (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Update total display
    const totalEl = document.getElementById('pickup-hour-total');
    if (totalEl) {
      const total = sampleData.reduce((a, b) => a + b, 0);
      totalEl.textContent = `${total.toLocaleString()} kg`;
    }
  }

  private initDeliveryShiftChart(): void {
    const ctx = document.getElementById('deliveryShiftChart') as any;
    if (!ctx) return;

    // Shift labels (4 shifts)
    const shiftLabels = ['Sáng (6-10h)', 'Trưa (10-14h)', 'Chiều (14-18h)', 'Tối (18-22h)'];

    // Sample data for 4 shifts
    const sampleData = [350, 280, 420, 190]; // Sample kg per shift

    // Color palette for shifts
    const shiftColors = [
      '#FCD34D', // Morning - Yellow
      '#FB923C', // Noon - Orange
      '#60A5FA', // Afternoon - Blue
      '#818CF8'  // Evening - Indigo
    ];

    this.deliveryShiftChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: shiftLabels,
        datasets: [{
          label: 'Sản lượng giao (kg)',
          data: sampleData,
          backgroundColor: shiftColors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 10,
              font: { size: 11 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: ${value.toLocaleString()} kg (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Update total display
    const totalEl = document.getElementById('delivery-shift-total');
    if (totalEl) {
      const total = sampleData.reduce((a, b) => a + b, 0);
      totalEl.textContent = `${total.toLocaleString()} kg`;
    }
  }

  private generateHourColors(): string[] {
    // Generate color gradient from dawn (yellow) -> noon (orange) -> dusk (purple) -> night (blue)
    const colors: string[] = [];
    for (let i = 0; i < 24; i++) {
      const hue = 200 + (i * 10) % 360; // Rotate through color spectrum
      const saturation = 60 + (i % 3) * 10; // Vary saturation
      const lightness = 50 + (i % 5) * 5; // Vary lightness
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
  }

  // Public method to refresh charts with real data (will be called from demand-chart.js)
  public refreshPickupHourChart(hourlyData: number[]): void {
    if (!this.pickupHourChart || !hourlyData || hourlyData.length !== 24) return;

    this.pickupHourChart.data.datasets[0].data = hourlyData;
    this.pickupHourChart.update();

    const totalEl = document.getElementById('pickup-hour-total');
    if (totalEl) {
      const total = hourlyData.reduce((a, b) => a + b, 0);
      totalEl.textContent = `${total.toLocaleString()} kg`;
    }
  }

  public refreshDeliveryShiftChart(shiftData: number[]): void {
    if (!this.deliveryShiftChart || !shiftData || shiftData.length !== 4) return;

    this.deliveryShiftChart.data.datasets[0].data = shiftData;
    this.deliveryShiftChart.update();

    const totalEl = document.getElementById('delivery-shift-total');
    if (totalEl) {
      const total = shiftData.reduce((a, b) => a + b, 0);
      totalEl.textContent = `${total.toLocaleString()} kg`;
    }
  }
}
