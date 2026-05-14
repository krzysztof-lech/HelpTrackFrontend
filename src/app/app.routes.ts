import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { UsersListComponent } from './users-list/users-list.component';
import { provideRouter, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FormAddTicketComponent } from './form-add-ticket/form-add-ticket.component';
import { AuthGuard } from './auth.guard';
import { EnterNewUserComponent } from './enter-new-user/enter-new-user.component';
import { MyTicketsComponent } from './my-tickets/my-tickets.component';
import { TicketDetailsComponent } from './ticket-details/ticket-details.component';
import { loginGuard } from './login.guard';
import { adminGuard } from './admin.guard';
import { TicketsPanelComponent } from './tickets-panel/tickets-panel.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

  { path: 'users', component: UsersListComponent, canActivate: [AuthGuard, adminGuard] },
  { path: 'new-ticket', component: FormAddTicketComponent, canActivate: [AuthGuard] },
  { path: 'enter-new-user', component: EnterNewUserComponent, canActivate: [AuthGuard, adminGuard] },
  { path: 'my-tickets', component: MyTicketsComponent, canActivate: [AuthGuard] },
  { path: 'ticket/:id', component: TicketDetailsComponent, canActivate: [AuthGuard] },
  { path: 'tickets-panel', component: TicketsPanelComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: '/login' }
];
