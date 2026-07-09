import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContratosService } from '../../../../services/contratos';
import { PropiedadService } from '../../../../services/propiedad';
import { UsersService } from '../../../../services/users';
import { AuthService } from '../../../../services/auth';

@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './contrato-form.html',
  styleUrl: './contrato-form.css',
})
export class ContratoForm implements OnInit {
  private service = inject(ContratosService);
  private propiedadService = inject(PropiedadService);
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  user = this.authService.obtenerUsuarioActual();

  contratoId = signal<string | null>(null);
  esEdicion = signal<boolean>(false);
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  error = signal<string>('');

  propiedades = signal<any[]>([]);
  clientes = signal<any[]>([]);
  montoDisplay = signal<string>('');
  montoCuotaDisplay = signal<string>('');

  diasDelMes = Array.from({ length: 28 }, (_, i) => i + 1);

  form = this.fb.group({
    propiedad_id: ['', Validators.required],
    propiedad_titulo: [''],
    cliente_id: ['', Validators.required],
    cliente_nombre: [''],
    numero_contrato: ['', Validators.required],
    tipo: ['VENTA', Validators.required],
    forma_pago: ['PAGO_UNICO', Validators.required],
    monto_total: [null as number | null, [Validators.required, Validators.min(1)]],
    fecha_inicio: ['', Validators.required],
    fecha_fin: [''],
    monto_cuota_mensual: [null as number | null],
    dia_pago_mensual: [5],
    observaciones: [''],
  });

  private formValue = toSignal(this.form.valueChanges, { initialValue: this.form.value });

  esPorCuotas = computed(() => this.formValue().forma_pago === 'CUOTAS');

  // Vista previa en vivo (calculada igual que el backend) para que el corredor vea de
  // inmediato cuántos meses y cuándo termina, sin tener que escribir la fecha él mismo.
  previewCuotas = computed<{ meses: number; fechaFin: string } | null>(() => {
    const v = this.formValue();
    if (v.forma_pago !== 'CUOTAS' || !v.monto_total || !v.monto_cuota_mensual || !v.fecha_inicio) {
      return null;
    }
    const fechaInicio = new Date(v.fecha_inicio + 'T00:00:00');
    if (isNaN(fechaInicio.getTime())) return null;
    const meses = Math.max(1, Math.ceil(Number(v.monto_total) / Number(v.monto_cuota_mensual)));
    const diaPago = v.dia_pago_mensual || fechaInicio.getDate();
    const anio = fechaInicio.getFullYear();
    const mesFinal = fechaInicio.getMonth() + meses;
    const ultimoDiaMes = new Date(anio, mesFinal + 1, 0).getDate();
    const dia = Math.min(diaPago, ultimoDiaMes);
    const fechaFin = new Date(anio, mesFinal, dia);
    return { meses, fechaFin: fechaFin.toLocaleDateString('es-CL') };
  });

  ngOnInit(): void {
    this.cargarPropiedades();
    this.cargarClientes();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.contratoId.set(id);
      this.esEdicion.set(true);
      this.cargarContrato(id);
    } else {
      this.form.patchValue({ numero_contrato: this.generarNumeroContrato() });
    }
  }

  private generarNumeroContrato(): string {
    const fecha = new Date();
    const sufijo = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `CT-${fecha.getFullYear()}${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${sufijo}`;
  }

  cargarPropiedades(): void {
    const corredorId = this.user?.id;
    this.propiedadService.findAll({ corredorId, limit: 200 }).subscribe({
      next: (res) => this.propiedades.set(res?.data ?? res ?? []),
      error: () => {},
    });
  }

  cargarClientes(): void {
    this.usersService.getClientes().subscribe({
      next: (res) => this.clientes.set(res?.data ?? res ?? []),
      error: () => {},
    });
  }

  cargarContrato(id: string): void {
    this.cargando.set(true);
    this.service.findOne(id).subscribe({
      next: (c) => {
        if (c.estado !== 'BORRADOR') {
          this.error.set('Este contrato ya no está en BORRADOR, no se puede editar.');
        }
        this.form.patchValue({
          propiedad_id: c.propiedad_id,
          cliente_id: c.cliente_id,
          numero_contrato: c.numero_contrato,
          tipo: c.tipo,
          forma_pago: c.forma_pago,
          monto_total: c.monto_total,
          fecha_inicio: c.fecha_inicio ? c.fecha_inicio.slice(0, 10) : '',
          fecha_fin: c.fecha_fin ? c.fecha_fin.slice(0, 10) : '',
          monto_cuota_mensual: c.monto_cuota_mensual ?? null,
          dia_pago_mensual: c.dia_pago_mensual ?? 5,
          observaciones: c.observaciones ?? '',
        });
        this.montoDisplay.set(c.monto_total ? Number(c.monto_total).toLocaleString('es-CL') : '');
        this.montoCuotaDisplay.set(c.monto_cuota_mensual ? Number(c.monto_cuota_mensual).toLocaleString('es-CL') : '');
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el contrato.');
        this.cargando.set(false);
      },
    });
  }

  onMontoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloDigitos = input.value.replace(/\D/g, '');
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : null;
    this.form.patchValue({ monto_total: numero });
    this.montoDisplay.set(numero !== null ? numero.toLocaleString('es-CL') : '');
  }

  onMontoCuotaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloDigitos = input.value.replace(/\D/g, '');
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : null;
    this.form.patchValue({ monto_cuota_mensual: numero });
    this.montoCuotaDisplay.set(numero !== null ? numero.toLocaleString('es-CL') : '');
  }

  onPropiedadSeleccionada(titulo: string): void {
    const prop = this.propiedades().find((p) => p.titulo === titulo);
    this.form.patchValue({ propiedad_id: prop?.id ?? '' });
  }

  onClienteSeleccionado(texto: string): void {
    const cliente = this.clientes().find((c) => `${c.nombre} ${c.apellido}`.trim() === texto);
    this.form.patchValue({ cliente_id: cliente?.id ?? '' });
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    const v = this.form.value;
    const porCuotasConMontoMensual = v.forma_pago === 'CUOTAS' && !!v.monto_cuota_mensual;

    const dto = {
      propiedad_id: v.propiedad_id!,
      cliente_id: v.cliente_id!,
      numero_contrato: v.numero_contrato!,
      tipo: v.tipo as 'VENTA' | 'ARRIENDO' | 'RESERVA',
      forma_pago: v.forma_pago as 'CUOTAS' | 'PAGO_UNICO',
      monto_total: Number(v.monto_total),
      fecha_inicio: v.fecha_inicio!,
      // Si hay monto de cuota mensual, el servidor calcula fecha_fin automáticamente.
      fecha_fin: porCuotasConMontoMensual ? undefined : (v.fecha_fin || undefined),
      monto_cuota_mensual: v.forma_pago === 'CUOTAS' ? (v.monto_cuota_mensual ?? undefined) : undefined,
      dia_pago_mensual: v.forma_pago === 'CUOTAS' ? (v.dia_pago_mensual ?? undefined) : undefined,
      observaciones: v.observaciones || undefined,
    };

    try {
      if (this.esEdicion() && this.contratoId()) {
        await firstValueFrom(this.service.actualizar(this.contratoId()!, dto));
        this.router.navigate(['/corredor/contratos', this.contratoId()]);
      } else {
        const creado: any = await firstValueFrom(this.service.crear(dto));
        this.router.navigate(['/corredor/contratos', creado.id]);
      }
    } catch (e: any) {
      this.guardando.set(false);
      this.error.set(e?.error?.message || 'No se pudo guardar el contrato.');
    }
  }
}
