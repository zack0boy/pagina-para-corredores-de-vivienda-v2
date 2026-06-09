import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pago-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pago-form.component.html',
  styleUrls: ['./pago-form.component.css']
})
export class PagoFormComponent {
  @Output() submitted = new EventEmitter<any>();
  pagoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.pagoForm = this.fb.group({
      contrato_id: ['', Validators.required],
      monto: ['', Validators.required],
      fecha_pago: ['', Validators.required],
      metodo_pago: ['', Validators.required],
      referencia: [''],
    });
  }

  onSubmit() {
    if (this.pagoForm.valid) {
      this.submitted.emit(this.pagoForm.value);
    }
  }
}
