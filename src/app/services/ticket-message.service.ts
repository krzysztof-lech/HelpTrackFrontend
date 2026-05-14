import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TicketMessage {
  id: number;
  message: string;
  senderName: string;
  senderId: number;
  sentAt: Date;
  isFromSupport: boolean;
  isRead: boolean;
  ticketId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketMessageService {
  private apiUrl = '/api/TicketMessages';

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  getMessagesByTicket(ticketId: number): Observable<TicketMessage[]> {
    return this.http.get<TicketMessage[]>(`${this.apiUrl}/ticket/${ticketId}`, {
      headers: this.getAuthHeaders()
    });
  }

  sendMessage(ticketId: number, content: string): Observable<TicketMessage> {
  const payload = {
    ticketId: ticketId,
    message: content 
  };

  return this.http.post<TicketMessage>(this.apiUrl, payload, {
    headers: this.getAuthHeaders()
  });
}

  markAsRead(ticketId: number, userId: number) {
    return this.http.patch(`${this.apiUrl}/ticket/${ticketId}/mark-read`,
      { UserId: userId },
      { headers: this.getAuthHeaders() }
    );
  }
}
