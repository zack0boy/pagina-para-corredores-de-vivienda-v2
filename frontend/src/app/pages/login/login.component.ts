import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loginError: string | null = null;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onLogin() {
    this.loginError = null;

    if (this.loginForm.invalid) {
      this.loginError = 'Completa todos los campos correctamente';
      return;
    }

    this.isLoading = true;
    
    // Deshabilitar los controles de forma reactiva
    this.loginForm.get('email')?.disable();
    this.loginForm.get('password')?.disable();

    const { email, password } = this.loginForm.getRawValue();

    console.log('[LOGIN] Intentando login con email:', email);

    this.authService.login(email, password)
      .subscribe({
        next: (response) => {
          console.log('[LOGIN] Respuesta del servidor:', response);

          if (!response.token) {
            console.error('[LOGIN] El servidor no devolvió un token');
            this.loginError = 'Error: el servidor no devolvió un token válido';
            this.isLoading = false;
            this.loginForm.get('email')?.enable();
            this.loginForm.get('password')?.enable();
            return;
          }

          localStorage.setItem('token', response.token);
          console.log('[LOGIN] Token guardado en localStorage');

          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('[LOGIN] Usuario guardado en localStorage:', response.user);

          // Validar que se guardó correctamente
          const savedToken = localStorage.getItem('token');
          const savedUser = localStorage.getItem('user');
          console.log('[LOGIN] Token recuperado:', savedToken ? 'OK (existe)' : 'ERROR (no existe)');
          console.log('[LOGIN] Usuario recuperado:', savedUser ? 'OK (existe)' : 'ERROR (no existe)');

          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },

        error: (err) => {
          console.error('[LOGIN] Error:', err);
          this.isLoading = false;

          // Re-habilitar los controles en caso de error
          this.loginForm.get('email')?.enable();
          this.loginForm.get('password')?.enable();

          if (err.status === 401) {
            this.loginError = 'Email o contraseña incorrectos';
          } else if (err.status === 0) {
            this.loginError = 'No se puede conectar al servidor';
          } else {
            this.loginError = err.error?.message || 'Error al iniciar sesión';
          }
        }
      });
  }
}