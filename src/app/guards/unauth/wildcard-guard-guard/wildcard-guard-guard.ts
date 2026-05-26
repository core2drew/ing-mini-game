import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth/auth.service';
import { map } from 'rxjs';

export const wildcardGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getAuthState().pipe(
    map((user) => {
      if (!user) {
        console.log(user);
        router.navigate(['/join']);

        return false;
      }
      router.navigate(['/']);
      return true;
    }),
  );
};
