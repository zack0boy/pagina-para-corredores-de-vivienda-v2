import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const passwordMatchValidator = (formGroup: FormGroup) => {
  const password = formGroup.get('newPassword')?.value;
  const confirm = formGroup.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-recuperacionpassword',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperacionpassword.html',
  styleUrl: './recuperacionpassword.css',
})
export class Recuperacionpassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Paso actual: pedir correo o ingresar código + nueva contraseña
  paso = signal<'email' | 'reset'>('email');
  emailEnviado = signal<string>('');

  cargando = signal<boolean>(false);
  mensaje = signal<string>('');
  tipoMensaje = signal<'exito' | 'error' | ''>('');

  emailForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
  });

  resetForm: FormGroup = this.fb.group(
    {
      codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  // ── PASO 1: enviar código al correo ──────────────────────────
  enviarCodigo() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');
    this.tipoMensaje.set('');

    const email = this.emailForm.value.email;
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.cargando.set(false);
        this.emailEnviado.set(email);
        this.tipoMensaje.set('exito');
        this.mensaje.set('✓ Si el correo existe, te enviamos un código de 6 dígitos.');
        this.paso.set('reset');
      },
      error: () => {
        this.cargando.set(false);
        this.tipoMensaje.set('error');
        this.mensaje.set('❌ No se pudo enviar el código. Intenta más tarde.');
      },
    });
  }

  // ── PASO 2: validar código y cambiar contraseña ──────────────
  cambiarPassword() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    this.mensaje.set('');
    this.tipoMensaje.set('');

    const { codigo, newPassword } = this.resetForm.value;
    this.authService.resetPassword(this.emailEnviado(), codigo, newPassword).subscribe({
      next: () => {
        this.cargando.set(false);
        this.tipoMensaje.set('exito');
        this.mensaje.set('✓ Contraseña actualizada. Redirigiendo al login...');
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
    this.authService.forgotPassword(this.emailEnviado()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.tipoMensaje.set('exito');
        this.mensaje.set('Te enviamos un nuevo código a tu correo.');
      },
      error: () => {
        this.cargando.set(false);
        this.tipoMensaje.set('error');
        this.mensaje.set('No se pudo reenviar el código.');
      },
    });
  }
}
