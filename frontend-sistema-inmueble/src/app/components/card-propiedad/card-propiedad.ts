import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, UpperCasePipe,NgIf } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-card-propiedad',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, UpperCasePipe,NgIf],
  templateUrl: './card-propiedad.html',
  styleUrls: ['./card-propiedad.css']
})
export class CardPropiedadComponent {
  // Recibe el objeto propiedad enviado por el padre
  @Input() propiedad: any;

  authService = inject(AuthService);

  esCorredor(): boolean {
    const usuario = this.authService.obtenerUsuarioActual();
    const rol = (usuario?.rol || usuario?.role || '')?.toString().toUpperCase();

    return ['CORREDOR', 'AGENTE', 'CORREDOR_INMOBILIARIO'].includes(rol);
  }
}