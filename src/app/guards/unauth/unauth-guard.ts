import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { map } from 'rxjs';

export const unauthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getAuthState().pipe(
    map((user) => {
      if (user) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    }),
  );
};
