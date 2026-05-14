import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userJson = localStorage.getItem('currentUser');

  if (userJson) {
    const user = JSON.parse(userJson);

    if (user.userType === 'Admin') {
      return true; 
    }
  }

  console.warn('Access denied: Admin privileges required');
  router.navigate(['/home']); 
  return false;
};
