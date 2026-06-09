import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClienteFormComponent } from '../../components/cliente-form/cliente-form.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ClienteFormComponent],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})
export class ClientesComponent implements OnInit {
  clientes: any[] = [];
  showForm = false;

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.clientes = [
      {
        id: '1',
        nombre: 'María',
        apellido: 'García',
        email: 'maria@gmail.com',
        telefono: '3015554321',
        ciudad: 'Bogotá',
      },
    ];
  }

  onFormSubmit(data: any) {
    console.log('Nuevo cliente:', data);
    this.showForm = false;
    this.loadClientes();
  }
}
