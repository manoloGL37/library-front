import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth/auth';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  // Injectamos los servicios que necesitamos
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  // Comprobamos si el usuario está logueado y el token no ha expirado
  if (authService.isLoggedIn()) {
    return true; // dejamos pasar
  } else {
    // No está logueado → redirigimos a login
    toastr.error('Necesitas iniciar sesión para acceder', 'Acceso denegado');
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
