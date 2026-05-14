import { Component, Input, Output, OnInit, EventEmitter, OnChanges, SimpleChanges, } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, User } from '../services/api.service';

@Component({
  selector: 'app-enter-new-user',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './enter-new-user.component.html',
  styleUrls: ['./enter-new-user.component.css']
})
export class EnterNewUserComponent implements OnInit, OnChanges {
  @Input() user?: User;
  @Output() userSaved = new EventEmitter<void>();



  firstName: string = '';
  lastName: string = '';
  username: string = '';
  password: string = '';
  userType: 'Employee' | 'SupportAgent' | 'Admin' = 'Employee';
  successMessage: string = '';
  errorMessage: string = '';


  constructor(private apiService: ApiService, private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.loadUserData(); 
    }
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    if (this.user) {
      this.username = this.user.username;
      this.firstName = this.user.firstName;
      this.lastName = this.user.lastName;
      this.userType = this.user.userType;
      this.password = ''; 
      this.successMessage = '';
    }
  }

  saveUser(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage = 'Wszystkie pola są wymagane';
      return;
    }

    const userToSave: User = {
      id: this.user?.id ?? 0, 
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      password: this.password || "",
      userType: this.userType
    };

    if (this.user) {
      this.apiService.updateUser(userToSave).subscribe({
        next: () => {
          this.successMessage = `Zaktualizowano użytkownika: ${this.username}`;
          this.userSaved.emit();
          this.errorMessage = '';
          this.password = ''; 
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Błąd aktualizacji użytkownika';
        }
      });
    } else {
      this.apiService.addUser(userToSave).subscribe({
        next: (added) => {
          this.successMessage = `Dodano użytkownika: ${added.username}`;
          this.errorMessage = '';
          this.resetForm(form);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Błąd dodawania użytkownika';
        }
      });
    }
  }

  @Input() onCancel?: () => void;

  cancel(): void {
    if (this.onCancel) {
      this.onCancel(); 
    } else {
      this.router.navigate(['/users']);
    }
  }


  private resetForm(form: NgForm) {
    this.firstName = '';
    this.lastName = '';
    this.username = '';
    this.password = '';
    this.userType = 'Employee';

    form.resetForm({
      userType: 'Employee'
    });
  }


}
