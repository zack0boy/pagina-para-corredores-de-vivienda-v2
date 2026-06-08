import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagoFormComponent } from '../../components/pago-form/pago-form.component';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, PagoFormComponent],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit {
  pagos: any[] = [];
  showForm = false;

  ngOnInit() {
    this.loadPagos();
  }

  loadPagos() {
    this.pagos = [];
  }

  onFormSubmit(data: any) {
    this.showForm = false;
    this.loadPagos();
  }
}
