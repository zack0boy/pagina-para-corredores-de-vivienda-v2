import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contrato-form.component.html',
  styleUrls: ['./contrato-form.component.css']
})
export class ContratoFormComponent {
  @Output() submitted = new EventEmitter<any>();
  contratoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contratoForm = this.fb.group({
      numero_contrato: ['', Validators.required],
      propiedad_id: ['', Validators.required],
      cliente_id: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      valor_contrato: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.contratoForm.valid) {
      this.submitted.emit(this.contratoForm.value);
    }
  }
}
