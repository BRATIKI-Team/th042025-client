import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBotSource, BotSourceType } from '../../../interfaces/bot.interface';

@Component({
  selector: 'app-bot-sources',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sources-section">
      <h2 class="section-title">{{ title }}</h2>
      <div class="sources-container">
        <div *ngFor="let source of sources" class="source-card">
          <div class="source-icon" [ngClass]="getSourceTypeClass(source.type)">
            <span>{{ getSourceTypeLabel(source.type) }}</span>
          </div>
          <div class="source-info">
            <h3>
              {{ source.name }}
              <!-- SVG иконка копирования для Telegram каналов -->
              <span *ngIf="source.type === BotSourceType.TG" 
                    class="copy-icon" 
                    (click)="copyToClipboard(source.name)" 
                    title="Копировать ник">
                <svg *ngIf="copied !== source.name" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                </svg>
                <svg *ngIf="copied === source.name" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              </span>
            </h3>
            <p>{{ source.description }}</p>
            
            <!-- Ссылка только для WEB источников, не для TG -->
            <ng-container *ngIf="source.type === BotSourceType.SITE">
              <a [href]="source.url" target="_blank" class="source-link">{{ source.url }}</a>
            </ng-container>
          </div>
        </div>
        
        <div *ngIf="sources.length === 0" class="empty-sources">
          <div class="empty-icon">📄</div>
          <p>Нет подключенных источников данных</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sources-section {
      background-color: #fff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #2c3e50;
    }
    
    .sources-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .source-card {
      background-color: #f8f9fb;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .source-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
    }
    
    .source-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }
    
    .source-icon.tg {
      background-color: #3390ec;
    }
    
    .source-icon.site {
      background-color: #e17055;
    }
    
    .source-icon.other {
      background-color: #a29bfe;
    }
    
    .source-info {
      flex: 1;
    }
    
    .source-info h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
      color: #2c3e50;
      display: flex;
      align-items: center;
    }
    
    .source-info p {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #6a7181;
      line-height: 1.4;
    }
    
    .source-link {
      font-size: 13px;
      color: #3390ec;
      text-decoration: none;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s;
    }
    
    .source-link:hover {
      text-decoration: underline;
      color: #1a73e8;
    }
    
    .copy-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #3390ec;
      transition: transform 0.2s;
      margin-left: 5px;
      border-radius: 4px;
      width: 20px;
      height: 20px;
    }
    
    .copy-icon:hover {
      transform: scale(1.2);
      background-color: rgba(51, 144, 236, 0.1);
    }
    
    .empty-sources {
      grid-column: 1 / -1;
      background-color: #f8f9fb;
      border-radius: 12px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.7;
    }
    
    .empty-sources p {
      color: #6a7181;
      font-size: 16px;
      margin: 0;
    }
    
    @media (max-width: 768px) {
      .sources-container {
        grid-template-columns: 1fr;
      }
    }
    
    @media (max-width: 480px) {
      .sources-section {
        padding: 16px;
      }
    }
  `]
})
export class BotSourcesComponent {
  @Input() sources: readonly IBotSource[] = [];
  @Input() title: string = 'Источники данных';
  
  BotSourceType = BotSourceType;
  copied: string | null = null;
  
  getSourceTypeClass(type: BotSourceType): string {
    switch (type) {
      case BotSourceType.TG:
        return 'tg';
      case BotSourceType.SITE:
        return 'site';
      default:
        return 'other';
    }
  }
  
  getSourceTypeLabel(type: BotSourceType): string {
    switch (type) {
      case BotSourceType.TG:
        return 'TG';
      case BotSourceType.SITE:
        return 'WEB';
      default:
        return 'API';
    }
  }
  
  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text)
      .then(() => {
        this.copied = text;
        setTimeout(() => {
          this.copied = null;
        }, 2000);
      })
      .catch(err => {
        console.error('Не удалось скопировать в буфер обмена:', err);
      });
  }
} 