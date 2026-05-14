import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { ApiService, Ticket } from '../services/api.service';

@Component({
  selector: 'app-form-add-ticket',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './form-add-ticket.component.html',
  styleUrls: ['./form-add-ticket.component.css']
})
export class FormAddTicketComponent {
  title: string = '';
  description: string = '';
  status: 'New' | 'InProgress' | 'Closed' = 'New';
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router) { }

  addTicket(form: NgForm): void {
    if (form.invalid) return;

    const newTicket: Ticket = {
      id: 0,
      title: this.title,
      description: this.description,
      status: 'New'
    };

    this.apiService.addTicket({
      ...newTicket,
      status: this.status
    }).subscribe({
      next: (ticket: Ticket) => {
        this.successMessage = `Dodano zgłoszenie: ${ticket.title}`;
        this.errorMessage = '';

        this.resetForm(form);

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1500);

      },
      error: (err: any) => {
        console.error('Error adding ticket:', err);
        this.errorMessage = 'Wystąpił błąd podczas dodawania zgłoszenia';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/home']);
  }

  private resetForm(form: NgForm) {
    this.title = '';
    this.description = '';
    this.status = 'New';

    form.resetForm({
      title: '', 
      description: '',
      status: 'New'
    });
  }
}
