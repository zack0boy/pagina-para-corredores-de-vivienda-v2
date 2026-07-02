import { Component, inject, output, input, effect, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FiltrosPropiedad } from '../../services/propiedad';
import { CategoriaService } from '../../services/categoria';

@Component({
  selector: 'app-filtros-propiedad',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './filtros-propiedad.html',
  styleUrl: './filtros-propiedad.css',
})
export class FiltrosPropiedadComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  
  onFiltrosCambian = output<FiltrosPropiedad>();
  listaCategorias: any[] = [];

  // Inputs dinámicos
  limiteMin = input.required<number>();
  limiteMax = input.required<number>();
  ubicaciones = input<string[]>([]);

  filtrosForm = this.fb.group({
    tipoOperacion: [''],
    precioMax: [0],
    nombre: [''],
    categoriaId: [''],
    habitaciones: [null as number | null]
  });

constructor() {
  effect(() => {
    const maximo = this.limiteMax();
    if (maximo > 0 && (this.filtrosForm.get('precioMax')?.value === 0)) {
      this.filtrosForm.get('precioMax')?.setValue(maximo, { emitEvent: false });
    }
  });
}

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe({
      next: (data: any) => { this.listaCategorias = data; },
      error: (err) => { console.error('Error al cargar categorías:', err); }
    });
  }

  setTipoOperacion(valor: string): void {
    const actual = this.filtrosForm.get('tipoOperacion')?.value;
    this.filtrosForm.get('tipoOperacion')?.setValue(actual === valor ? '' : valor);
  }

  setHabitaciones(num: number): void {
    const actual = this.filtrosForm.get('habitaciones')?.value;
    this.filtrosForm.get('habitaciones')?.setValue(actual === num ? null : num);
  }

  formatearPrecio(valor: any): string {
    if (!valor) return '$0';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(valor);
  }

  aplicarFiltros(): void {
    const rawValores = this.filtrosForm.value;
    
    const filtrosValidos: any = {
      ...rawValores,
      page: 1,      // 👈 El padre manejará la paginación
      limit: 6
    };

    Object.keys(filtrosValidos).forEach(key => {
      const val = filtrosValidos[key];
      if (val === null || val === undefined || val === '') {
        delete filtrosValidos[key];
      }
    });

    this.onFiltrosCambian.emit(filtrosValidos);
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      tipoOperacion: '',
      precioMax: this.limiteMax(),
      nombre: '',
      categoriaId: '',
      habitaciones: null
    });
    // 👈 El padre gestiona la paginación al limpiar
    this.onFiltrosCambian.emit({ page: 1, limit: 6 });
  }
}