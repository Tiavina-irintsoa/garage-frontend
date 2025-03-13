import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  return authService.currentUser$.pipe(
    map((user) => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }

      // Vérification optionnelle des rôles si nécessaire
      const requiredRole = route.data['role'];
      if (requiredRole && user.role !== requiredRole) {
        router.navigate(['/']); // Rediriger vers la page d'accueil si le rôle ne correspond pas
        return false;
      }

      return true;
    })
  );
};
