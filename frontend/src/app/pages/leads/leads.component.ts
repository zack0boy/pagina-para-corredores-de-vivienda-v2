import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadFormComponent } from '../../components/lead-form/lead-form.component';

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, LeadFormComponent],
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css']
})
export class LeadsComponent implements OnInit {
  leads: any[] = [];
  showForm = false;

  constructor() {}

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads() {
    // TODO: Cargar desde servicio
    this.leads = [
      {
        id: '1',
        nombre: 'Juan Pérez',
        email: 'juan@gmail.com',
        telefono: '3001234567',
        estado: 'ASIGNADO',
        propiedad_id: 'prop-1',
        created_at: new Date(),
      },
    ];
  }

  onFormSubmit(data: any) {
    console.log('Nuevo lead:', data);
    this.showForm = false;
    this.loadLeads();
  }
}
