import { Component, Input, EventEmitter, Output, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBotDetail, BotStatus } from '../../../interfaces/bot.interface';

@Component({
  selector: 'app-bot-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bot-header-section">
      <div class="bot-header">
        <div class="bot-header-icon" [class.inactive]="bot.status === BotStatus.INACTIVE">
          {{ getInitials(bot.name) }}
        </div>
        <div class="bot-header-info">
          <div class="title-row">
            <h1>{{ bot.name }}</h1>
            <span class="status-badge" [class.active]="bot.status === BotStatus.ACTIVE">
              {{ bot.status === BotStatus.ACTIVE ? 'Активен' : 'Неактивен' }}
            </span>
          </div>
          <div class="topic-wrapper">
            <div #topicContent class="topic-content" [class.expanded]="isExpanded">{{ bot.topic }}</div>
            <div *ngIf="needsExpander" class="topic-expander" (click)="toggleExpanded()">
              Показать {{ isExpanded ? 'меньше' : 'больше' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bot-header-section {
      background-color: #fff;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      margin-bottom: 24px;
    }
    
    .bot-header {
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }
    
    .bot-header-icon {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background-color: #3390ec;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 500;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(51, 144, 236, 0.3);
    }
    
    .bot-header-icon.inactive {
      background-color: #8e99a9;
      box-shadow: 0 4px 12px rgba(142, 153, 169, 0.3);
    }
    
    .bot-header-info {
      flex: 1;
    }
    
    .title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    
    .title-row h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      color: #2c3e50;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 500;
      background-color: #f1f3f5;
      color: #8e99a9;
    }
    
    .status-badge.active {
      background-color: #e6f7e6;
      color: #4fae4e;
    }
    
    .topic-wrapper {
      position: relative;
      margin-top: 10px;
      background-color: #f8f9fb;
      border-radius: 12px;
      padding: 15px;
      border-left: 4px solid #3390ec;
    }
    
    .topic-content {
      color: #4a5568;
      font-size: 15px;
      line-height: 1.6;
      overflow: hidden;
      max-height: 4.8em; /* 3 lines */
      margin: 0;
      transition: max-height 0.3s ease;
    }
    
    .topic-content.expanded {
      max-height: 1000px;
    }
    
    .topic-expander {
      display: inline-block;
      margin-top: 8px;
      color: #3390ec;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: underline;
    }
    
    @media (max-width: 768px) {
      .bot-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .bot-header-icon {
        margin-bottom: 16px;
      }
      
      .title-row {
        flex-direction: column;
        gap: 8px;
      }
    }
    
    @media (max-width: 480px) {
      .bot-header-section {
        padding: 16px;
      }
    }
  `]
})
export class BotHeaderComponent implements AfterViewInit {
  @Input() bot!: IBotDetail;
  @Input() isExpanded: boolean = false;
  @Output() expandToggled = new EventEmitter<boolean>();
  
  @ViewChild('topicContent') topicContentElement!: ElementRef;
  
  BotStatus = BotStatus;
  needsExpander = false;
  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.checkIfNeedsExpander();
    }, 0);
  }
  
  checkIfNeedsExpander(): void {
    const element = this.topicContentElement.nativeElement;
    // Если высота содержимого больше максимальной высоты, значит текст не помещается
    this.needsExpander = element.scrollHeight > element.clientHeight;
  }
  
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  
  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
    this.expandToggled.emit(this.isExpanded);
  }
} 