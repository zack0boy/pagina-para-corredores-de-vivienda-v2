import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-visita-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './visita-form.component.html',
  styleUrls: ['./visita-form.component.css']
})
export class VisitaFormComponent {
  @Output() submitted = new EventEmitter<any>();
  visitaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.visitaForm = this.fb.group({
      propiedad_id: ['', Validators.required],
      cliente_id: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      observaciones: [''],
    });
  }

  onSubmit() {
    if (this.visitaForm.valid) {
      this.submitted.emit(this.visitaForm.value);
    }
  }
}
