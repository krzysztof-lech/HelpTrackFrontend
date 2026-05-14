import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, User, Ticket } from '../services/api.service';
import { TicketMessageService, TicketMessage } from '../services/ticket-message.service';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  loggedInUser: User | null = null;

  userTickets: Ticket[] = [];
  activeMessages: TicketMessage[] = [];
  selectedTicketId: number | null = null;
  selectedTicketTitle: string = '';
  newMessageText: string = '';

  constructor(private apiService: ApiService, private router: Router, private route: ActivatedRoute, private messageService: TicketMessageService) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.loggedInUser = JSON.parse(userJson);

      this.route.queryParams.subscribe(params => {

        if (params['openTicket'] && this.userTickets.length > 0) {
          this.handleUrlTicket(Number(params['openTicket']));
        }
      });

      const ticketsRequest = this.isStaff()
        ? this.apiService.getTickets(true)
        : this.apiService.getTicketsByUser(this.loggedInUser!.id);


      ticketsRequest.subscribe({
        next: (tickets) => {
          this.userTickets = tickets.sort((a, b) => {
            if (a.hasUnreadMessages && !b.hasUnreadMessages) return -1;
            if (!a.hasUnreadMessages && b.hasUnreadMessages) return 1;

            const dateA = new Date(a.updatedAt || a.createdAt || new Date()).getTime();
            const dateB = new Date(b.updatedAt || b.createdAt || new Date()).getTime();

            return dateB - dateA; 
          });

          const openTicketId = this.route.snapshot.queryParams['openTicket'];
          const savedTicketId = localStorage.getItem('openChatTicketId');

          if (openTicketId) {
            this.handleUrlTicket(Number(openTicketId));
          }
          else {
            const ticketWithNewMessage = this.userTickets.find(t => t.hasUnreadMessages);

            if (ticketWithNewMessage) {
              this.selectTicket(ticketWithNewMessage.id);
            }
            else if (savedTicketId) {
              this.handleUrlTicket(Number(savedTicketId));
            }
          }
        },
        error: (err) => console.error('API Error:', err)
      });
    }

    setInterval(() => {
      this.refreshDataAndCheckUnread();
    }, 10000);
  }

  refreshDataAndCheckUnread() {
    const user = this.loggedInUser as any;
    if (!user || !user.userType || user.userType === "" || user.userType === "None") {
      return;
    }

    const ticketsRequest = this.isStaff()
      ? this.apiService.getTickets(true)
      : this.apiService.getTicketsByUser(user.id);

    ticketsRequest.subscribe(tickets => {
      this.userTickets = tickets.sort((a, b) => {
      if (a.hasUnreadMessages && !b.hasUnreadMessages) return -1;
      if (!a.hasUnreadMessages && b.hasUnreadMessages) return 1;
      
      const dateA = new Date(a.updatedAt || a.createdAt || new Date()).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || new Date()).getTime();
      return dateB - dateA;
    });

      if (!this.selectedTicketId) {
        const ticketWithNewMessage = this.userTickets.find(t => t.hasUnreadMessages);
        if (ticketWithNewMessage) {
          this.selectTicket(ticketWithNewMessage.id);
        }
      }
      else {
        const activeTicketOnList = this.userTickets.find(t => t.id === this.selectedTicketId);

        if (activeTicketOnList && activeTicketOnList.hasUnreadMessages) {

          this.messageService.getMessagesByTicket(this.selectedTicketId).subscribe(messages => {
            this.activeMessages = messages;

            setTimeout(() => {
              const chatWindow = document.querySelector('.chat-messages');
              if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
            }, 100);
          });
        }
      }
    });
  }

  private handleUrlTicket(id: number) {
    const ticketOnList = this.userTickets.find(t => t.id === id);

    if (ticketOnList) {
      this.selectTicket(id);
    } else {
      console.warn('Ticket not on list, fetching from API...');
      this.apiService.getTicket(id).subscribe({
        next: (fetchedTicket) => {
          this.userTickets.push(fetchedTicket);
          this.selectTicket(id);
        },
        error: (err) => {
          console.error('Error fetching ticket:', err);
          this.selectedTicketId = null;
        }
      });
    }
  }

  refreshData() {
    if (!this.loggedInUser) return;

    const ticketsRequest = this.isStaff()
      ? this.apiService.getTickets(true)
      : this.apiService.getTicketsByUser(this.loggedInUser.id);

    ticketsRequest.subscribe(tickets => {
      this.userTickets = tickets.sort((a, b) => {
        if (a.hasUnreadMessages && !b.hasUnreadMessages) return -1;
        if (!a.hasUnreadMessages && b.hasUnreadMessages) return 1;

        const dateA = new Date(a.updatedAt || a.createdAt || new Date()).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || new Date()).getTime();

        return dateB - dateA;
      });
    });
  }

  selectTicket(ticketId: number) {
    this.selectedTicketId = ticketId;
    localStorage.setItem('openChatTicketId', ticketId.toString());

    const ticket = this.userTickets.find(t => t.id === ticketId);

    if (ticket) {
      this.selectedTicketTitle = ticket.title;


      if (ticket.hasUnreadMessages) {
        ticket.hasUnreadMessages = false;
        this.messageService.markAsRead(ticketId, this.loggedInUser!.id).subscribe();
      }


      this.messageService.getMessagesByTicket(ticketId).subscribe({
        next: (messages) => {
          this.activeMessages = messages;

          setTimeout(() => {
            const chatWindow = document.querySelector('.chat-messages');
            if (chatWindow) {
              chatWindow.scrollTop = chatWindow.scrollHeight;
            }
          }, 100);
        },
        error: (err) => console.error('Error fetching messages:', err)
      });
    }

    this.newMessageText = '';
  }

  sendMessage() {

    if (!this.newMessageText.trim() || !this.selectedTicketId || !this.loggedInUser) {
      console.warn('Validation failed!');
      return;
    }

    this.messageService.sendMessage(
      this.selectedTicketId,
      this.newMessageText
    ).subscribe({
      next: (newMsg) => {
        this.activeMessages.push(newMsg);
        this.newMessageText = '';

        this.refreshData();

        setTimeout(() => {
          const chatWindow = document.querySelector('.chat-messages');
          if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 50);
      },
      error: (err) => console.error('Error sending message:', err)
    });
  }

  closeChat() {
    this.selectedTicketId = null;
    this.selectedTicketTitle = '';
    this.activeMessages = [];

    localStorage.removeItem('openChatTicketId');
  }

  isStaff(): boolean {
    const user = this.apiService.getCurrentUser();
    return user?.userType === 'SupportAgent' || user?.userType === 'Admin';
  }

  goToUsers() { this.router.navigate(['/users']); }
  goToFormAddTicket() { this.router.navigate(['/new-ticket']); }
  goToMyTickets() { this.router.navigate(['/my-tickets']); }
  goToTicketsPanel() { this.router.navigate(['/tickets-panel']); }
  isAdmin(): boolean { return this.loggedInUser?.userType === 'Admin'; }

  statusTranslations: any = {
    'New': 'Nowe',
    'InProgress': 'W trakcie',
    'Closed': 'Zamknięte'
  };


}
