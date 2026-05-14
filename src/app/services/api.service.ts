import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  password?: string;
  role?: number;
  userType: 'Employee' | 'SupportAgent' | 'Admin';
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  userId?: number;
  user?: User;
  status: 'New' | 'InProgress' | 'Closed';
  createdAt?: string
  updatedAt?: string;
  assignedToUserId?: number | null;  
  assignedToUser?: User | null;
  hasUnreadMessages?: boolean;

}

interface UpdateUserPayload {
  Id: number;
  FirstName: string;
  LastName: string;
  Username: string;
  Role: number;
  Password?: string;
}



@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = '/api/User';
  private apiTicketUrl = '/api/Ticket';
  private apiAuth = '/Auth/login';

  constructor(private http: HttpClient) { }

  getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map(users => users.map(u => ({
        ...u,
        userType: this.mapRoleFromBackend(u.role ?? 0)
      })))
    );
  }


  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiTicketUrl}/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(ticket => ({
        ...ticket,
        assignedToUserId: ticket.assignedToUserId ?? null,
        assignedToUser: ticket.assignedToUser ?? null,
        status: this.mapTicketStatusFromBackend(ticket.status),
      }))
    );
  }


getTickets(onlyMine: boolean = false): Observable<Ticket[]> {
  const params = new HttpParams().set('onlyMine', onlyMine.toString());

  return this.http.get<Ticket[]>(this.apiTicketUrl, { 
    headers: this.getAuthHeaders(),
    params: params
  }).pipe(
    map(tickets => tickets.map(t => ({
      ...t,
      status: this.mapTicketStatusFromBackend(t.status),
    })))
  );
}

  addUser(user: User): Observable<User> {
    const userToSend = { ...user, role: this.mapUserRoleToBackend(user.userType) };
    return this.http.post<User>(this.apiUrl, userToSend, { headers: this.getAuthHeaders() });
  }

  addTicket(ticket: Ticket): Observable<Ticket> {
    const userId = Number(localStorage.getItem('userId'));

    const statusNumber = ticket.status ? this.mapTicketStatusToBackend(ticket.status) : 0;

    const ticketToSend = {
      ...ticket,
      userId,
      status: statusNumber
    };

    return this.http.post<Ticket>(this.apiTicketUrl, ticketToSend, {
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' }
    });
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(this.apiAuth, credentials, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  private mapUserRoleToBackend(userType: 'Employee' | 'SupportAgent' | 'Admin'): number {
    switch (userType) {
      case 'Employee': return 0;
      case 'SupportAgent': return 1;
      case 'Admin': return 2;
      default: return 0;
    }
  }

  private mapRoleFromBackend(role: number): 'Employee' | 'SupportAgent' | 'Admin' {
    switch (role) {
      case 0: return 'Employee';
      case 1: return 'SupportAgent';
      case 2: return 'Admin';
      default: return 'Employee';
    }
  }

  public mapTicketStatusToBackend(status: 'New' | "InProgress" | "Closed"): number {
    switch (status) {
      case 'New': return 0;
      case 'InProgress': return 1;
      case 'Closed': return 2;
      default: return 0;
    }
  }

  public mapTicketStatusFromBackend(status?: any): 'New' | 'InProgress' | 'Closed' {
    switch (status) {
      case 0:
      case 'New':
        return 'New';
      case 1:
      case 'InProgress':
        return 'InProgress';
      case 2:
      case 'Closed':
        return 'Closed';
      default:
        return 'New';
    }
  }

  getSupportAgents(): Observable<User[]> {
    return this.getUsers().pipe(
      map(users => users.filter(u => u.userType === 'SupportAgent'))
    );
  }

  assignSupportAgent(ticketId: number, assignedTo: number | null): Observable<Ticket> {
    return this.http.patch<Ticket>(
      `${this.apiTicketUrl}/${ticketId}/assign`,
      { AssignedToUserId: assignedTo },
      { headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' } }
    ).pipe(
      map(ticket => ({
        ...ticket,
        status: this.mapTicketStatusFromBackend(ticket.status),
      }))
    );
  }

  updateTicketStatus(ticketId: number, status: 'New' | 'InProgress' | 'Closed'): Observable<Ticket> {
    const statusToBackend = this.mapTicketStatusToBackend(status);

    return this.http.patch<Ticket>(
      `${this.apiTicketUrl}/${ticketId}/status`,
      { status: statusToBackend },
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(ticket => ({
        ...ticket,
        status: this.mapTicketStatusFromBackend(ticket.status)
      }))
    );
  }

  updateUser(user: User){
    const userPayload: UpdateUserPayload = {
      Id: Number(user.id),
      FirstName: user.firstName,
      LastName: user.lastName,
      Username: user.username,
      Role: this.mapUserRoleToBackend(user.userType)
    };

    if (user.password && user.password.trim().length > 0) {
      userPayload.Password = user.password;
    }

    return this.http.put(`${this.apiUrl}/${user.id}`, userPayload, {
      headers: this.getAuthHeaders()
    });
  }


  deleteUser(userId: number) {
    return this.http.delete(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() });
  }

  deleteTicket(id: number) {
    return this.http.delete(`${this.apiTicketUrl}/${id}`, { headers: this.getAuthHeaders() });
  }


  getTicketsByUser(userId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiTicketUrl}/user/${userId}`, { headers: this.getAuthHeaders() }).pipe(
      map(tickets => tickets.map(t => ({
        ...t,
        status: this.mapTicketStatusFromBackend(t.status),
      })))
    );
  }

}
