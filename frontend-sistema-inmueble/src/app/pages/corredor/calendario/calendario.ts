import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EventosCalendarioService } from '../../../services/eventos-calendario';
import { AuthService } from '../../../services/auth';
import { CuotasService } from '../../../services/cuotas';

const EMPRESA_ID = '00000000-0000-0000-0000-000000000001';

interface DiaCalendario {
  fecha: Date;
  dia: number;
  otroMes: boolean;
  hoy: boolean;
  eventos: any[];
}

@Component({
  selector: 'app-corredor-calendario',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './calendario.html',
  styleUrl: './calendario.css',
})
export class CalendarioCorredor implements OnInit {
  private service = inject(EventosCalendarioService);
  private authService = inject(AuthService);
  private cuotasService = inject(CuotasService);
  private fb = inject(FormBuilder);

  // Detalle de solo lectura para eventos derivados de una cuota (vencimientos)
  detalleCuota = signal<any | null>(null);
  cargandoDetalleCuota = signal<boolean>(false);

  eventos = signal<any[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string>('');
  toast = signal<string>('');
  mostrarForm = signal<boolean>(false);
  editandoId = signal<string | null>(null);

  // Mes mostrado en la cuadrícula
  mesActual = signal<Date>(new Date());

  user = this.authService.obtenerUsuarioActual();

  tipos = [
    { valor: 'VISITA', label: 'Visita a propiedad', icono: 'home' },
    { valor: 'CONTACTO_CLIENTE', label: 'Contacto con cliente', icono: 'call' },
    { valor: 'GESTION_PAGO', label: 'Gestión de pago', icono: 'payments' },
    { valor: 'VENCIMIENTO_CUOTA', label: 'Vencimiento de cuota', icono: 'payments' },
    { valor: 'OTRO', label: 'Otro', icono: 'event' },
  ];

  nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    tipo: ['VISITA', Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
    descripcion: [''],
  });

  // Título del mes (ej: "junio 2026")
  tituloMes = computed(() =>
    this.mesActual().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
  );

  // Construye la cuadrícula del mes (semanas de lunes a domingo)
  dias = computed<DiaCalendario[]>(() => {
    const base = this.mesActual();
    const anio = base.getFullYear();
    const mes = base.getMonth();
    const primero = new Date(anio, mes, 1);
    // getDay: 0=domingo. Queremos empezar en lunes.
    let offset = primero.getDay() - 1;
    if (offset < 0) offset = 6;
    const inicio = new Date(anio, mes, 1 - offset);

    const hoy = new Date();
    const celdas: DiaCalendario[] = [];
    for (let i = 0; i < 42; i++) {
      const f = new Date(inicio);
      f.setDate(inicio.getDate() + i);
      celdas.push({
        fecha: f,
        dia: f.getDate(),
        otroMes: f.getMonth() !== mes,
        hoy: f.toDateString() === hoy.toDateString(),
        eventos: this.eventosDelDia(f),
      });
    }
    return celdas;
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (!this.user?.id) {
      this.error.set('No se pudo identificar al corredor.');
      this.cargando.set(false);
      return;
    }
    this.cargando.set(true);
    this.service.findByCorredor(this.user.id).subscribe({
      next: (data) => {
        const lista = Array.isArray(data) ? data : data?.data ?? [];
        this.eventos.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los eventos.');
        this.cargando.set(false);
      },
    });
  }

  eventosDelDia(fecha: Date): any[] {
    return this.eventos()
      .filter((e) => new Date(e.fecha_inicio).toDateString() === fecha.toDateString())
      .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());
  }

  // Navegación de meses
  mesAnterior(): void {
    const d = new Date(this.mesActual());
    d.setMonth(d.getMonth() - 1);
    this.mesActual.set(d);
  }
  mesSiguiente(): void {
    const d = new Date(this.mesActual());
    d.setMonth(d.getMonth() + 1);
    this.mesActual.set(d);
  }
  irHoy(): void {
    this.mesActual.set(new Date());
  }

  // Abrir formulario para CREAR (opcionalmente con una fecha preseleccionada)
  nuevoEvento(fecha?: Date): void {
    this.editandoId.set(null);
    const base = fecha ?? new Date();
    const inicio = this.aInputLocal(new Date(base.setHours(9, 0, 0, 0)));
    const fin = this.aInputLocal(new Date(base.setHours(10, 0, 0, 0)));
    this.form.reset({ tipo: 'VISITA', fecha_inicio: inicio, fecha_fin: fin, titulo: '', descripcion: '' });
    this.mostrarForm.set(true);
  }

  // Abrir formulario para EDITAR un evento existente (o el detalle de solo lectura si es
  // un vencimiento de cuota derivado automáticamente al activar un contrato).
  editarEvento(e: any): void {
    if (e.tipo === 'VENCIMIENTO_CUOTA') {
      this.verDetalleCuota(e);
      return;
    }
    this.editandoId.set(e.id);
    this.form.reset({
      titulo: e.titulo,
      tipo: e.tipo,
      fecha_inicio: this.aInputLocal(new Date(e.fecha_inicio)),
      fecha_fin: this.aInputLocal(new Date(e.fecha_fin)),
      descripcion: e.descripcion ?? '',
    });
    this.mostrarForm.set(true);
  }

  cancelarForm(): void {
    this.mostrarForm.set(false);
    this.editandoId.set(null);
  }

  verDetalleCuota(e: any): void {
    this.detalleCuota.set({ evento: e, cuota: null });
    if (!e.cuota_id) return;
    this.cargandoDetalleCuota.set(true);
    this.cuotasService.findOne(e.cuota_id).subscribe({
      next: (cuota) => {
        this.detalleCuota.set({ evento: e, cuota });
        this.cargandoDetalleCuota.set(false);
      },
      error: () => this.cargandoDetalleCuota.set(false),
    });
  }

  cerrarDetalleCuota(): void {
    this.detalleCuota.set(null);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const dto = {
      empresa_id: EMPRESA_ID,
      corredor_id: this.user.id,
      titulo: v.titulo!,
      tipo: v.tipo!,
      fecha_inicio: v.fecha_inicio!,
      fecha_fin: v.fecha_fin!,
      descripcion: v.descripcion ?? undefined,
    };

    const id = this.editandoId();
    const obs = id ? this.service.update(id, dto) : this.service.create(dto);
    obs.subscribe({
      next: () => {
        this.mostrarForm.set(false);
        this.editandoId.set(null);
        this.mostrarToast(id ? 'Evento actualizado' : 'Evento creado');
        this.cargar();
      },
      error: () => this.error.set('No se pudo guardar el evento.'),
    });
  }

  completar(id: string): void {
    this.service.marcarCompletado(id).subscribe({
      next: () => {
        this.eventos.update((l) => l.map((e) => (e.id === id ? { ...e, completado: true } : e)));
        this.mostrarToast('Evento completado');
      },
    });
  }

  eliminar(id: string): void {
    if (!confirm('¿Eliminar este evento?')) return;
    this.service.remove(id).subscribe({
      next: () => {
        this.eventos.update((l) => l.filter((e) => e.id !== id));
        this.mostrarToast('Evento eliminado');
      },
    });
  }

  iconoTipo(tipo: string): string {
    return this.tipos.find((t) => t.valor === tipo)?.icono ?? 'event';
  }

  // Convierte una fecha a formato datetime-local (YYYY-MM-DDТHH:mm) en hora local
  private aInputLocal(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private mostrarToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
