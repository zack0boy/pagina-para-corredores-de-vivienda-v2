import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardPropiedadComponent } from '../../components/card-propiedad/card-propiedad';
import { FiltrosPropiedadComponent } from '../../components/filtros-propiedad/filtros-propiedad';
import { FiltrosPropiedad, PropiedadService } from '../../services/propiedad';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-propiedades',
  imports: [CardPropiedadComponent, FiltrosPropiedadComponent, Navbar, CommonModule],
  templateUrl: './propiedades.html',
  styleUrl: './propiedades.css',
})
export class PropiedadesComponent implements OnInit {
  private propiedadService = inject(PropiedadService);

  propiedades = signal<any[]>([]);
  cargando = signal<boolean>(true);
  
  precioMinimoReal = signal<number>(0);
  precioMaximoReal = signal<number>(0); 
  ubicacionesDisponibles = signal<string[]>([]);
  
  // 👈 Paginación centralizada en el padre
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  filtrosActuales?: FiltrosPropiedad;

  ngOnInit(): void {
    this.cargarPropiedades(undefined, true);
  }

  cargarPropiedades(filtros?: FiltrosPropiedad, esCargaInicial = false): void {
    this.cargando.set(true);
    
    // Guardamos los filtros actuales y reiniciamos la página a 1
    if (filtros) {
      this.filtrosActuales = filtros;
      this.currentPage.set(1);
    }
    
    // Combinamos filtros con la página actual
    const filtrosFinales: any = {
      ...(this.filtrosActuales || {}),
      page: this.currentPage(),
      limit: 6
    };

    this.propiedadService.findAll(filtrosFinales).subscribe({
      next: (res) => {
        // 🔍 DEPURACIÓN: Ver la estructura completa de la respuesta
        console.log('📊 Respuesta del servidor:', res);
        
        const data = res.data ? res.data : res;
        this.propiedades.set(data);
        
        // 👈 Lógica de cálculo de páginas
        let pages = 0;

        if (res.meta?.totalPages) {
          pages = res.meta.totalPages;
        } else if (res.total !== undefined) {
          pages = Math.ceil(res.total / 6);
        } else if (res.count !== undefined) {
          pages = Math.ceil(res.count / 6);
        }

        // 🛡️ PROTECCIÓN: Si no hay meta pero sí hay datos, mostrar al menos página 1
        if (pages === 0 && data.length > 0) {
          pages = 1;
        }

        this.totalPages.set(pages);
        console.log('📄 totalPages actual:', this.totalPages());
        
        this.cargando.set(false);

        if (esCargaInicial && data.length > 0) {
          const precios = data.map((p: any) => p.precio || p.price || 0);
          const min = Math.min(...precios);
          const max = Math.max(...precios);

          this.precioMinimoReal.set(min);
          this.precioMaximoReal.set(max + 100000); // Tu regla de negocio de +100.000

          // 🏙️ Extracción dinámica de ubicaciones
          const ciudadesUnicas = new Set<string>(
            data.map((p: any) => {
              const texto = p.direccion || p.ciudad || '';
              const partes = texto.split(',');
              return partes[partes.length - 1].trim();
            }).filter((c: string) => c !== '')
          );
          
          this.ubicacionesDisponibles.set(Array.from(ciudadesUnicas));
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar propiedades:', err);
        this.cargando.set(false);
      }
    });
  }

  // 👈 Función para cambiar de página
  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages()) {
      this.currentPage.set(nuevaPagina);
      this.cargarPropiedades();
    }
  }

  pageArray(): number[] {
    const n = this.totalPages() || 0;
    return Array.from({ length: n }, (_, i) => i);
  }
}