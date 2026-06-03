import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { NotificationService, Notification } from './services/notification.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'HelpTrackFrontend';
  notifications: Notification[] = [];

  showNotifications = false;
  showUserMenu = false;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.notificationService.notifications$.subscribe(n => {
      this.notifications = n;
    });

    if (this.isLoggedIn()) {
      this.notificationService.startPolling();
    }
  }
  get unreadCount() {
    return this.notifications.filter(n => !n.isRead).length;
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return token != null && token.length > 0;
  }

  getLogoLink(): string {
    return this.isLoggedIn() ? '/home' : '/login';
  }

  get userFirstName(): string {
    return localStorage.getItem('firstName') || 'Użytkownik';
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;

    if (this.showNotifications) {
      const unread = this.notifications.filter(n => !n.isRead);
      unread.forEach(n => {
        this.notificationService.markAsRead(n.id).subscribe({
          next: () => n.isRead = true
        });
      });
    }
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  logout() {
    Swal.fire({
      title: 'Czy na pewno chcesz się wylogować?',
      showCancelButton: true,
      confirmButtonText: 'Wyloguj się',
      cancelButtonText: 'Anuluj',
      icon: 'warning'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        this.notificationService.clear();
        this.notificationService.stopPolling();
        this.showUserMenu = false;
        this.showNotifications = false;
        this.router.navigate(['/login']);
      }
    });
  }

  @HostListener('document:click')
  closeMenus() {
    this.showNotifications = false;
    this.showUserMenu = false;
  }
}
