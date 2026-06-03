import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private pollingSubscription?: Subscription;

  constructor(private http: HttpClient) { }

  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getMyNotifications() {
    this.http.get<Notification[]>('/api/notifications/my', this.getAuthHeaders())
      .subscribe({
        next: (n) => {
          this.notificationsSubject.next(n);
        },
        error: (err) => console.error('Error fetching notifications:', err)
      });
  }


  clear() {
    this.notificationsSubject.next([]);
  }

  markAsRead(id: number) {
    return this.http.post(`/api/notifications/${id}/read`, {}, this.getAuthHeaders());
  }

  startPolling() {
    this.getMyNotifications();
    this.pollingSubscription = interval(30000).subscribe(() => {
      this.getMyNotifications();
    });
  }

  stopPolling() {
    this.pollingSubscription?.unsubscribe();
  }
}
