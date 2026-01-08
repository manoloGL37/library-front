import { Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoading: boolean = false;
  isLoginMode: boolean = true; // true = login, false = registro
  returnUrl: string = '/books'; // valor por defecto

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private zone: NgZone,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.route.queryParams.subscribe((params) => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;

    const { username, password } = this.loginForm.value;

    this.authService
      .login(username, password)
      .pipe(
        catchError((err) => {
          const msg = err?.error?.message ?? err?.message ?? 'Error al iniciar sesión';
          this.toastr.error(msg, 'Login failed');
          this.isLoading = false;
          return of(null);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe((token) => {
        if (token) {
          this.toastr.success('Login successful', 'Welcome!');
          this.router.navigate(['/books']);
        }
      });
  }

  onRegister() {
    if (this.registerForm.invalid) return;

    this.zone.run(() => (this.isLoading = true));

    const { username, password, name, surname, email, dni } = this.registerForm.value;

    this.authService
      .register(username, password, name, surname, email, dni)
      .pipe(
        catchError((err) => {
          this.zone.run(() => (this.isLoading = false));
          const msg =
            (typeof err?.error === 'string' && err.error) ||
            err?.error?.message ||
            err?.message ||
            'Error en el registro';
          this.toastr.error(msg, 'Error en el registro');
          return of(null);
        }),
        finalize(() => this.zone.run(() => (this.isLoading = false)))
      )
      .subscribe((result) => {
        if (result) {
          this.toastr.success('Registro exitoso', '¡Cuenta creada!');
          // Opción 1: Redirigir directamente a books si el registro hace login automático
          //this.router.navigate(['/books']);

          // Opción 2: Cambiar a modo login para que inicie sesión manualmente
          this.isLoginMode = true;
          this.registerForm.reset();
        }
      });
  }
}
