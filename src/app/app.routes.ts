import { Routes } from '@angular/router';
import { BotsComponent } from './pages/bots/bots.component';
import { BotDetailComponent } from './components/bot-detail/bot-detail.component';
import { BotListDashboardComponent } from './components/bot-list-dashboard/bot-list-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'bots', pathMatch: 'full' },
  { 
    path: 'bots', 
    component: BotsComponent,
    children: [
      { path: '', component: BotListDashboardComponent },
      { path: ':id', component: BotDetailComponent }
    ]
  },
  { path: '**', redirectTo: 'bots' }
];
