import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitaFormComponent } from '../../components/visita-form/visita-form.component';

@Component({
  selector: 'app-visitas',
  standalone: true,
  imports: [CommonModule, VisitaFormComponent],
  templateUrl: './visitas.component.html',
  styleUrls: ['./visitas.component.css']
})
export class VisitasComponent implements OnInit {
  visitas: any[] = [];
  showForm = false;

  ngOnInit() {
    this.loadVisitas();
  }

  loadVisitas() {
    this.visitas = [];
  }

  onFormSubmit(data: any) {
    this.showForm = false;
    this.loadVisitas();
  }
}
