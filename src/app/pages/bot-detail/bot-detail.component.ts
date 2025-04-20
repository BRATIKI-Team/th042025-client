import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BotService } from '../../services/bot.service';
import { IBotDetail, BotStatus, BotSourceType } from '../../interfaces/bot.interface';

@Component({
  selector: 'app-bot-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bot-detail-container" *ngIf="bot">
      <div class="header">
        <div class="navigation">
          <a [routerLink]="['/bots']" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Вернуться к списку
          </a>
        </div>
        
        <div class="bot-header">
          <div class="bot-main-info">
            <h1>{{ bot.name }}</h1>
            <span class="bot-status" [ngClass]="{'active': bot.status === BotStatus.ACTIVE, 'inactive': bot.status === BotStatus.INACTIVE}">
              {{ bot.status === BotStatus.ACTIVE ? 'Активен' : 'Неактивен' }}
            </span>
            <div class="topic-tag">{{ bot.topic }}</div>
          </div>
          
          <div class="bot-actions">
            <button class="btn status-btn" [ngClass]="{'active-btn': bot.status === BotStatus.ACTIVE, 'inactive-btn': bot.status === BotStatus.INACTIVE}" (click)="toggleStatus()">
              <span class="btn-icon">
                <svg *ngIf="bot.status === BotStatus.ACTIVE" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg *ngIf="bot.status === BotStatus.INACTIVE" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              {{ bot.status === BotStatus.ACTIVE ? 'Остановить' : 'Запустить' }}
            </button>
            <button class="btn delete-btn" (click)="deleteBot()">
              <span class="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              Удалить
            </button>
          </div>
        </div>
      </div>
      
      <div class="content-wrapper">
        <div class="main-content">
          <section class="metrics-section">
            <h2>Метрики</h2>
            <div class="metrics-cards">
              <div class="metric-card">
                <div class="metric-value">{{ bot.users_count }}</div>
                <div class="metric-label">Пользователей</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ bot.sources.length }}</div>
                <div class="metric-label">Источников</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ getLastMetricValue() }}</div>
                <div class="metric-label">Последний показатель</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ getMetricAverage() }}</div>
                <div class="metric-label">Средний показатель</div>
              </div>
            </div>
            
            <div class="chart-container">
              <div class="chart-header">
                <h3>Динамика показателей</h3>
                <div class="chart-period">
                  <button class="period-btn active">Неделя</button>
                  <button class="period-btn">Месяц</button>
                  <button class="period-btn">Год</button>
                </div>
              </div>
              <div class="chart-placeholder">
                <div class="chart-mockup">
                  <div class="chart-line"></div>
                  <div class="chart-dots">
                    <div class="chart-dot" *ngFor="let entry of getMetricEntries(); let i = index" 
                         [style.left]="(i * 100 / (getMetricEntries().length - 1)) + '%'" 
                         [style.bottom]="(entry[1] * 80 / getMaxMetricValue()) + '%'">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <aside class="sidebar">
          <section class="sources-section">
            <h2>Источники <span class="sources-count">{{ bot.sources.length }}</span></h2>
            <div class="sources-list">
              <div class="source-card" *ngFor="let source of bot.sources">
                <div class="source-type" [ngClass]="{'tg': source.type === BotSourceType.TG, 'site': source.type === BotSourceType.SITE}">
                  {{ source.type === BotSourceType.TG ? 'Telegram' : 'Сайт' }}
                </div>
                <h3 class="source-title">{{ source.name }}</h3>
                <p class="source-description">{{ source.description }}</p>
                <div class="source-url">
                  <a [href]="source.url" target="_blank" class="source-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11M15 3H21M21 3V9M21 3L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    {{ source.url }}
                  </a>
                </div>
              </div>
              
              <button class="add-source-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Добавить источник
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
    
    <div class="loading" *ngIf="!bot">
      <div class="spinner"></div>
      <div>Загрузка данных...</div>
    </div>
  `,
  styles: [`
    .bot-detail-container {
      padding: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      margin-bottom: 30px;
    }
    
    .navigation {
      margin-bottom: 20px;
    }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #666;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    
    .back-link:hover {
      color: #007bff;
    }
    
    .bot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 25px;
      margin-bottom: 30px;
    }
    
    .bot-main-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    h1 {
      margin: 0;
      font-size: 1.8rem;
      color: #333;
    }
    
    .bot-status {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .active {
      background-color: #e6f7e6;
      color: #28a745;
    }
    
    .inactive {
      background-color: #f8f9fa;
      color: #6c757d;
    }
    
    .topic-tag {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .bot-actions {
      display: flex;
      gap: 15px;
    }
    
    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .status-btn {
      background-color: #f8f9fa;
      color: #333;
    }
    
    .active-btn:hover {
      background-color: #ffebee;
      color: #d32f2f;
    }
    
    .inactive-btn:hover {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    
    .delete-btn {
      background-color: #ffebee;
      color: #d32f2f;
    }
    
    .delete-btn:hover {
      background-color: #d32f2f;
      color: white;
    }
    
    .content-wrapper {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 30px;
    }
    
    .main-content, .sidebar {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    
    section {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 25px;
    }
    
    h2 {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 1.4rem;
      color: #333;
      display: flex;
      align-items: center;
    }
    
    .sources-count {
      margin-left: 10px;
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.9rem;
    }
    
    .metrics-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .metric-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    
    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #007bff;
      margin-bottom: 8px;
    }
    
    .metric-label {
      color: #666;
      font-size: 0.9rem;
    }
    
    .chart-container {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
    }
    
    .chart-period {
      display: flex;
      gap: 10px;
    }
    
    .period-btn {
      background: none;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      color: #666;
    }
    
    .period-btn.active {
      background-color: #e3f2fd;
      color: #1976d2;
      font-weight: 500;
    }
    
    .chart-placeholder {
      height: 300px;
      position: relative;
    }
    
    .chart-mockup {
      height: 100%;
      position: relative;
    }
    
    .chart-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #ddd;
    }
    
    .chart-dots {
      position: absolute;
      height: 100%;
      width: 100%;
    }
    
    .chart-dot {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #007bff;
      transform: translate(-50%, 50%);
    }
    
    .chart-dot::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: rgba(0, 123, 255, 0.2);
    }
    
    .sources-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .source-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      position: relative;
    }
    
    .source-type {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .tg {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    
    .site {
      background-color: #e8f5e9;
      color: #388e3c;
    }
    
    .source-title {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      padding-right: 70px;
    }
    
    .source-description {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 0.9rem;
    }
    
    .source-url {
      margin-top: 10px;
    }
    
    .source-link {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #007bff;
      text-decoration: none;
      font-size: 0.9rem;
      word-break: break-all;
    }
    
    .source-link:hover {
      text-decoration: underline;
    }
    
    .add-source-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      background-color: #e3f2fd;
      color: #1976d2;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .add-source-btn:hover {
      background-color: #bbdefb;
    }
    
    .loading {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 400px;
      gap: 20px;
      color: #666;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 123, 255, 0.2);
      border-left-color: #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    @media (max-width: 992px) {
      .content-wrapper {
        grid-template-columns: 1fr;
      }
      
      .metrics-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 576px) {
      .metrics-cards {
        grid-template-columns: 1fr;
      }
      
      .bot-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .bot-actions {
        margin-top: 20px;
        width: 100%;
      }
      
      .bot-main-info {
        flex-wrap: wrap;
      }
    }
  `]
})
export class BotDetailComponent implements OnInit {
  bot?: IBotDetail;
  BotStatus = BotStatus; // Экспортируем enum в шаблон
  BotSourceType = BotSourceType; // Экспортируем enum в шаблон
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private botService: BotService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadBot(id);
    } else {
      this.router.navigate(['/bots']);
    }
  }
  
  loadBot(id: number): void {
    this.botService.getBotById(id).subscribe(bot => {
      if (bot) {
        this.bot = bot;
      } else {
        this.router.navigate(['/bots']);
      }
    });
  }
  
  toggleStatus(): void {
    if (this.bot) {
      const updatedBot = {
        ...this.bot,
        status: this.bot.status === BotStatus.ACTIVE ? BotStatus.INACTIVE : BotStatus.ACTIVE
      };
      
      this.botService.updateBot(updatedBot).subscribe(bot => {
        if (bot) {
          this.bot = bot;
        }
      });
    }
  }
  
  deleteBot(): void {
    if (this.bot && confirm(`Вы действительно хотите удалить бота "${this.bot.name}"?`)) {
      this.botService.deleteBot(this.bot.id).subscribe(success => {
        if (success) {
          this.router.navigate(['/bots']);
        } else {
          alert('Не удалось удалить бота. Пожалуйста, попробуйте еще раз.');
        }
      });
    }
  }
  
  getLastMetricValue(): number {
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return 0;
    // Получаем последнее значение из метрик
    const entries = this.getMetricEntries();
    return entries[entries.length - 1][1];
  }
  
  getMetricAverage(): number {
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return 0;
    const values = Object.values(this.bot.metrics);
    if (values.length === 0) return 0;
    
    const sum = values.reduce((total, value) => total + value, 0);
    return Math.round(sum / values.length);
  }
  
  getMaxMetricValue(): number {
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return 0;
    const values = Object.values(this.bot.metrics);
    if (values.length === 0) return 0;
    
    return Math.max(...values);
  }
  
  getMetricEntries(): [Date, number][] {
    if (!this.bot || !this.bot.metrics || Object.keys(this.bot.metrics).length === 0) return [];
    // Преобразуем Record<string, number> в массив пар [Date, number]
    return Object.entries(this.bot.metrics)
      .map(([dateStr, value]) => [new Date(dateStr), value] as [Date, number])
      .sort((a, b) => a[0].getTime() - b[0].getTime());
  }
} 