import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BotService } from '../../services/bot.service';
import { IBotLight, BotStatus } from '../../interfaces/bot.interface';

@Component({
  selector: 'app-bot-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bot-list-container">
      <div class="dashboard-header">
        <h1>Панель управления ботами</h1>
        <div class="dashboard-actions">
          <button class="btn-create">
            <i class="add-icon">+</i> Добавить бота
          </button>
        </div>
      </div>
      
      <div class="dashboard-summary">
        <div class="stats-card">
          <div class="stats-value">{{ bots.length }}</div>
          <div class="stats-label">Всего ботов</div>
        </div>
        <div class="stats-card">
          <div class="stats-value">{{ getActiveBots() }}</div>
          <div class="stats-label">Активных</div>
        </div>
        <div class="stats-card">
          <div class="stats-value">{{ getInactiveBots() }}</div>
          <div class="stats-label">Неактивных</div>
        </div>
        <div class="stats-card">
          <div class="stats-value">{{ getTotalTopics() }}</div>
          <div class="stats-label">Тем</div>
        </div>
      </div>
      
      <div class="filters">
        <div class="search-box">
          <input type="text" placeholder="Поиск бота..." class="search-input">
          <button class="search-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="filter-options">
          <select class="filter-select">
            <option value="all">Все темы</option>
            <option value="crypto">Криптовалюты</option>
            <option value="finance">Финансы</option>
          </select>
          <select class="filter-select">
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>
        </div>
      </div>
      
      <div class="bots-grid">
        <div class="bot-card" *ngFor="let bot of bots">
          <div class="bot-header">
            <h3 class="bot-name">{{ bot.name }}</h3>
            <span class="bot-status" [ngClass]="getBotStatusClass(bot)">
              {{ getBotStatusText(bot) }}
            </span>
          </div>
          
          <div class="bot-content">
            <div class="tag">{{ bot.topic }}</div>
            <div class="bot-metrics">
              <div class="metric">
                <div class="metric-value">{{ botStatus(bot.id) }}</div>
                <div class="metric-label">Пользователей</div>
              </div>
              <div class="metric">
                <div class="metric-value">{{ botSourcesCount(bot.id) }}</div>
                <div class="metric-label">Источников</div>
              </div>
            </div>
          </div>
          
          <div class="bot-actions">
            <a [routerLink]="['/bot', bot.id]" class="view-btn">Подробнее</a>
            <button class="toggle-btn" (click)="toggleBot($event, bot.id)">
              {{ getToggleButtonText(bot) }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bot-list-container {
      padding: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    h1 {
      color: #333;
      margin: 0;
      font-size: 2rem;
    }
    
    .btn-create {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 10px 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .btn-create:hover {
      background-color: #0069d9;
    }
    
    .add-icon {
      font-size: 1.2rem;
      font-weight: 600;
    }
    
    .dashboard-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stats-card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      text-align: center;
    }
    
    .stats-value {
      font-size: 2.2rem;
      font-weight: 700;
      color: #007bff;
      margin-bottom: 5px;
    }
    
    .stats-label {
      color: #666;
      font-size: 1rem;
    }
    
    .filters {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    
    .search-box {
      position: relative;
      width: 350px;
    }
    
    .search-input {
      width: 100%;
      padding: 10px 40px 10px 15px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
    }
    
    .search-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
    }
    
    .filter-options {
      display: flex;
      gap: 15px;
    }
    
    .filter-select {
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background-color: white;
      min-width: 150px;
    }
    
    .bots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 25px;
    }
    
    .bot-card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .bot-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    }
    
    .bot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #eee;
    }
    
    .bot-name {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
    }
    
    .bot-status {
      padding: 5px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
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
    
    .bot-content {
      padding: 20px;
    }
    
    .tag {
      display: inline-block;
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.85rem;
      margin-bottom: 15px;
    }
    
    .bot-metrics {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
    }
    
    .metric {
      text-align: center;
      flex: 1;
    }
    
    .metric-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }
    
    .metric-label {
      font-size: 0.85rem;
      color: #666;
      margin-top: 5px;
    }
    
    .bot-actions {
      display: flex;
      border-top: 1px solid #eee;
    }
    
    .view-btn, .toggle-btn {
      flex: 1;
      text-align: center;
      padding: 12px;
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
      text-decoration: none;
    }
    
    .view-btn {
      background-color: white;
      color: #007bff;
    }
    
    .view-btn:hover {
      background-color: #f8f9fa;
    }
    
    .toggle-btn {
      background-color: #007bff;
      color: white;
    }
    
    .toggle-btn:hover {
      background-color: #0069d9;
    }
  `]
})
export class BotListComponent implements OnInit {
  bots: IBotLight[] = [];
  BotStatus = BotStatus; // Экспортируем enum в шаблон
  
  constructor(private botService: BotService) {}

  ngOnInit(): void {
    this.loadBots();
  }
  
  loadBots(): void {
    this.botService.getAllBots().subscribe(bots => {
      this.bots = bots;
    });
  }
  
  getActiveBots(): number {
    return this.bots.filter(bot => bot.status === BotStatus.ACTIVE).length;
  }
  
  getInactiveBots(): number {
    return this.bots.filter(bot => bot.status === BotStatus.INACTIVE).length;
  }
  
  getTotalTopics(): number {
    const topics = new Set(this.bots.map(bot => bot.topic));
    return topics.size;
  }
  
  getBotStatusClass(bot: IBotLight): { [key: string]: boolean } {
    return {
      'active': bot.status === BotStatus.ACTIVE,
      'inactive': bot.status === BotStatus.INACTIVE
    };
  }
  
  getBotStatusText(bot: IBotLight): string {
    return bot.status === BotStatus.ACTIVE ? 'Активен' : 'Неактивен';
  }
  
  getToggleButtonText(bot: IBotLight): string {
    return bot.status === BotStatus.ACTIVE ? 'Остановить' : 'Запустить';
  }
  
  botStatus(id: number): number {
    // Для упрощения, без ожидания асинхронного ответа:
    return id === 1 ? 347 : 124;
  }
  
  botSourcesCount(id: number): number {
    // Для упрощения, без ожидания асинхронного ответа:
    return id === 1 ? 2 : 1;
  }
  
  toggleBot(event: Event, id: number): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.botService.getBotById(id).subscribe(detailBot => {
      if (!detailBot) return;
      
      const updatedBot = {
        ...detailBot,
        status: detailBot.status === BotStatus.ACTIVE ? BotStatus.INACTIVE : BotStatus.ACTIVE
      };
      
      this.botService.updateBot(updatedBot).subscribe(() => {
        this.loadBots(); // Перезагрузка списка
      });
    });
  }
} 