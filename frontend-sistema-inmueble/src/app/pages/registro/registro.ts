import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

// ID de la empresa activa en este portal (en el futuro vendría del subdominio/URL)
const EMPRESA_ID = '00000000-0000-0000-0000-000000000001';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const passwordMatchValidator = (formGroup: FormGroup) => {
  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Paso actual del flujo: formulario de datos o verificación por código
  paso = signal<'registro' | 'verificar'>('registro');

  registerForm: FormGroup = this.fb.group(
    {
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
      telefono: ['', [Validators.required, Validators.minLength(8)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  // Formulario del código de verificación
  codigoForm: FormGroup = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  emailRegistrado = signal<string>('');

  mensaje = signal<string>('');
  tipoMensaje = signal<'exito' | 'error' | ''>('');
  cargando = signal<boolean>(false);

  // ── PASO 1: crear la cuenta ──────────────────────────────────
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');
    this.tipoMensaje.set('');

    const { nombre, apellido, email, telefono, password } = this.registerForm.value;

    this.authService
      .register({ nombre, apellido, email, telefono, password, empresa_id: EMPRESA_ID })
      .subscribe({
        next: () => {
          this.cargando.set(false);
          this.emailRegistrado.set(email);
          this.mensaje.set('');
          this.paso.set('verificar');
        },
        error: (err) => {
          this.cargando.set(false);
          this.tipoMensaje.set('error');
          if (err.status === 409) {
            this.mensaje.set('❌ El email ya está registrado');
          } else if (err.error?.message) {
            this.mensaje.set(`❌ ${err.error.message}`);
          } else {
            this.mensaje.set('❌ Error al crear la cuenta. Intenta nuevamente.');
          }
        },
      });
  }

  // ── PASO 2: verificar el código ──────────────────────────────
  verificar() {
    if (this.codigoForm.invalid) {
      this.codigoForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');
    this.tipoMensaje.set('');

    this.authService.verifyEmail(this.emailRegistrado(), this.codigoForm.value.codigo).subscribe({
      next: () => {
        this.cargando.set(false);
        this.tipoMensaje.set('exito');
        this.mensaje.set('✓ Correo verificado. Redirigiendo al inicio de sesión...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.cargando.set(false);
        this.tipoMensaje.set('error');
        this.mensaje.set(err.error?.message ?? '❌ Código inválido o expirado.');
      },
    });
  }

  // Reenviar el código
  reenviar() {
    this.cargando.set(true);
    this.authService.resendVerification(this.emailRegistrado()).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.tipoMensaje.set('exito');
        this.mensaje.set(res?.message ?? 'Te enviamos un nuevo código.');
      },
      error: () => {
        this.cargando.set(false);
        this.tipoMensaje.set('error');
        this.mensaje.set('No se pudo reenviar el código.');
      },
    });
  }
}
