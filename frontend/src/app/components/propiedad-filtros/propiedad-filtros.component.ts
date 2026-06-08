import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-propiedad-filtros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './propiedad-filtros.component.html',
  styleUrls: ['./propiedad-filtros.component.css']
})
export class PropiedadFiltrosComponent {
  @Output() filtrosChange = new EventEmitter<any>();

  filtrosForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filtrosForm = this.fb.group({
      tipoOperacion: [''],
      estado: [''],
      precioMin: [''],
      precioMax: [''],
      habitaciones: [''],
      banos: [''],
      nombre: [''],
    });

    this.filtrosForm.valueChanges.subscribe(filtros => {
      this.filtrosChange.emit(filtros);
    });
  }

  resetFiltros() {
    this.filtrosForm.reset();
  }
}
