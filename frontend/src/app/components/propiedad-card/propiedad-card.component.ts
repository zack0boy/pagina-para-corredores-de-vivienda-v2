import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-propiedad-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './propiedad-card.component.html',
  styleUrls: ['./propiedad-card.component.css']
})
export class PropiedadCardComponent {
  @Input() propiedad: any;
}
