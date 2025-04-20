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
    
    if (!bot.metrics || Object.keys(bot.metrics).length === 0) return;
    
    try {
      // Получаем все метрики, отсортированные по дате
      const allEntries = this.getMetricEntries();
      
      // Если нет метрик, выходим
      if (allEntries.length === 0) return;
      
      // Создаем данные для разных временных периодов
      this.chartData = {
        '7D': this.getChartDataForPeriod(allEntries, 7),
        '14D': this.getChartDataForPeriod(allEntries, 14),
        '30D': this.getChartDataForPeriod(allEntries, 30)
      };
    } catch (error) {
      console.error('Ошибка при обработке метрик:', error);
    }
  }
  
  getChartDataForPeriod(entries: [Date, number][], days: number): number[] {
    // Заполняем массив с нулевыми значениями для всех дней
    const result: number[] = new Array(days).fill(0);
    
    // Если нет данных, возвращаем массив нулей
    if (entries.length === 0) return result;
    
    // Определяем самую позднюю дату в данных (обычно сегодня)
    const latestDate = new Date(Math.max(...entries.map(e => e[0].getTime())));
    
    // Для каждой записи вычисляем индекс в массиве результатов
    entries.forEach(([date, value]) => {
      // Разница в днях между самой поздней датой и текущей датой
      const diffDays = Math.floor((latestDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      // Если разница в пределах периода, добавляем значение
      if (diffDays < days) {
        const index = days - diffDays - 1;
        result[index] = value;
      }
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
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return 'Low';
    
    const entries = this.getMetricEntries();
    if (entries.length === 0) return 'Low';
    
    // Вычисляем среднее значение активности за последний период
    const sum = entries.reduce((total, entry) => total + entry[1], 0);
    const avg = sum / entries.length;
    
    if (avg > 500) return 'High';
    if (avg > 100) return 'Medium';
    return 'Low';
  }
  
  getAverageMessages(): number {
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return 0;
    
    const entries = this.getMetricEntries();
    if (entries.length === 0) return 0;
    
    const values = entries.map(entry => entry[1]);
    const sum = values.reduce((total, value) => total + value, 0);
    
    return sum / values.length / 10; // Делим на 10 для получения более реалистичного значения
  }
  
  getUserGrowth(): number {
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return 0;
    
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
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return [];
    
    try {
      // Получаем текущую дату
      const today = new Date();
      
      // Создаем объект для группировки метрик по дням
      const dailyMetrics: Map<string, number> = new Map();
      
      // Преобразуем объект metrics и группируем по дням
      Object.entries(this.bot.metrics).forEach(([dateStr, value]) => {
        const date = new Date(dateStr);
        const dateKey = date.toISOString().split('T')[0]; // Получаем только дату в формате YYYY-MM-DD
        
        // Если для этого дня уже есть значение, увеличиваем его
        if (dailyMetrics.has(dateKey)) {
          dailyMetrics.set(dateKey, dailyMetrics.get(dateKey)! + value);
        } else {
          dailyMetrics.set(dateKey, value);
        }
      });
      
      // Преобразуем сгруппированные данные в массив пар [Date, number]
      const entries: [Date, number][] = Array.from(dailyMetrics.entries())
        .map(([dateStr, value]) => {
          return [new Date(dateStr), value] as [Date, number];
        })
        .sort((a, b) => a[0].getTime() - b[0].getTime());
      
      // Фильтруем записи за последние 7 дней
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const recentEntries = entries.filter(entry => entry[0] >= sevenDaysAgo);
      
      return recentEntries.length > 0 ? recentEntries : entries.slice(-7);
    } catch (error) {
      console.error('Ошибка при получении метрик:', error);
      return [];
    }
  }

  getLastMetricValue(): number {
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return 0;
    
    const entries = this.getMetricEntries();
    return entries.length > 0 ? entries[entries.length - 1][1] : 0;
  }

  getMetricAverage(): number {
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return 0;
    
    const entries = this.getMetricEntries();
    if (entries.length === 0) return 0;
    
    const sum = entries.reduce((total, entry) => total + entry[1], 0);
    return Math.round(sum / entries.length);
  }

  getMaxMetricValue(): number {
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return 100;
    
    const entries = this.getMetricEntries();
    if (entries.length === 0) return 100;
    
    const max = Math.max(...entries.map(entry => entry[1]));
    return max > 0 ? max : 100;
  }

  getGrowthRate(): number {
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return 0;
    
    const entries = this.getMetricEntries();
    if (entries.length < 2) return 0;
    
    const current = entries[entries.length - 1][1];
    const previous = entries[0][1];
    
    if (previous === 0) return 0;
    
    return Math.round(((current - previous) / previous) * 100);
  }
} 