import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService, User, Ticket } from '../services/api.service';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.css']
})
export class MyTicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  loggedInUser: User | null = null;

  currentTab: 'active' | 'archive' = 'active';

  constructor(private apiService: ApiService, private router: Router) { }

  get filteredTickets(): Ticket[] {
    if (!this.loggedInUser) return [];

    let myTickets: Ticket[];

    if (this.loggedInUser.userType === 'Employee' ||
      this.loggedInUser.userType === 'Admin') {
      myTickets = this.tickets.filter(t => t.userId === this.loggedInUser!.id);
    } else if (this.loggedInUser.userType === 'SupportAgent') {
      myTickets = this.tickets.filter(t => t.assignedToUserId === this.loggedInUser!.id);
    } else {
      myTickets = [];
    }

    if (this.currentTab === 'active') {
      return myTickets.filter(t => t.status !== 'Closed');
    } else {
      return myTickets.filter(t => t.status === 'Closed');
    }
  }


  ngOnInit(): void {
    this.apiService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
      },
      error: (err) => console.error('Error fetching tickets:', err)
    });

    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.loggedInUser = JSON.parse(userJson);
    } else {
      console.warn('No logged in user found in localStorage');
    }
  }

  statusTranslations: any = {
  'New': 'Nowe',
  'InProgress': 'W trakcie',
  'Closed': 'Zamknięte'
};

}

