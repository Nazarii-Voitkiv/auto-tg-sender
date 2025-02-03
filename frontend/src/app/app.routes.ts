import { Routes } from '@angular/router';
import { MessagesComponent } from './components/messages/messages.component';
import { GroupsComponent } from './components/groups/groups.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/messages', pathMatch: 'full' },
  { path: 'messages', component: MessagesComponent },
  { path: 'groups', component: GroupsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/messages' }
];
