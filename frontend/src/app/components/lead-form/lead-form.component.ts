import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lead-form.component.html',
  styleUrls: ['./lead-form.component.css']
})
export class LeadFormComponent {
  @Output() submitted = new EventEmitter<any>();
  leadForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.leadForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      mensaje: [''],
      propiedad_id: [''],
    });
  }

  onSubmit() {
    if (this.leadForm.valid) {
      this.submitted.emit(this.leadForm.value);
    }
  }
}
