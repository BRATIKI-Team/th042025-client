import { Component, OnInit, AfterViewInit, Input, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-section">
      <div class="chart-header">
        <div class="chart-title">{{ title }}</div>
        <div class="time-range-selector">
          <button 
            *ngFor="let range of timeRanges" 
            [ngClass]="{'active': selectedRange === range.value}" 
            (click)="setTimeRange(range.value)">
            {{ range.label }}
          </button>
        </div>
      </div>
      <div class="chart-container">
        <canvas #chartCanvas id="activityChart"></canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-section {
      background-color: #fff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      margin-bottom: 24px;
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .time-range-selector {
      display: flex;
    }
    
    .time-range-selector button {
      background-color: transparent;
      border: 1px solid #e5e7eb;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
    }
    
    .time-range-selector button:first-child {
      border-radius: 4px 0 0 4px;
    }
    
    .time-range-selector button:last-child {
      border-radius: 0 4px 4px 0;
    }
    
    .time-range-selector button:hover:not(.active) {
      background-color: #f8f9fb;
    }
    
    .time-range-selector button.active {
      background-color: #3390ec;
      color: white;
      border-color: #3390ec;
    }
    
    .chart-container {
      height: 300px;
    }
    
    @media (max-width: 768px) {
      .chart-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
    }
    
    @media (max-width: 480px) {
      .chart-section {
        padding: 16px;
      }
    }
  `]
})
export class ActivityChartComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() data: Record<string, number[]> = {
    '7D': [],
    '14D': [],
    '30D': []
  };
  
  @Input() selectedRange: string = '7D';
  @Input() title: string = 'Ежедневная активность';
  
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  activityChart?: Chart;
  
  timeRanges = [
    { value: '7D', label: '7Д' },
    { value: '14D', label: '14Д' },
    { value: '30D', label: '30Д' }
  ];
  
  ngOnInit(): void {
    // Инициализация в ngAfterViewInit
  }
  
  ngAfterViewInit(): void {
    this.initChart();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['selectedRange']) {
      if (this.activityChart) {
        this.updateChartData();
      } else if (this.chartCanvas) {
        this.initChart();
      }
    }
  }
  
  hasAnyData(): boolean {
    return Object.values(this.data).some(arr => arr && arr.length > 0);
  }
  
  setTimeRange(range: string): void {
    this.selectedRange = range;
    this.updateChartData();
  }
  
  initChart(): void {
    if (!this.chartCanvas) return;
    
    const canvas = this.chartCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    this.activityChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getLabelsForTimeRange(this.selectedRange),
        datasets: [{
          label: 'Активность пользователей',
          data: this.data[this.selectedRange] || [],
          borderColor: '#3390ec',
          backgroundColor: 'rgba(51, 144, 236, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#3390ec',
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: 10,
            cornerRadius: 4
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });
  }
  
  updateChartData(): void {
    if (!this.activityChart) return;
    
    this.activityChart.data.labels = this.getLabelsForTimeRange(this.selectedRange);
    this.activityChart.data.datasets[0].data = this.data[this.selectedRange] || [];
    this.activityChart.update();
  }
  
  getLabelsForTimeRange(range: string): string[] {
    // Получаем метки для соответствующего временного диапазона
    const daysCount = parseInt(range.replace('D', ''));
    const labels: string[] = [];
    
    const today = new Date();
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Форматируем дату (только день и месяц)
      labels.push(this.formatDateLabel(date));
    }
    
    return labels;
  }
  
  formatDateLabel(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth();
    
    // Названия месяцев на русском
    const months = [
      'янв', 'фев', 'мар', 'апр', 'май', 'июн', 
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    
    return `${day} ${months[month]}`;
  }
} 