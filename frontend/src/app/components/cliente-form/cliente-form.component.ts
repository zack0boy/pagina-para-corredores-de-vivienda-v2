import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css']
})
export class ClienteFormComponent {
  @Output() submitted = new EventEmitter<any>();
  clienteForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.clienteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      documento: ['', Validators.required],
      ciudad: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.clienteForm.valid) {
      this.submitted.emit(this.clienteForm.value);
    }
  }
}
