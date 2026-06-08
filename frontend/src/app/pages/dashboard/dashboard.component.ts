import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats = {
    propiedades: 45,
    leads: 28,
    visitas: 12,
    contratos: 8,
  };

  constructor() {}

  ngOnInit() {
    // TODO: Cargar datos del servicio
  }
}
