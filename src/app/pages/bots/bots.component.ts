import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BotSidebarComponent } from '../../components/bot-sidebar/bot-sidebar.component';

@Component({
  selector: 'app-bots',
  standalone: true,
  imports: [CommonModule, RouterModule, BotSidebarComponent],
  template: `
    <div class="bots-container">
      <app-bot-sidebar></app-bot-sidebar>
      <div class="content-area">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .bots-container {
      display: flex;
      width: 100%;
      height: 100%;
      background-color: #f5f5f5;
    }
    
    .content-area {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    @media (max-width: 768px) {
      .bots-container {
        flex-direction: column;
      }
    }
  `]
})
export class BotsComponent {} 