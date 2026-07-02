import { Component, inject, OnInit, signal } from '@angular/core';
import { Navbar } from '../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PropiedadService } from '../../../services/propiedad';
import { CategoriaService } from '../../../services/categoria';

@Component({
  selector: 'app-editar-propiedad',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './editar-propiedad.html',
  styleUrl: './editar-propiedad.css',
})
export class EditarPropiedad implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propiedadService = inject(PropiedadService);
  private categoriaService = inject(CategoriaService);

  propiedadId = '';
  categorias = signal<any[]>([]);
  imagenes = signal<any[]>([]);
  cargando = signal<boolean>(true);
  guardando = signal<boolean>(false);
  subiendo = signal<boolean>(false);
  toast = signal<string>('');
  error = signal<string>('');
  precioDisplay = signal<string>('');

  form: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
    categoria_id: ['', Validators.required],
    tipo_operacion: ['VENTA', Validators.required],
    precio: [null, [Validators.required, Validators.min(1)]],
    direccion: ['', Validators.required],
    descripcion: [''],
    habitaciones: [0],
    banos: [0],
    estacionamientos: [0],
    metros_totales: [null],
    metros_construidos: [null],
    estado: ['DISPONIBLE'],
  });

  ngOnInit(): void {
    this.propiedadId = this.route.snapshot.paramMap.get('id') ?? '';
    this.categoriaService.getAll().subscribe({
      next: (d: any) => this.categorias.set(Array.isArray(d) ? d : d?.data ?? []),
    });
    this.cargar();
  }

  cargar(): void {
    this.propiedadService.findOne(this.propiedadId).subscribe({
      next: (p) => {
        this.form.patchValue({
          titulo: p.titulo, categoria_id: p.categoria_id, tipo_operacion: p.tipo_operacion,
          precio: p.precio, direccion: p.direccion, descripcion: p.descripcion,
          habitaciones: p.habitaciones, banos: p.banos, estacionamientos: p.estacionamientos,
          metros_totales: p.metros_totales, metros_construidos: p.metros_construidos, estado: p.estado,
        });
        this.precioDisplay.set(p.precio ? Number(p.precio).toLocaleString('es-CL') : '');
        this.imagenes.set((p.imagenes ?? []).sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0)));
        this.cargando.set(false);
      },
      error: () => { this.error.set('No se pudo cargar la propiedad.'); this.cargando.set(false); },
    });
  }

  setTipo(t: string): void { this.form.patchValue({ tipo_operacion: t }); }

  onPrecioInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    const n = v ? parseInt(v, 10) : null;
    this.form.patchValue({ precio: n });
    this.precioDisplay.set(n !== null ? n.toLocaleString('es-CL') : '');
  }

  // Guardar datos
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.error.set('');
    this.propiedadService.update(this.propiedadId, this.form.value).subscribe({
      next: () => { this.guardando.set(false); this.mostrarToast('Cambios guardados'); },
      error: () => { this.guardando.set(false); this.error.set('No se pudo guardar.'); },
    });
  }

  // ── IMÁGENES ──────────────────────────────────────────────
  async agregarImagenes(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.subiendo.set(true);
    try {
      for (const archivo of Array.from(input.files)) {
        await firstValueFrom(this.propiedadService.subirImagen(this.propiedadId, archivo));
      }
      await this.recargarImagenes();
      this.mostrarToast('Imágenes agregadas');
    } catch {
      this.error.set('No se pudieron subir las imágenes.');
    }
    this.subiendo.set(false);
    input.value = '';
  }

  async eliminarImagen(id: string): Promise<void> {
    if (!confirm('¿Eliminar esta imagen?')) return;
    try {
      await firstValueFrom(this.propiedadService.eliminarImagen(id));
      this.imagenes.update((l) => l.filter((i) => i.id !== id));
      this.mostrarToast('Imagen eliminada');
    } catch {
      this.error.set('No se pudo eliminar la imagen.');
    }
  }

  // Mover imagen (dir = -1 sube, +1 baja) y persistir el nuevo orden
  async mover(index: number, dir: number): Promise<void> {
    const lista = [...this.imagenes()];
    const destino = index + dir;
    if (destino < 0 || destino >= lista.length) return;
    [lista[index], lista[destino]] = [lista[destino], lista[index]];
    this.imagenes.set(lista);
    // Reasignar orden 1..n y persistir
    try {
      await Promise.all(
        lista.map((img, i) =>
          firstValueFrom(this.propiedadService.actualizarOrdenImagen(img.id, i + 1)),
        ),
      );
    } catch {
      this.error.set('No se pudo guardar el nuevo orden.');
    }
  }

  private async recargarImagenes(): Promise<void> {
    const imgs: any = await firstValueFrom(this.propiedadService.imagenesPorPropiedad(this.propiedadId));
    this.imagenes.set((imgs ?? []).sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0)));
  }

  campoInvalido(c: string): boolean {
    const ctrl = this.form.get(c);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  private mostrarToast(m: string): void { this.toast.set(m); setTimeout(() => this.toast.set(''), 3000); }
}
