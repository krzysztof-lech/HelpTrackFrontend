import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService, User } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { EnterNewUserComponent } from '../enter-new-user/enter-new-user.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, FormsModule, EnterNewUserComponent],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  @ViewChild('editFormContainer') editFormContainer?: ElementRef;
  users: User[] = [];
  loggedInUser: User | null = null;
  selectedRole: 'all' | 'Employee' | 'SupportAgent' | 'Admin' = 'all';
  selectedUser?: User;
  isLoading = false;

  

  constructor(private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.isLoading = true;

    this.apiService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading = false;
      }
    });

    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.loggedInUser = JSON.parse(userJson);
    } else {
      console.warn('No logged in user found in localStorage');
    }
  }

  enterNewUser() {
    if (this.loggedInUser?.userType === 'Admin') {
      this.router.navigate(['/enter-new-user']);
    } else {
      console.warn('Access denied: Admin role required');
    }
  }

  editUser(user: User): void {
    this.selectedUser = undefined;

    setTimeout(() => {
      this.selectedUser = user;

      setTimeout(() => {
        this.editFormContainer?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }, 0);
  }

  isAdmin(): boolean {
    return this.loggedInUser?.userType === 'Admin';
  }

  searchTerm: string = '';

  get filteredUsers(): User[] {
    let filtered = this.users;

    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(u => u.userType === this.selectedRole);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(term) ||
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  deleteUser(user: User) {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${user.username}?`)) {
      return;
    }

    this.apiService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);

        if (this.selectedUser?.id === user.id) {
          this.selectedUser = undefined;
        }
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        alert('Nie udało się usunąć użytkownika');
      }
    });
  }

  closeEditForm() {
    this.selectedUser = undefined;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onUserSaved(): void {
    
      this.loadUsers();
 
  }

  loadUsers(): void {
    this.apiService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  roleTranslations: any = {
  'Employee': 'Pracownik',
  'SupportAgent': 'Serwisant',
  'Admin': 'Administrator'
};






}
