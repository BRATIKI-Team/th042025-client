import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, ParamMap } from '@angular/router';
import { BotService } from '../../services/bot.service';
import { IBotDetail, BotStatus, BotSourceType } from '../../interfaces/bot.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Подкомпоненты
import { BotHeaderComponent } from './bot-header/bot-header.component';
import { BotMetricsComponent, BotMetricsData } from './bot-metrics/bot-metrics.component';
import { ActivityChartComponent } from './activity-chart/activity-chart.component';
import { BotSourcesComponent } from './bot-sources/bot-sources.component';

@Component({
  selector: 'app-bot-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    BotHeaderComponent, 
    BotMetricsComponent, 
    ActivityChartComponent,
    BotSourcesComponent
  ],
  template: `
    <div class="bot-detail-container" *ngIf="bot">
      <!-- Заголовок бота -->
      <app-bot-header 
        [bot]="bot" 
        [isExpanded]="isTopicExpanded" 
        (expandToggled)="toggleTopicExpanded($event)">
      </app-bot-header>
      
      <!-- Метрики бота -->
      <app-bot-metrics [metrics]="botMetrics"></app-bot-metrics>
      
      <!-- График активности -->
      <app-activity-chart 
        [data]="chartData" 
        [selectedRange]="selectedTimeRange">
      </app-activity-chart>
      
      <!-- Источники данных -->
      <app-bot-sources [sources]="bot.sources"></app-bot-sources>
    </div>
    
    <!-- Состояние загрузки или ошибки -->
    <div class="empty-state" *ngIf="!bot && !loading">
      <div class="empty-state-content">
        <div class="empty-icon">🤖</div>
        <h2>Бот не найден</h2>
        <p>Выбранный бот не существует или был удален</p>
      </div>
    </div>
    
    <div class="loading-state" *ngIf="loading">
      <div class="loading-spinner"></div>
      <p>Загрузка данных бота...</p>
    </div>
  `,
  styleUrls: ['./bot-detail.component.scss']
})
export class BotDetailComponent implements OnInit, OnDestroy {
  bot?: IBotDetail;
  loading = true;
  BotStatus = BotStatus;
  BotSourceType = BotSourceType;
  botId: string = '';
  botMetrics: BotMetricsData = {
    activeUsers: 0,
    growthRate: 0,
    avgMessagesPerUser: 0,
    topSourceCount: 0,
    activityLevel: 'Low',
    userGrowth: 0
  };
  selectedTimeRange: string = '7D';
  isTopicExpanded = false;
  
  // Данные для графика активности
  chartData: Record<string, number[]> = {
    '7D': [],
    '14D': [],
    '30D': []
  };
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private botService: BotService
  ) {}

  ngOnInit(): void {
    // Подписываемся на изменения параметров маршрута
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: ParamMap) => {
        const id = params.get('id');
        if (id) {
          this.botId = id;
          this.loadBot(Number(this.botId));
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBot(id: number): void {
    this.loading = true;
    this.botService.getBotById(id).subscribe(bot => {
      this.bot = bot;
      this.loading = false;
      
      if (bot) {
        this.calculateBotMetrics(bot);
        this.generateChartData(bot);
      }
    });
  }

  calculateBotMetrics(bot: IBotDetail): void {
    // Вычисляем метрики на основе данных о боте
    const metrics: BotMetricsData = {
      activeUsers: bot.users_count,
      growthRate: this.getGrowthRate(),
      avgMessagesPerUser: Math.round(this.getAverageMessages() * 10) / 10,
      topSourceCount: bot.sources.length,
      activityLevel: this.getActivityLevel(),
      userGrowth: Math.round(this.getUserGrowth() * 10) / 10,
      topSource: this.getTopSource(bot)
    };
    
    this.botMetrics = metrics;
  }
  
  generateChartData(bot: IBotDetail): void {
    // Всегда используем пустые данные для графика
    this.chartData = {
      '7D': [],
      '14D': [],
      '30D': []
    };
    
    if (!bot.metrics) return;
    
    try {
      // Проверяем тип metrics
      if (bot.metrics instanceof Map) {
        // Если это Map, используем entries()
        const allEntries = Array.from(bot.metrics.entries())
          .sort((a, b) => a[0].getTime() - b[0].getTime());
        
        // Если нет метрик, выходим
        if (allEntries.length === 0) return;
        
        // Создаем данные для разных временных периодов
        this.chartData = {
          '7D': this.getChartDataForPeriod(allEntries, 7),
          '14D': this.getChartDataForPeriod(allEntries, 14),
          '30D': this.getChartDataForPeriod(allEntries, 30)
        };
      } else {
        console.error('Тип metrics не является Map');
      }
    } catch (error) {
      console.error('Ошибка при обработке метрик:', error);
    }
  }
  
  getChartDataForPeriod(entries: [Date, number][], days: number): number[] {
    // Берем только последние N дней из метрик
    const recentEntries = entries.slice(-days);
    
    // Если у нас недостаточно данных, добавляем нулевые значения в начало
    const result: number[] = [];
    
    if (recentEntries.length < days) {
      const missingDays = days - recentEntries.length;
      for (let i = 0; i < missingDays; i++) {
        result.push(0);
      }
    }
    
    // Добавляем фактические значения
    recentEntries.forEach(entry => {
      result.push(entry[1]);
    });
    
    return result;
  }
  
  getTopSource(bot: IBotDetail): string {
    if (!bot.sources || bot.sources.length === 0) return 'Нет источников';
    // В реальном приложении можно было бы определять "основной" источник
    // по каким-то параметрам, сейчас просто берем первый в списке
    return bot.sources[0].name;
  }
  
  getActivityLevel(): string {
    if (!this.bot || !this.bot.metrics || this.bot.metrics.size === 0) return 'Low';
    
    const entries = this.getMetricEntries();
    if (entries.length === 0) return 'Low';
    
    const lastValue = entries[entries.length - 1][1];
    
    if (lastValue > 500) return 'High';
    if (lastValue > 100) return 'Medium';
    return 'Low';
  }
  
  getAverageMessages(): number {
    if (!this.bot || !this.bot.metrics || this.bot.metrics.size === 0) return 0;
    
    const entries = this.getMetricEntries();
    if (entries.length === 0) return 0;
    
    const values = entries.map(entry => entry[1]);
    const sum = values.reduce((total, value) => total + value, 0);
    
    return sum / values.length / 10; // Делим на 10 для получения более реалистичного значения
  }
  
  getUserGrowth(): number {
    if (!this.bot || !this.bot.metrics || this.bot.metrics.size === 0) return 0;
    
    const entries = this.getMetricEntries();
    if (entries.length < 2) return 0;
    
    // Вычисляем рост пользователей в процентах на основе первой и последней записи
    const first = entries[0][1];
    const last = entries[entries.length - 1][1];
    
    if (first === 0) return 0;
    
    return ((last - first) / first) * 100;
  }
  
  toggleTopicExpanded(expanded?: boolean): void {
    if (expanded !== undefined) {
      this.isTopicExpanded = expanded;
    } else {
      this.isTopicExpanded = !this.isTopicExpanded;
    }
  }

  getMetricEntries(): [Date, number][] {
    if (!this.bot || !this.bot.metrics) return [];
    
    try {
      // Проверяем тип metrics
      if (this.bot.metrics instanceof Map) {
        // Если это Map, используем entries()
        return Array.from(this.bot.metrics.entries())
          .sort((a, b) => a[0].getTime() - b[0].getTime())
          .slice(-7);
      } else {
        console.error('Тип metrics не является Map');
        return [];
      }
    } catch (error) {
      console.error('Ошибка при получении метрик:', error);
      return [];
    }
  }

  getMaxMetricValue(): number {
    if (!this.bot || !this.bot.metrics || this.bot.metrics.size === 0) return 100;
    
    let max = 0;
    
    this.bot.metrics.forEach((value) => {
      if (value > max) max = value;
    });
    
    return max > 0 ? max : 100;
  }

  getGrowthRate(): number {
    if (!this.bot || !this.bot.metrics || this.bot.metrics.size === 0) return 0;
    
    const entries = this.getMetricEntries();
    if (entries.length < 2) return 0;
    
    const current = entries[entries.length - 1][1];
    const previous = entries[0][1];
    
    if (previous === 0) return 100;
    
    return Math.round(((current - previous) / previous) * 100);
  }
} 