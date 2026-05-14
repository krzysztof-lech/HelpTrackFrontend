import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, Ticket, User } from '../services/api.service';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit {
  loggedInUser: User | null = null;
  ticket: Ticket & { showMenu?: boolean } | null = null;
  supportAgents: User[] = [];
  selectedSupportAgentId: number | null = null;

  editingStatus = false;
  selectedStatus: 'New' | 'InProgress' | 'Closed' = 'New';
  fromMyTickets = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const from = this.route.snapshot.queryParamMap.get('from');

    this.fromMyTickets = from === 'my-tickets';

    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
        this.loggedInUser = JSON.parse(userJson);
    }

    this.apiService.getSupportAgents().subscribe({
      next: supportAgentsList => {
        this.supportAgents = supportAgentsList;
      },
      error: err => console.error('Error fetching support agents:', err)
    });

    this.apiService.getTicket(id).subscribe({
      next: ticketData => {
        const assignedToId = ticketData.assignedToUserId ?? null;

        this.ticket = {
          ...ticketData,
          assignedToUserId: assignedToId,
          assignedToUser:
            assignedToId != null
              ? this.supportAgents.find(u => u.id === assignedToId) ?? null
              : null,
          showMenu: false
        };

        this.selectedSupportAgentId = assignedToId;
        this.selectedStatus = ticketData.status ?? 'New';
      },
      error: err => console.error('Error fetching ticket:', err)
    });

  }

  assignSupportAgent(): void {
    if (!this.ticket) return;

    this.apiService.assignSupportAgent(this.ticket.id, this.selectedSupportAgentId)
      .subscribe(updated => {
        this.ticket = {
          ...updated,
          assignedToUserId: this.selectedSupportAgentId,
          assignedToUser: this.supportAgents.find(u => u.id === this.selectedSupportAgentId) ?? null,
          showMenu: this.ticket?.showMenu
        };
      });
  }

  get canAssign(): boolean {
    const role = this.apiService.getCurrentUser()?.userType;
    return role === 'Admin' || role === 'SupportAgent';
  }

  startEditingStatus(): void {
    if (!this.ticket) return;
    this.editingStatus = true;
    this.selectedStatus = this.ticket.status ?? 'New';
  }

  saveStatus(): void {
    if (!this.ticket) return;

    this.apiService.updateTicketStatus(this.ticket.id, this.selectedStatus)
      .subscribe(updated => {
        this.ticket = {
          ...updated,
          showMenu: this.ticket?.showMenu
        };
        this.editingStatus = false;
      });
  }

  get canChangeStatus(): boolean {
    if (!this.ticket) return false;
    const currentUser = this.apiService.getCurrentUser();
    if (!currentUser) return false;

    const role = currentUser.userType;
    if (role === 'Admin') return true;
    if (role === 'SupportAgent' && this.ticket.assignedToUserId === currentUser.id) return true;

    return false;
  }

  toggleMenu(ticket: Ticket & { showMenu?: boolean }): void {
    ticket.showMenu = !ticket.showMenu;
  }

  deleteTicket(): void {
    if (!this.ticket) return;
    if (!confirm('Czy na pewno chcesz usunąć to zgłoszenie?')) return;

    this.apiService.deleteTicket(this.ticket.id).subscribe({
      next: () => {
        alert('Zgłoszenie usunięte');
        this.back();
      },
      error: (err) => {
        alert('Wystąpił błąd podczas usuwania zgłoszenia'); 
        console.error('Error during ticket deletion:', err); 
      }
    });
  }

  openChatOnDashboard() {
    if (this.ticket && this.ticket.id) {
      this.router.navigate(['/home'], {
        queryParams: { openTicket: this.ticket.id }
      });
    } else {
      console.error('Error: Attempted to open chat, but this.ticket is:', this.ticket);
    }
  }

  back() {
    if (this.fromMyTickets) {
      this.router.navigate(['/my-tickets']);
    } else{
      this.router.navigate(['/tickets-panel']);
    }
  }

  isAdmin(): boolean { return this.loggedInUser?.userType === 'Admin'; }

  statusTranslations: any = {
  'New': 'Nowe',
  'InProgress': 'W trakcie',
  'Closed': 'Zamknięte'
};

get canSeeChat(): boolean {
  if (!this.ticket) return false;

  const currentUser = this.apiService.getCurrentUser();
  if (!currentUser) return false;

  const userId = Number(currentUser.id);
  const userType = currentUser.userType;

  if (userType === 'Admin') return true;

  const isOwner = this.ticket.userId === userId;

  const isAssigned = this.ticket.assignedToUserId === userId;

  return isOwner || isAssigned;
}

}
