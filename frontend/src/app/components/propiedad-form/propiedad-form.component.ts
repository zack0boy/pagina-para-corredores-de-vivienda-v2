import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-propiedad-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './propiedad-form.component.html',
  styleUrls: ['./propiedad-form.component.css']
})
export class PropiedadFormComponent {
  @Output() submitted = new EventEmitter<any>();

  propiedadForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.propiedadForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: ['', Validators.required],
      tipo_operacion: ['', Validators.required],
      estado: ['DISPONIBLE'],
      ubicacion: ['', Validators.required],
      habitaciones: ['', Validators.required],
      banos: ['', Validators.required],
      estacionamientos: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.propiedadForm.valid) {
      this.submitted.emit(this.propiedadForm.value);
    }
  }
}
