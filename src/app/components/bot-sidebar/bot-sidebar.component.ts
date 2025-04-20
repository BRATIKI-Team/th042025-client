import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { BotService } from '../../services/bot.service';
import { IBotLight, BotStatus } from '../../interfaces/bot.interface';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-bot-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>Мои боты</h2>
        <button class="add-button" title="Добавить нового бота">+</button>
      </div>
      
      <div class="bot-list">
        <a 
          *ngFor="let bot of bots" 
          class="bot-item" 
          [class.active]="selectedBotId === bot.id"
          [routerLink]="['/bots', bot.id]"
          routerLinkActive="router-active"
        >
          <div class="bot-icon" [class.inactive]="bot.status === BotStatus.INACTIVE">
            {{ getInitials(bot.name) }}
          </div>
          <div class="bot-info">
            <h3>{{ bot.name }}</h3>
            <p class="bot-topic">{{ bot.topic }}</p>
          </div>
          <div class="bot-status">
            <span class="status-indicator" [class.active]="bot.status === BotStatus.ACTIVE"></span>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100%;
      background-color: #fff;
      border-right: 1px solid #e6e6e6;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-header {
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e6e6e6;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .add-button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #3390ec;
      color: white;
      border: none;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .add-button:hover {
      background-color: #2a7ad2;
    }

    .bot-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }

    .bot-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 8px;
      margin: 0 8px 4px 8px;
      text-decoration: none;
      color: inherit;
    }

    .bot-item:hover {
      background-color: #f0f2f5;
    }

    .bot-item.active, .bot-item.router-active {
      background-color: #eef4fb;
    }

    .bot-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #3390ec;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 500;
      margin-right: 12px;
    }

    .bot-icon.inactive {
      background-color: #8e99a9;
    }

    .bot-info {
      flex: 1;
      overflow: hidden;
    }

    .bot-info h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .bot-topic {
      margin: 0;
      color: #8e99a9;
      font-size: 14px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .bot-status {
      margin-left: 8px;
    }

    .status-indicator {
      display: block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #8e99a9;
    }

    .status-indicator.active {
      background-color: #4fae4e;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
        max-height: 300px;
      }
    }
  `]
})
export class BotSidebarComponent implements OnInit, OnDestroy {
  bots: IBotLight[] = [];
  selectedBotId?: number;
  BotStatus = BotStatus;
  private destroy$ = new Subject<void>();

  constructor(
    private botService: BotService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBots();
    this.setupRouteListener();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupRouteListener(): void {
    // Слушаем изменения маршрута для обновления выбранного бота
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateSelectedBot();
    });
    
    // Также проверяем текущую активную страницу
    this.updateSelectedBot();
  }
  
  updateSelectedBot(): void {
    // Разбираем текущий URL и извлекаем ID бота
    const urlSegments = this.router.url.split('/');
    
    if (urlSegments.length > 2 && urlSegments[1] === 'bots') {
      const botId = parseInt(urlSegments[2], 10);
      if (!isNaN(botId)) {
        this.selectedBotId = botId;
      }
    }
  }

  loadBots(): void {
    this.botService.getAllBots()
      .pipe(takeUntil(this.destroy$))
      .subscribe(bots => {
        this.bots = bots;
        // После загрузки ботов, проверяем ещё раз текущий выбранный бот
        this.updateSelectedBot();
      });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
} 