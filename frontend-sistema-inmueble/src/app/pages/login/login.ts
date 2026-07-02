import { Component, inject, signal, OnInit, NgZone } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

declare const google: any;

// Expresión regular para validar el FORMATO de un correo real.
// Exige: texto + @ + dominio + . + extensión (ej: nombre@gmail.com)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Client ID de Google OAuth. Obténlo en https://console.cloud.google.com
// (APIs y servicios → Credenciales → ID de cliente OAuth 2.0).
// Orígenes autorizados de JavaScript: http://localhost:4200
const GOOGLE_CLIENT_ID = '957495637126-gpvoqbqfb1lrs4pf5fieph8pturvorlf.apps.googleusercontent.com';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  errorMessage = signal<string>('');
  cargando = signal<boolean>(false);
  googleCargando = signal<boolean>(false);

  // Estado para la verificación de correo inline
  requiereVerificacion = signal<boolean>(false);
  emailPendiente = signal<string>('');

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  codigoForm = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  ngOnInit(): void {
    this.initGoogle();
  }

  // Inicializa Google Identity Services con nuestro callback
  private initGoogle(): void {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('TU_')) return;

    const esperarGoogle = () => {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          use_fedcm_for_prompt: true,
          callback: (resp: any) =>
            this.ngZone.run(() => this.procesarCredencialGoogle(resp.credential)),
        });
      } else {
        setTimeout(esperarGoogle, 300);
      }
    };
    esperarGoogle();
  }

  // Abre el popup de Google al hacer clic en el botón
  loginConGoogle(): void {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('TU_')) {
      this.errorMessage.set('Falta configurar el Client ID de Google en login.ts');
      return;
    }
    if (typeof google === 'undefined') {
      this.errorMessage.set('No se cargó el script de Google. Revisa tu conexión.');
      return;
    }
    this.googleCargando.set(true);
    this.errorMessage.set('');
    // Con FedCM, prompt() ya no usa los métodos de estado (isNotDisplayed, etc.)
    google.accounts.id.prompt();
    // Si el usuario cierra el diálogo sin elegir cuenta, reactivamos el botón.
    setTimeout(() => this.googleCargando.set(false), 4000);
  }

  // Envía el token de Google al backend (POST /auth/google)
  private procesarCredencialGoogle(credential: string): void {
    this.authService.googleLogin(credential).subscribe({
      next: (res) => {
        this.googleCargando.set(false);
        this.errorMessage.set('');
        this.redirigirSegunRol(res?.user);
      },
      error: (err) => {
        this.googleCargando.set(false);
        // Mostramos el mensaje exacto que devuelve el backend (ej: cuenta no registrada)
        this.errorMessage.set(
          err?.error?.message ?? 'No se pudo iniciar sesión con Google.',
        );
      },
    });
  }

  // Helpers para mostrar errores de cada campo en el HTML
  get emailInvalido(): boolean {
    const c = this.loginForm.get('email');
    return !!(c?.invalid && c?.touched);
  }

  get emailVacio(): boolean {
    return !!this.loginForm.get('email')?.hasError('required');
  }

  get passwordInvalido(): boolean {
    const c = this.loginForm.get('password');
    return !!(c?.invalid && c?.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.errorMessage.set('');
        this.redirigirSegunRol(res?.user);
      },
      error: (err) => {
        this.cargando.set(false);
        // Correo registrado pero sin verificar → mostramos el paso de verificación
        if (err?.error?.message === 'EMAIL_NO_VERIFICADO') {
          this.emailPendiente.set(email!);
          this.requiereVerificacion.set(true);
          this.errorMessage.set('Debes verificar tu correo antes de entrar. Revisa tu bandeja de entrada.');
          this.authService.resendVerification(email!).subscribe();
          return;
        }
        if (err.status === 401 || err.status === 404) {
          this.errorMessage.set('Correo o contraseña incorrectos.');
        } else if (err.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor. Intenta más tarde.');
        } else {
          this.errorMessage.set('Ocurrió un error al iniciar sesión.');
        }
      },
    });
  }

  // ── Verificación de correo inline (cuando el login detecta EMAIL_NO_VERIFICADO) ──
  verificarCodigo(): void {
    if (this.codigoForm.invalid) {
      this.codigoForm.markAllAsTouched();
      return;
    }
    this.cargando.set(true);
    this.errorMessage.set('');
    this.authService.verifyEmail(this.emailPendiente(), this.codigoForm.value.codigo!).subscribe({
      next: () => {
        this.cargando.set(false);
        this.requiereVerificacion.set(false);
        this.codigoForm.reset();
        this.errorMessage.set('');
        // Reintentamos el login automáticamente con las credenciales ya ingresadas
        this.onSubmit();
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Código inválido o expirado.');
      },
    });
  }

  reenviarCodigo(): void {
    this.authService.resendVerification(this.emailPendiente()).subscribe({
      next: (res) => this.errorMessage.set(res?.message ?? 'Te enviamos un nuevo código.'),
    });
  }

  // Redirige a cada actor a su panel correspondiente
  private redirigirSegunRol(user: any): void {
    if (!user) {
      this.router.navigate(['/']);
      return;
    }
    switch (user.rol) {
      case 'SUPER_ADMIN':
      case 'ADMIN_EMPRESA':
        this.router.navigate(['/dashboards']);
        break;
      case 'CORREDOR':
        this.router.navigate(['/corredor']);
        break;
      default:
        // cliente
        this.router.navigate(['/propiedades']);
    }
  }
}
