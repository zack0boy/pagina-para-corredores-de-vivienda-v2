import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PagosService } from '../../services/pagos';
import { PropiedadService } from '../../services/propiedad';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-pago-usuario',
  standalone: true,
  imports: [Navbar, CommonModule, ReactiveFormsModule],
  templateUrl: './pago-usuario.html',
  styleUrl: './pago-usuario.css',
})
export class PagoUsuario implements OnInit {

  private service = inject(PagosService);
  private propiedadService = inject(PropiedadService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  pagos = signal<any[]>([]);
  propiedades = signal<any[]>([]);
  cargando = signal(true);
  error = signal('');
  toast = signal('');
  mostrarForm = signal(false);
  guardando = signal(false);
  subiendo = signal('');

  imagenSeleccionada: File | null = null;
  imagenPreview = signal('');

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
  }

  cargar(): void {

    if (!this.user?.id) {
      this.error.set('No se pudo identificar al usuario.');
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);

    // Si quieres mostrar los pagos del cliente:
    this.service.findByCliente(this.user.id).subscribe({
      next: (data: any) => {
        this.pagos.set(Array.isArray(data) ? data : data?.data ?? []);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los pagos.');
        this.cargando.set(false);
      },
    });

    // Si prefieres los pagos del corredor, reemplaza por:
    // this.service.findByCorredor(this.user.id).subscribe(...)
  }

  cargarPropiedades(): void {
    const filtros: any = { limit: 100 };

    if (this.user?.empresa_id) {
      filtros.empresaId = this.user.empresa_id;
    }

    this.propiedadService.findAll(filtros).subscribe({
      next: (res) => this.propiedades.set(res?.data ?? res ?? []),
      error: () => {},
    });
  }

  abrirForm(): void {
    this.form.reset({
      tipo_pago: 'TRANSFERENCIA',
    });

    this.imagenSeleccionada = null;
    this.imagenPreview.set('');
    this.mostrarForm.set(true);
  }

  onPropiedadSeleccionada(titulo: string): void {
    const propiedad = this.propiedades().find(p => p.titulo === titulo);

    this.form.patchValue({
      propiedad_id: propiedad?.id ?? '',
      propiedad_titulo: propiedad?.titulo ?? titulo,
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

      const propiedadSeleccionada = this.propiedades().find((p) => p.id === v.propiedad_id);

      const pago: any = await firstValueFrom(
        this.service.crear({
          cliente_id: this.user?.id,
          cliente_nombre: v.cliente_nombre!,
          monto: Number(v.monto),
          tipo_pago: v.tipo_pago!,
          fecha_pago: new Date(v.fecha_pago!).toISOString(),
          comentario: v.comentario ?? undefined,
          propiedad_id: v.propiedad_id || undefined,
          propiedad_titulo: v.propiedad_titulo || undefined,
          corredor_id: propiedadSeleccionada?.corredor_id || undefined,
        })
      );

      if (this.imagenSeleccionada) {
        await firstValueFrom(
          this.service.subirComprobante(pago.id, this.imagenSeleccionada)
        );
      }

      this.guardando.set(false);
      this.mostrarForm.set(false);
      this.mostrarToast('Pago registrado');
      this.cargar();

    } catch (err: any) {

      this.guardando.set(false);
      const detalle = err?.error?.message || err?.message || 'No se pudo registrar el pago.';
      this.error.set(detalle);

    }
  }

  subirEvidencia(pagoId: string, event: Event): void {

    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    this.subiendo.set(pagoId);

    this.service.subirComprobante(pagoId, archivo).subscribe({
      next: (comp: any) => {
        this.subiendo.set('');

        this.pagos.update(lista =>
          lista.map(p =>
            p.id === pagoId
              ? { ...p, comprobanteUrl: comp.archivoUrl }
              : p
          )
        );

        this.mostrarToast('Evidencia subida');
      },
      error: () => {
        this.subiendo.set('');
        this.error.set('No se pudo subir la evidencia.');
      },
    });

    input.value = '';
  }

  formatPrecio(valor: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(valor || 0);
  }

  private mostrarToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}