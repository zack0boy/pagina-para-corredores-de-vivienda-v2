import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioFormComponent } from '../../components/usuario-form/usuario-form.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, UsuarioFormComponent],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  showForm = false;

  ngOnInit() {
    this.loadUsuarios();
  }

  loadUsuarios() {
    this.usuarios = [
      {
        id: '1',
        nombre: 'Carlos',
        apellido: 'López',
        email: 'carlos@inmobiliario.com',
        rol: 'CORREDOR',
      },
    ];
  }

  onFormSubmit(data: any) {
    this.showForm = false;
    this.loadUsuarios();
  }
}
