import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { SolicitudesPropiedadService } from '../../services/solicitudes-propiedad';
import { CategoriaService } from '../../services/categoria';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-publicar-solicitud',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Navbar],
  templateUrl: './publicar-solicitud.html',
  styleUrl: './publicar-solicitud.css',
})
export class PublicarSolicitud implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(SolicitudesPropiedadService);
  private categoriaService = inject(CategoriaService);

  categorias = signal<any[]>([]);
  cargando = signal(false);
  enviado = signal(false);
  error = signal('');

  form: FormGroup = this.fb.group({
    solicitante_nombre: ['', Validators.required],
    solicitante_email: ['', [Validators.email]],
    solicitante_telefono: [''],
    titulo: ['', [Validators.required, Validators.minLength(5)]],
    categoria_id: ['', Validators.required],
    tipo_operacion: ['VENTA', Validators.required],
    precio: [null, [Validators.required, Validators.min(1)]],
    direccion: ['', Validators.required],
    descripcion: [''],
  });

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe({
      next: (d: any) => this.categorias.set(Array.isArray(d) ? d : d?.data ?? []),
      error: () => {},
    });
  }

  enviar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.cargando.set(true);
    this.error.set('');

    // Quitamos los campos vacíos para no enviar "" en opcionales (ej: email)
    const limpio: any = { empresa_id: environment.empresaId };
    Object.entries(this.form.value).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') limpio[k] = v;
    });

    this.service.crear(limpio).subscribe({
      next: () => { this.cargando.set(false); this.enviado.set(true); },
      error: (e) => { this.cargando.set(false); this.error.set(e.error?.message ?? 'No se pudo enviar la solicitud.'); },
    });
  }

  campoInvalido(c: string): boolean {
    const ctrl = this.form.get(c);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
