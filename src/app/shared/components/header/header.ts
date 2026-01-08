import { Component, signal } from '@angular/core';
import { AuthService } from '../../../features/auth/services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly TOKEN_KEY = 'auth_token';
  isAuthenticated = signal(false);
  userName = signal('Usuario');
  cartCount = signal(0);

  constructor(private authService: AuthService, private router: Router) {
    this.loadInitialState();
  }

  private loadInitialState(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const name = localStorage.getItem('userName');
    if (token) {
      this.isAuthenticated.set(true);
      this.userName.set(name || 'Usuario');
    }
  }

  /**
   * Maneja el clic en el carrito de préstamos
   * Aquí se navegaría a la vista del carrito o se abriría un panel lateral
   */
  onCartClick(): void {
    console.log('Navegar al carrito de préstamos');
    this.router.navigate(['/loans']);
  }

  onLogoClick(): void {
    this.router.navigate(['/books']);
  }

  /**
   * Maneja el cierre de sesión
   * Limpia el estado y redirige al home
   */
  onLogout(): void {
    console.log('Cerrar sesión');
    this.authService.logout();
  }

  /**
   * Método público para actualizar el contador del carrito
   * Puede ser llamado desde servicios externos
   */
  updateCartCount(count: number): void {
    this.cartCount.set(count);
  }

  /**
   * Método público para actualizar el estado de autenticación
   * Puede ser llamado desde servicios externos
   */
  updateAuthState(authenticated: boolean, name: string = ''): void {
    this.isAuthenticated.set(authenticated);
    this.userName.set(name);
  }

  getUserInitial(): string {
    const name = this.userName();
    if (!name) return 'U';

    const words = name.trim().split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}
