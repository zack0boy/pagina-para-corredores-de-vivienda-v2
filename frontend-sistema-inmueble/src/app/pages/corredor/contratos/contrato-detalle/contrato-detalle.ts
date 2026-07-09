import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ContratosService } from '../../../../services/contratos';
import { CuotasService } from '../../../../services/cuotas';
import { AuthService } from '../../../../services/auth';

@Component({
  selector: 'app-contrato-detalle',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink],
  templateUrl: './contrato-detalle.html',
  styleUrl: './contrato-detalle.css',
})
export class ContratoDetalle implements OnInit {
  private service = inject(ContratosService);
  private cuotasService = inject(CuotasService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  user = this.authService.obtenerUsuarioActual();

  contrato = signal<any | null>(null);
  cuotas = signal<any[]>([]);
  cargando = signal<boolean>(true);
  procesando = signal<string>('');
  error = signal<string>('');
  toast = signal<string>('');

  esAdmin = computed(() => this.user?.rol === 'ADMIN_EMPRESA' || this.user?.rol === 'SUPER_ADMIN');
  puedeEditar = computed(() => this.contrato()?.estado === 'BORRADOR');
  puedeActivar = computed(() => this.esAdmin() && this.contrato()?.estado === 'BORRADOR' && !!this.contrato()?.contrato_url);
  puedeFinalizar = computed(() => this.esAdmin() && this.contrato()?.estado === 'ACTIVO');
  puedeCancelar = computed(() => this.esAdmin() && (this.contrato()?.estado === 'BORRADOR' || this.contrato()?.estado === 'ACTIVO'));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.cargar(id);
  }

  cargar(id: string): void {
    this.cargando.set(true);
    this.service.findOne(id).subscribe({
      next: (c) => {
        this.contrato.set(c);
        this.cargando.set(false);
        if (c.forma_pago === 'CUOTAS') {
          this.cuotasService.findByContrato(id).subscribe({
            next: (cuotas) => this.cuotas.set(cuotas ?? []),
            error: () => {},
          });
        }
      },
      error: () => {
        this.error.set('No se pudo cargar el contrato.');
        this.cargando.set(false);
      },
    });
  }

  descargarPdf(): void {
    const c = this.contrato();
    if (!c) return;
    this.procesando.set('pdf');
    this.service.descargarPdf(c.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contrato-${c.numero_contrato}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.procesando.set('');
      },
      error: () => {
        this.error.set('No se pudo generar el PDF.');
        this.procesando.set('');
      },
    });
  }

  subirFirmado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    const c = this.contrato();
    this.procesando.set('upload');
    this.service.subirFirmado(c.id, archivo).subscribe({
      next: (actualizado) => {
        this.contrato.set(actualizado);
        this.procesando.set('');
        this.mostrarToast('Contrato firmado subido correctamente');
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'No se pudo subir el contrato firmado.');
        this.procesando.set('');
      },
    });
    input.value = '';
  }

  async activar(): Promise<void> {
    const c = this.contrato();
    this.procesando.set('activar');
    try {
      const actualizado = await firstValueFrom(this.service.activar(c.id));
      this.contrato.set(actualizado);
      this.mostrarToast('Contrato activado');
      this.cargar(c.id);
    } catch (e: any) {
      this.error.set(e?.error?.message || 'No se pudo activar el contrato.');
    } finally {
      this.procesando.set('');
    }
  }

  async finalizar(): Promise<void> {
    const c = this.contrato();
    this.procesando.set('finalizar');
    try {
      const actualizado = await firstValueFrom(this.service.finalizar(c.id));
      this.contrato.set(actualizado);
      this.mostrarToast('Contrato finalizado');
    } catch (e: any) {
      this.error.set(e?.error?.message || 'No se pudo finalizar el contrato.');
    } finally {
      this.procesando.set('');
    }
  }

  async cancelar(): Promise<void> {
    if (!confirm('¿Seguro que quieres cancelar este contrato?')) return;
    const c = this.contrato();
    this.procesando.set('cancelar');
    try {
      const actualizado = await firstValueFrom(this.service.cancelar(c.id));
      this.contrato.set(actualizado);
      this.mostrarToast('Contrato cancelado');
    } catch (e: any) {
      this.error.set(e?.error?.message || 'No se pudo cancelar el contrato.');
    } finally {
      this.procesando.set('');
    }
  }

  async eliminar(): Promise<void> {
    if (!confirm('¿Eliminar este contrato? Esta acción no se puede deshacer.')) return;
    const c = this.contrato();
    this.procesando.set('eliminar');
    try {
      await firstValueFrom(this.service.eliminar(c.id));
      this.router.navigate(['/corredor/contratos']);
    } catch (e: any) {
      this.error.set(e?.error?.message || 'No se pudo eliminar el contrato.');
      this.procesando.set('');
    }
  }

  formatPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor || 0);
  }

  private mostrarToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
