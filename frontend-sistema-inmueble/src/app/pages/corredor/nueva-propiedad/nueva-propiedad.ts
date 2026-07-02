import {
  Component, inject, OnInit, AfterViewInit, OnDestroy,
  signal, ViewChild, ElementRef,
} from '@angular/core';
import { Navbar } from '../../../components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PropiedadService } from '../../../services/propiedad';
import { CategoriaService } from '../../../services/categoria';
import { AuthService } from '../../../services/auth';
import { environment } from '../../../../environments/environment';
import * as L from 'leaflet';

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-nueva-propiedad',
  standalone: true,
  imports: [Navbar, CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './nueva-propiedad.html',
  styleUrl: './nueva-propiedad.css',
})
export class NuevaPropiedad implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer?: ElementRef;

  private fb = inject(FormBuilder);
  private propiedadService = inject(PropiedadService);
  private categoriaService = inject(CategoriaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  categorias = signal<any[]>([]);
  cargando = signal<boolean>(false);
  error = signal<string>('');
  exito = signal<string>('');
  buscando = signal<boolean>(false);
  coordInfo = signal<string>('Busca una dirección o haz clic en el mapa para marcar la ubicación.');
  precioDisplay = signal<string>('');

  // Imágenes seleccionadas + previews
  archivos: File[] = [];
  previews = signal<string[]>([]);

  private map?: L.Map;
  private marker?: L.Marker;
  user = this.authService.obtenerUsuarioActual();

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
    latitud: [null],
    longitud: [null],
  });

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe({
      next: (data: any) => this.categorias.set(Array.isArray(data) ? data : data?.data ?? []),
      error: () => this.error.set('No se pudieron cargar las categorías.'),
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 200);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    if (!this.mapContainer?.nativeElement) return;
    this.map = L.map(this.mapContainer.nativeElement, { center: [-33.45, -70.66], zoom: 12 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(this.map);
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.form.patchValue({ latitud: +lat.toFixed(8), longitud: +lng.toFixed(8) });
      if (this.marker) this.marker.setLatLng(e.latlng);
      else this.marker = L.marker(e.latlng).addTo(this.map!);
      // Rellenar la dirección automáticamente desde las coordenadas
      this.direccionDesdeCoords(lat, lng);
    });
    setTimeout(() => this.map?.invalidateSize(), 300);
  }

  // Busca una dirección/lugar y centra el mapa allí
  buscarUbicacion(query: string): void {
    const q = (query || '').trim();
    if (!q || !this.map) return;
    this.buscando.set(true);
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    fetch(url, { headers: { 'Accept-Language': 'es' } })
      .then((r) => r.json())
      .then((resultados) => {
        this.buscando.set(false);
        if (!resultados || resultados.length === 0) {
          this.coordInfo.set('No se encontró esa ubicación. Intenta ser más específico.');
          return;
        }
        const lat = parseFloat(resultados[0].lat);
        const lng = parseFloat(resultados[0].lon);
        this.map!.setView([lat, lng], 16);
        this.form.patchValue({
          latitud: +lat.toFixed(8),
          longitud: +lng.toFixed(8),
          direccion: resultados[0].display_name,
        });
        this.coordInfo.set(`📍 ${resultados[0].display_name}`);
        if (this.marker) this.marker.setLatLng([lat, lng]);
        else this.marker = L.marker([lat, lng]).addTo(this.map!);
      })
      .catch(() => {
        this.buscando.set(false);
        this.coordInfo.set('No se pudo buscar la ubicación. Revisa tu conexión.');
      });
  }

  // Geocodificación inversa: coordenadas → dirección
  private direccionDesdeCoords(lat: number, lng: number): void {
    this.coordInfo.set('Obteniendo dirección...');
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    fetch(url, { headers: { 'Accept-Language': 'es' } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.display_name) {
          this.form.patchValue({ direccion: d.display_name });
          this.coordInfo.set(`📍 ${d.display_name}`);
        } else {
          this.coordInfo.set(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      })
      .catch(() => this.coordInfo.set(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`));
  }

  // Selección de imágenes
  onArchivos(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const nuevos = Array.from(input.files).slice(0, 10 - this.archivos.length);
    this.archivos = [...this.archivos, ...nuevos];
    nuevos.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => this.previews.update((p) => [...p, reader.result as string]);
      reader.readAsDataURL(f);
    });
    input.value = '';
  }

  quitarImagen(i: number): void {
    this.archivos.splice(i, 1);
    this.previews.update((p) => p.filter((_, idx) => idx !== i));
  }

  setTipo(t: string): void {
    this.form.patchValue({ tipo_operacion: t });
  }

  // Formatea el precio con puntos de miles mientras se escribe
  onPrecioInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const soloDigitos = input.value.replace(/\D/g, '');
    const numero = soloDigitos ? parseInt(soloDigitos, 10) : null;
    this.form.patchValue({ precio: numero });
    this.precioDisplay.set(numero !== null ? numero.toLocaleString('es-CL') : '');
  }

  campoInvalido(c: string): boolean {
    const ctrl = this.form.get(c);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.cargando.set(true);
    this.error.set('');

    const payload = {
      ...this.form.value,
      empresa_id: environment.empresaId,
      corredor_id: this.user?.id,
    };

    try {
      const propiedad: any = await firstValueFrom(this.propiedadService.create(payload));
      // Subir imágenes una por una
      for (const archivo of this.archivos) {
        await firstValueFrom(this.propiedadService.subirImagen(propiedad.id, archivo));
      }
      this.cargando.set(false);
      this.exito.set('✓ Propiedad publicada correctamente.');
      setTimeout(() => this.router.navigate(['/corredor/gestion']), 1500);
    } catch (err: any) {
      this.cargando.set(false);
      this.error.set(err?.error?.message ?? 'Error al publicar la propiedad.');
    }
  }
}
