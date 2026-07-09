import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PagosService } from '../../../services/pagos';
import { PropiedadService } from '../../../services/propiedad';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-corredor-pagos',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class PagosCorredor implements OnInit {
  private service = inject(PagosService);
  private propiedadService = inject(PropiedadService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  pagos = signal<any[]>([]);
  propiedades = signal<any[]>([]);
  resumen = signal<{ totalVendido: number; totalPendiente: number; cantidadPagos: number } | null>(null);
  cargando = signal<boolean>(true);
  error = signal<string>('');
  toast = signal<string>('');
  mostrarForm = signal<boolean>(false);
  guardando = signal<boolean>(false);
  subiendo = signal<string>('');

  // Imagen opcional del nuevo pago
  imagenSeleccionada: File | null = null;
  imagenPreview = signal<string>('');
  montoDisplay = signal<string>('');

  user = this.authService.obtenerUsuarioActual();

  form = this.fb.group({
    cliente_nombre: ['', Validators.required],
    propiedad_id: [''],
    propiedad_titulo: [''],
    monto: [null as number | null, [Validators.required, Validators.min(1)]],
    tipo_pago: ['TRANSFERENCIA', Validators.required],
    fecha_pago: ['', Validators.required],
    comentario: [''],
  });

  ngOnInit(): void {
    this.cargar();
    this.cargarPropiedades();
    this.cargarResumen();
  }

  // Cuánto ha vendido ESTE corredor (nunca lo que venden otros corredores)
  cargarResumen(): void {
    const corredorId = this.authService.obtenerUsuarioActual()?.id;
    if (!corredorId) return;
    this.service.resumenCorredor(corredorId).subscribe({
      next: (r) => this.resumen.set(r),
      error: () => {},
    });
  }

  cargar(): void {
    const usuarioActual = this.authService.obtenerUsuarioActual();
    const corredorId = usuarioActual?.id || this.user?.id;

    if (!corredorId) {
      this.error.set('No se pudo identificar al corredor.');
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.service.findByCorredor(corredorId).subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : data?.data ?? [];
        this.pagos.set(lista.map((pago: any) => ({
          ...pago,
          cliente_nombre: pago.cliente_nombre || pago.cliente?.nombre || pago.cliente?.nombre_completo || 'Cliente',
          propiedad_titulo: pago.propiedad_titulo || pago.propiedad?.titulo || '',
          estado: pago.estado || 'PENDIENTE_VALIDACION',
        })));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los pagos.');
        this.cargando.set(false);
      },
    });
  }

  // Carga las propiedades del corredor para el buscador
  cargarPropiedades(): void {
    const usuarioActual = this.authService.obtenerUsuarioActual();
    const corredorId = usuarioActual?.id || this.user?.id;

    this.propiedadService.findAll({ corredorId, limit: 100 }).subscribe({
      next: (res) => this.propiedades.set(res?.data ?? res ?? []),
      error: () => {},
    });
  }

  abrirForm(): void {
    this.form.reset({ tipo_pago: 'TRANSFERENCIA' });
    this.imagenSeleccionada = null;
    this.imagenPreview.set('');
    this.montoDisplay.set('');
    this.mostrarForm.set(true);
  }

  // Formatea el monto con puntos de miles mientras se escribe
  onMontoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloDigitos = input.value.replace(/\D/g, '');
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : null;
    this.form.patchValue({ monto: numero });
    this.montoDisplay.set(numero !== null ? numero.toLocaleString('es-CL') : '');
  }

  // Cuando elige una propiedad del datalist, guardamos su id por el título
  onPropiedadSeleccionada(titulo: string): void {
    const prop = this.propiedades().find((p) => p.titulo === titulo);
    this.form.patchValue({
      propiedad_id: prop?.id ?? '',
      propiedad_titulo: prop?.titulo ?? titulo,
    });
  }

  onImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    this.imagenSeleccionada = archivo;
    const reader = new FileReader();
    reader.onload = () => this.imagenPreview.set(reader.result as string);
    reader.readAsDataURL(archivo);
  }

  quitarImagen(): void {
    this.imagenSeleccionada = null;
    this.imagenPreview.set('');
  }

  async registrar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const v = this.form.value;
    try {
      const pago: any = await firstValueFrom(
        this.service.crear({
          corredor_id: this.user.id,
          cliente_nombre: v.cliente_nombre!,
          monto: Number(v.monto),
          tipo_pago: v.tipo_pago!,
          fecha_pago: new Date(v.fecha_pago!).toISOString(),
          comentario: v.comentario ?? undefined,
          propiedad_id: v.propiedad_id || undefined,
          propiedad_titulo: v.propiedad_titulo || undefined,
        }),
      );

      // Imagen opcional → la subimos como comprobante
      if (this.imagenSeleccionada) {
        await firstValueFrom(this.service.subirComprobante(pago.id, this.imagenSeleccionada));
      }

      this.guardando.set(false);
      this.mostrarForm.set(false);
      this.mostrarToast('Pago registrado');
      this.cargar();
      this.cargarResumen();
    } catch {
      this.guardando.set(false);
      this.error.set('No se pudo registrar el pago.');
    }
  }

  // Subir evidencia a un pago ya existente
  subirEvidencia(pagoId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    this.subiendo.set(pagoId);
    this.service.subirComprobante(pagoId, archivo).subscribe({
      next: (comp) => {
        this.subiendo.set('');
        this.pagos.update((l) => l.map((p) => (p.id === pagoId ? { ...p, comprobanteUrl: comp.archivoUrl } : p)));
        this.mostrarToast('Evidencia subida');
      },
      error: () => { this.subiendo.set(''); this.error.set('No se pudo subir la evidencia.'); },
    });
    input.value = '';
  }

  formatPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor || 0);
  }

  private mostrarToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
