import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BotMetricsData {
  activeUsers: number;
  growthRate: number;
  avgMessagesPerUser: number;
  topSourceCount: number;
  activityLevel: string;
  userGrowth: number;
  topSource?: string;
}

@Component({
  selector: 'app-bot-metrics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metrics-section">
      <h2 class="section-title">{{ title }}</h2>
      <div class="metrics-cards">
        <div class="metric-card">
          <div class="metric-title">{{ 'Активные пользователи' }}</div>
          <div class="metric-value">{{ metrics.activeUsers }}</div>
          <div class="growth-indicator" [ngClass]="metrics.userGrowth >= 0 ? 'positive' : 'negative'" *ngIf="metrics.userGrowth !== undefined">
            <i class="fas" [ngClass]="metrics.userGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
            {{ metrics.userGrowth }}%
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-title">{{ 'Рост' }}</div>
          <div class="metric-value">{{ metrics.growthRate }}%</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-title">{{ 'Сообщений на пользователя' }}</div>
          <div class="metric-value">{{ metrics.avgMessagesPerUser }}</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-title">{{ 'Источники' }}</div>
          <div class="metric-value">{{ metrics.topSourceCount }}</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-title">{{ 'Активность' }}</div>
          <div class="metric-value">{{ getLocalizedActivityLevel(metrics.activityLevel) }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .metrics-section {
      margin-bottom: 24px;
      background-color: #fff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #2c3e50;
    }
    
    .metrics-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .metric-card {
      background-color: #f8f9fb;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .metric-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    .metric-title {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 4px;
    }
    
    .growth-indicator {
      display: flex;
      align-items: center;
      font-size: 14px;
      margin-top: 8px;
      gap: 4px;
    }
    
    .growth-indicator.positive {
      color: #10b981;
    }
    
    .growth-indicator.negative {
      color: #ef4444;
    }
    
    @media (max-width: 768px) {
      .metrics-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 480px) {
      .metrics-cards {
        grid-template-columns: 1fr;
      }
      
      .metrics-section {
        padding: 16px;
      }
    }
  `]
})
export class BotMetricsComponent {
  @Input() metrics: BotMetricsData = {
    activeUsers: 0,
    growthRate: 0,
    avgMessagesPerUser: 0,
    topSourceCount: 0,
    activityLevel: 'Low',
    userGrowth: 0
  };
  
  @Input() title: string = 'Ключевые метрики';
  
  getLocalizedActivityLevel(level: string): string {
    switch (level) {
      case 'High': return 'Высокая';
      case 'Medium': return 'Средняя';
      case 'Low': return 'Низкая';
      default: return level;
    }
  }
} 