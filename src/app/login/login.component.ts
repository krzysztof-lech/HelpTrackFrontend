import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, User } from '../services/api.service';
import { NotificationService, Notification } from '../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router, private notificationService: NotificationService) { }

  isLoading = false;

  login() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.login({ username: this.username, password: this.password }).subscribe({
      next: (res: any) => {
        let userType: 'Employee' | 'SupportAgent' | 'Admin';
        switch (res.role) {
          case 0: userType = 'Employee'; break;
          case 1: userType = 'SupportAgent'; break;
          case 2: userType = 'Admin'; break;
          default: userType = 'Employee';
        }

        const currentUser: User = {
          id: res.userId,
          firstName: '', 
          lastName: '',
          username: this.username,
          userType,
          password: '' 
        };

        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.userId.toString());
        localStorage.setItem('firstName', res.firstName);

        this.notificationService.getMyNotifications();

        this.router.navigate(['/home']);
      },
      
      error: (err: any) => {
        console.error('Login error:', err); 
        this.errorMessage = 'Błąd logowania. Sprawdź dane.'; 
        this.isLoading = false;

}
    });
  }
}
