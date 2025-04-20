import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BotService } from '../../services/bot.service';
import { IBotLight, BotStatus } from '../../interfaces/bot.interface';

@Component({
  selector: 'app-bot-list-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="header-section">
        <h1>Панель управления ботами</h1>
        <p>Общая информация о доступных ботах и их состоянии</p>
      </div>
      
      <div class="metrics-section">
        <h2>Общая статистика</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">{{ bots.length }}</div>
            <div class="metric-label">Всего ботов</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ getActiveBotsCount() }}</div>
            <div class="metric-label">Активных ботов</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ getInactiveBotsCount() }}</div>
            <div class="metric-label">Неактивных ботов</div>
          </div>
        </div>
      </div>
      
      <div class="recent-bots-section">
        <h2>Доступные боты</h2>
        <div class="bots-table">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Тема</th>
                <th class="status-column">Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let bot of bots">
                <td>{{ bot.name }}</td>
                <td>{{ bot.topic }}</td>
                <td class="status-cell">
                  <span class="status-badge" [class.active]="bot.status === BotStatus.ACTIVE" [class.inactive]="bot.status === BotStatus.INACTIVE">
                    {{ bot.status === BotStatus.ACTIVE ? 'Активен' : 'Неактивен' }}
                  </span>
                </td>
                <td class="action-cell">
                  <a [routerLink]="['/bots', bot.id]" class="view-button">Просмотр</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="empty-state" *ngIf="bots.length === 0">
        <div class="empty-state-content">
          <div class="empty-icon">🤖</div>
          <h2>Нет доступных ботов</h2>
          <p>Создайте нового бота, нажав на кнопку "+" в боковой панели</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .header-section {
      margin-bottom: 8px;
    }
    
    .header-section h1 {
      font-size: 28px;
      font-weight: 500;
      margin: 0 0 8px 0;
      color: #333;
    }
    
    .header-section p {
      color: #6a7181;
      font-size: 16px;
      margin: 0;
    }
    
    .metrics-section, .recent-bots-section {
      background-color: #fff;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    h2 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }
    
    .metric-card {
      background-color: #f8f9fb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    
    .metric-value {
      font-size: 28px;
      font-weight: 500;
      color: #3390ec;
      margin-bottom: 8px;
    }
    
    .metric-label {
      font-size: 14px;
      color: #6a7181;
    }
    
    .bots-table {
      overflow-x: auto;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e6e6e6;
    }
    
    th {
      color: #6a7181;
      font-weight: 500;
      font-size: 14px;
    }
    
    td {
      color: #333;
    }
    
    .status-column {
      text-align: center;
      width: 150px;
    }
    
    .status-cell {
      text-align: center;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 500;
      min-width: 100px;
      text-align: center;
    }
    
    .status-badge.active {
      background-color: #e6f7e6;
      color: #4fae4e;
      border: 1px solid #4fae4e;
    }
    
    .status-badge.inactive {
      background-color: #f8f9fa;
      color: #6c757d;
      border: 1px solid #d1d5da;
    }
    
    .action-cell {
      text-align: right;
    }
    
    .view-button {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      background-color: #f0f2f5;
      color: #3390ec;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    
    .view-button:hover {
      background-color: #e3ecfa;
    }
    
    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border-radius: 12px;
      margin-top: 24px;
      padding: 48px;
    }
    
    .empty-state-content {
      text-align: center;
      max-width: 400px;
    }
    
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    .empty-state-content h2 {
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .empty-state-content p {
      margin: 0;
      color: #8e99a9;
      font-size: 15px;
    }
    
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }
      
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      th, td {
        padding: 8px 12px;
      }
    }
    
    @media (max-width: 480px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BotListDashboardComponent implements OnInit {
  bots: IBotLight[] = [];
  BotStatus = BotStatus;

  constructor(private botService: BotService) {}

  ngOnInit(): void {
    this.loadBots();
  }

  loadBots(): void {
    this.botService.getAllBots().subscribe(bots => {
      this.bots = bots;
    });
  }

  getActiveBotsCount(): number {
    return this.bots.filter(bot => bot.status === BotStatus.ACTIVE).length;
  }

  getInactiveBotsCount(): number {
    return this.bots.filter(bot => bot.status === BotStatus.INACTIVE).length;
  }
} 