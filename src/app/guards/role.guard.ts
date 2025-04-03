import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as Array<string>;

  return authService.currentUser$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }

      if (!requiredRoles?.length) {
        return true;
      }

      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) {
        router.navigate(['/BO/dashboard']);
        return false;
      }

      return true;
    })
  );
};
