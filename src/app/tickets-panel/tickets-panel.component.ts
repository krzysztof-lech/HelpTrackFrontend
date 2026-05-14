import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService, Ticket, User } from '../services/api.service';

@Component({
  selector: 'app-tickets-panel',
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './tickets-panel.component.html',
  styleUrl: './tickets-panel.component.css'
})
export class TicketsPanelComponent implements OnInit{

  tickets: Ticket[] = [];
  loggedInUser: User | null = null;

  filterTab: 'unassigned' | 'active' | 'archive' | 'all' = 'unassigned';

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {

    const user = this.apiService.getCurrentUser();
    if (!user || (user.userType !== 'SupportAgent' && user.userType !== 'Admin')) {
      this.router.navigate(['/home']);
    }

    this.loggedInUser = this.apiService.getCurrentUser();
    this.loadTickets();
  }

  loadTickets(): void {
    this.apiService.getTickets().subscribe({
      next: data => {
        this.tickets = data;
      },
      error: err => console.error('Error fetching tickets:', err)
    });
  }

  get filteredTickets(): Ticket[] {
    if (!this.loggedInUser) return [];

    let filtered = this.tickets;

    switch (this.filterTab) {
      case 'unassigned':
        filtered = filtered.filter(t => !t.assignedToUserId);
        break;

      case 'active':
        filtered = filtered.filter(
          t => t.assignedToUserId === this.loggedInUser!.id && t.status !== 'Closed'
        );
        break;

      case 'archive':
        if (this.loggedInUser.userType === 'SupportAgent') {
          filtered = filtered.filter(t => t.assignedToUserId === this.loggedInUser!.id && t.status === 'Closed');
        } else if (this.loggedInUser.userType === 'Admin') {
          filtered = filtered.filter(t => t.status === 'Closed'); 
        }
        break;

      case 'all':
      default:
        break;
    }

    return filtered;
  }

  assignToMe(ticket: Ticket) {


    if (!this.loggedInUser) return;

      if (this.loggedInUser?.userType === 'SupportAgent') {
        this.apiService.assignSupportAgent(ticket.id, this.loggedInUser.id).subscribe({
          next: updatedTicket => {
            const index = this.tickets.findIndex(t => t.id === updatedTicket.id);
            if (index !== -1) this.tickets[index] = updatedTicket;

            if (this.filterTab === 'unassigned') {
              this.tickets = this.tickets.filter(t => t.assignedToUserId !== null);
            }
          },
          error: err => console.error('Error assigning ticket to self:', err)
        });
      }
   }

   statusTranslations: any = {
  'New': 'Nowe',
  'InProgress': 'W trakcie',
  'Closed': 'Zamknięte'
};

}
