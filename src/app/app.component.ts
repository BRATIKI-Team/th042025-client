import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  template: `
    <div class="app-container">
      <header class="app-header">
        <a routerLink="/bots" class="logo">SVOdki Dashboard</a>
      </header>
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100%;
    }
    
    .app-header {
      height: 60px;
      background-color: #3390ec;
      display: flex;
      align-items: center;
      padding: 0 20px;
      color: white;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      z-index: 10;
    }
    
    .logo {
      font-size: 20px;
      font-weight: 600;
      color: white;
      text-decoration: none;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    
    .logo:hover {
      opacity: 0.9;
    }
    
    .app-content {
      flex: 1;
      overflow: hidden;
    }
  `]
})
export class AppComponent {
  title = 'SVOdki Dashboard';
}
