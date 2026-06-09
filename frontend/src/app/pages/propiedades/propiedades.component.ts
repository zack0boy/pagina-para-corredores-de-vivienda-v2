import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropiedadFormComponent } from '../../components/propiedad-form/propiedad-form.component';
import { PropiedadCardComponent } from '../../components/propiedad-card/propiedad-card.component';
import { PropiedadFiltrosComponent } from '../../components/propiedad-filtros/propiedad-filtros.component';

@Component({
  selector: 'app-propiedades',
  standalone: true,
  imports: [CommonModule, PropiedadFormComponent, PropiedadCardComponent, PropiedadFiltrosComponent],
  templateUrl: './propiedades.component.html',
  styleUrls: ['./propiedades.component.css']
})
export class PropiedadesComponent implements OnInit {
  propiedades: any[] = [];
  filtrosActivos: any = {};
  showForm = false;

  constructor() {}

  ngOnInit() {
    this.loadPropiedades();
  }

  loadPropiedades() {
    // TODO: Cargar desde servicio
    this.propiedades = [
      {
        id: '1',
        titulo: 'Apartamento Centro',
        descripcion: 'Hermoso apartamento en zona céntrica',
        precio: 250000000,
        tipo_operacion: 'VENTA',
        estado: 'DISPONIBLE',
        ubicacion: 'Calle 50 #10-25',
        habitaciones: 2,
        banos: 1,
        estacionamientos: 1,
      },
      {
        id: '2',
        titulo: 'Casa Campestre',
        descripcion: 'Casa con lote grande y piscina',
        precio: 450000000,
        tipo_operacion: 'VENTA',
        estado: 'DISPONIBLE',
        ubicacion: 'Km 5 vía al mar',
        habitaciones: 4,
        banos: 3,
        estacionamientos: 2,
      },
    ];
  }

  onFiltrosChange(filtros: any) {
    this.filtrosActivos = filtros;
    // TODO: Aplicar filtros
  }

  onFormSubmit(data: any) {
    console.log('Nueva propiedad:', data);
    this.showForm = false;
    this.loadPropiedades();
  }
}
