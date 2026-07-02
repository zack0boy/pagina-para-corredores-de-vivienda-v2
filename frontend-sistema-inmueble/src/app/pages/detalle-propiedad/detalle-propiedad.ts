import {
  Component, inject, OnInit, OnDestroy, AfterViewInit,
  signal, computed, ElementRef, ViewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { PropiedadService } from '../../services/propiedad';
import { Navbar } from '../../components/navbar/navbar';
import * as L from 'leaflet';

const PLACEHOLDER = 'placeholder-propiedad.svg';
const MAX_IMAGENES = 10;
const AUTOPLAY_MS = 40000; // 40 segundos

const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-detalle-propiedad',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, Navbar, CommonModule],
  templateUrl: './detalle-propiedad.html',
  styleUrl: './detalle-propiedad.css',
})
export class DetallePropiedad implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer?: ElementRef;

  private route = inject(ActivatedRoute);
  private propiedadService = inject(PropiedadService);

  propiedad = signal<any>(null);
  cargando = signal<boolean>(true);
  mostrarModal = signal<boolean>(false);

  indiceActual = signal<number>(0);

  // Lightbox / lupa
  lightboxAbierto = signal<boolean>(false);
  zoom = signal<number>(1);
  panX = signal<number>(50); // % posición del zoom (origen)
  panY = signal<number>(50);

  private timer?: any;
  private map?: L.Map;
  private resizeObserver?: ResizeObserver;

  // Imágenes desde la BD (máximo 10), ordenadas por 'orden'
  imagenes = computed<string[]>(() => {
    const imgs = this.propiedad()?.imagenes;
    if (Array.isArray(imgs) && imgs.length > 0) {
      return imgs.map((i: any) => i.url).filter(Boolean).slice(0, MAX_IMAGENES);
    }
    return [];
  });

  imagenPrincipal = computed<string>(() => {
    const lista = this.imagenes();
    if (lista.length === 0) return PLACEHOLDER;
    return lista[this.indiceActual()] ?? lista[0];
  });

  tieneImagenes = computed<boolean>(() => this.imagenes().length > 0);
  tieneUbicacion = computed<boolean>(() => {
    const p = this.propiedad();
    return p?.latitud != null && p?.longitud != null;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.propiedadService.findOne(id).subscribe({
        next: (data) => {
          this.propiedad.set(data);
          this.indiceActual.set(0);
          this.cargando.set(false);
          this.iniciarAutoplay();
          // Esperamos a que el DOM pinte el contenedor del mapa
          setTimeout(() => this.initMap(), 250);
        },
        error: (err) => {
          console.error('Error al cargar detalle:', err);
          this.cargando.set(false);
        },
      });
    }
  }

  ngAfterViewInit(): void {
    // El mapa se inicializa tras cargar los datos (ver ngOnInit)
  }

  ngOnDestroy(): void {
    this.detenerAutoplay();
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  // ── MAPA ──────────────────────────────────────────────────
  private initMap(): void {
    if (this.map || !this.mapContainer?.nativeElement || !this.tieneUbicacion()) return;
    const lat = Number(this.propiedad().latitud);
    const lng = Number(this.propiedad().longitud);

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [lat, lng],
      zoom: 16,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Punto/pin personalizado (no depende de imágenes externas)
    const pin = L.divIcon({
      className: 'mapa-pin',
      html: '<span class="pin-dot"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    L.marker([lat, lng], { icon: pin }).addTo(this.map)
      .bindPopup(this.propiedad().titulo ?? 'Ubicación')
      .openPopup();

    // Recalcula el tamaño varias veces por si el layout cambia (imágenes que cargan, etc.)
    [100, 400, 900].forEach((ms) =>
      setTimeout(() => this.map?.invalidateSize(), ms),
    );

    // Observa cambios de tamaño del contenedor y reajusta el mapa
    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  // ── CARRUSEL ──────────────────────────────────────────────
  seleccionar(indice: number): void {
    this.indiceActual.set(indice);
    this.reiniciarAutoplay();
  }

  anterior(): void {
    const total = this.imagenes().length;
    if (total === 0) return;
    this.indiceActual.update((i) => (i - 1 + total) % total);
    this.reiniciarAutoplay();
  }

  siguiente(): void {
    const total = this.imagenes().length;
    if (total === 0) return;
    this.indiceActual.update((i) => (i + 1) % total);
    this.reiniciarAutoplay();
  }

  private iniciarAutoplay(): void {
    if (this.imagenes().length <= 1) return;
    this.timer = setInterval(() => {
      const total = this.imagenes().length;
      this.indiceActual.update((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
  }

  private detenerAutoplay(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = undefined; }
  }

  private reiniciarAutoplay(): void {
    this.detenerAutoplay();
    this.iniciarAutoplay();
  }

  // ── LIGHTBOX / LUPA ───────────────────────────────────────
  abrirLightbox(): void {
    if (!this.tieneImagenes()) return;
    this.lightboxAbierto.set(true);
    this.zoom.set(1);
    this.detenerAutoplay();
  }

  cerrarLightbox(): void {
    this.lightboxAbierto.set(false);
    this.zoom.set(1);
    this.iniciarAutoplay();
  }

  alternarZoom(): void {
    this.zoom.update((z) => (z > 1 ? 1 : 2.5));
  }

  // Mueve el punto de enfoque del zoom según el mouse
  moverZoom(event: MouseEvent): void {
    if (this.zoom() <= 1) return;
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.panX.set(x);
    this.panY.set(y);
  }

  // ── MODAL CONTACTO ────────────────────────────────────────
  abrirModal(): void { this.mostrarModal.set(true); }
  cerrarModal(): void { this.mostrarModal.set(false); }

  // Arma el link de WhatsApp a partir del teléfono
  urlWhatsapp(telefono: string): string {
    const limpio = (telefono || '').replace(/[^0-9]/g, '');
    return `https://wa.me/${limpio}`;
  }
}
