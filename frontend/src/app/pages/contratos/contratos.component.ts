import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContratoFormComponent } from '../../components/contrato-form/contrato-form.component';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, ContratoFormComponent],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.css']
})
export class ContratosComponent implements OnInit {
  contratos: any[] = [];
  showForm = false;

  ngOnInit() {
    this.loadContratos();
  }

  loadContratos() {
    this.contratos = [];
  }

  onFormSubmit(data: any) {
    this.showForm = false;
    this.loadContratos();
  }
}
