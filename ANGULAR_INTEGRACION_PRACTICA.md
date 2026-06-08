# ANGULAR - INTEGRACIÓN PRÁCTICA

## 🚀 PASO 1: Generar el Servicio

```bash
cd frontend
ng generate service services/api
```

---

## 📝 PASO 2: Crear API Service

**Archivo:** `frontend/src/app/services/api.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';
  private token: string = '';

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  // ==================== AUTH ====================
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  loadToken(): void {
    this.token = localStorage.getItem('token') || '';
  }

  getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  // ==================== USERS ====================
  createCliente(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/clientes`, data, {
      headers: this.getHeaders()
    });
  }

  getClientes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/clientes`, {
      headers: this.getHeaders()
    });
  }

  getClienteById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/clientes/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateCliente(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/clientes/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  // ==================== EMPRESAS ====================
  createEmpresa(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/empresas`, data, {
      headers: this.getHeaders()
    });
  }

  getEmpresas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/empresas`, {
      headers: this.getHeaders()
    });
  }

  updateEmpresa(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/empresas/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteEmpresa(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/empresas/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ==================== PROPIEDADES ====================
  createPropiedad(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/propiedades`, data, {
      headers: this.getHeaders()
    });
  }

  getPropiedades(): Observable<any> {
    return this.http.get(`${this.baseUrl}/propiedades`, {
      headers: this.getHeaders()
    });
  }

  getPropiedadById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/propiedades/${id}`, {
      headers: this.getHeaders()
    });
  }

  updatePropiedad(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/propiedades/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deletePropiedad(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/propiedades/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ==================== PROPIEDAD-IMAGEN ====================
  uploadImagenPropiedad(propiedadId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.baseUrl}/propiedad-imagen/${propiedadId}`,
      formData,
      { headers: new HttpHeaders({ 'Authorization': `Bearer ${this.token}` }) }
    );
  }

  getImagenesPropiedad(propiedadId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/propiedad-imagen?propiedad_id=${propiedadId}`,
      { headers: this.getHeaders() }
    );
  }

  deleteImagen(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/propiedad-imagen/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ==================== LEADS ====================
  createLead(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/leads`, data, {
      headers: this.getHeaders()
    });
  }

  getLeads(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leads`, {
      headers: this.getHeaders()
    });
  }

  updateLead(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/leads/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  assignCorredorToLead(leadId: string, corredor_id: string): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/leads/${leadId}/reassign-corredor`,
      { corredor_id },
      { headers: this.getHeaders() }
    );
  }

  // ==================== VISITAS ====================
  createVisita(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/visitas`, data, {
      headers: this.getHeaders()
    });
  }

  getVisitas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/visitas`, {
      headers: this.getHeaders()
    });
  }

  confirmarVisita(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/visitas/${id}/confirmar`, data, {
      headers: this.getHeaders()
    });
  }

  marcarVisitaRealizada(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/visitas/${id}/realizada`, data, {
      headers: this.getHeaders()
    });
  }

  cancelarVisita(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/visitas/${id}/cancelar`, {}, {
      headers: this.getHeaders()
    });
  }

  // ==================== CONTRATOS ====================
  createContrato(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/contratos`, data, {
      headers: this.getHeaders()
    });
  }

  getContratos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/contratos`, {
      headers: this.getHeaders()
    });
  }

  getContratoById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/contratos/${id}`, {
      headers: this.getHeaders()
    });
  }

  activarContrato(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/contratos/${id}/activar`, data, {
      headers: this.getHeaders()
    });
  }

  finalizarContrato(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/contratos/${id}/finalizar`, data, {
      headers: this.getHeaders()
    });
  }

  // ==================== CUOTAS ====================
  createCuota(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cuotas`, data, {
      headers: this.getHeaders()
    });
  }

  getCuotasPendientes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cuotas/pendientes/listado`, {
      headers: this.getHeaders()
    });
  }

  marcarCuotaPagada(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/cuotas/${id}/pago`, data, {
      headers: this.getHeaders()
    });
  }

  // ==================== EMAILS ====================
  sendTestEmail(): Observable<any> {
    return this.http.post(`${this.baseUrl}/emails/test`, {});
  }

  sendEmail(destinatario: string, asunto: string, contenido: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/emails/enviar`, {
      destinatario,
      asunto,
      contenido
    });
  }

  sendEmailWithTemplate(
    destinatario: string,
    asunto: string,
    contenido: string,
    variables: any
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/emails/plantilla`, {
      destinatario,
      asunto,
      contenido,
      variables
    });
  }

  getEmailNotificationTypes(): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/emails/tipos`, {});
  }

  sendNotification(destinatario: string, tipo: string, variables: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/emails/notificacion`, {
      destinatario,
      tipo,
      variables
    });
  }
}
```

---

## 🔐 PASO 3: Crear Login Component

**Generar:**
```bash
ng generate component components/login
```

**Archivo:** `frontend/src/app/components/login/login.component.ts`

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = '';

    this.api.login(this.form.value.email, this.form.value.password).subscribe({
      next: (res) => {
        this.api.setToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Error al iniciar sesión';
      }
    });
  }
}
```

**Archivo:** `frontend/src/app/components/login/login.component.html`

```html
<div class="login-container">
  <div class="login-box">
    <h1>Iniciar Sesión</h1>
    
    <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

    <form [formGroup]="form" (ngSubmit)="login()">
      <div class="form-group">
        <label>Email</label>
        <input type="email" class="form-control" formControlName="email" />
      </div>

      <div class="form-group">
        <label>Contraseña</label>
        <input type="password" class="form-control" formControlName="password" />
      </div>

      <button type="submit" class="btn btn-primary" [disabled]="loading || form.invalid">
        {{ loading ? 'Cargando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</div>
```

---

## 📋 PASO 4: Crear Propiedades Component

**Generar:**
```bash
ng generate component components/propiedades
```

**Archivo:** `frontend/src/app/components/propiedades/propiedades.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-propiedades',
  templateUrl: './propiedades.component.html',
  styleUrls: ['./propiedades.component.css']
})
export class PropiedadesComponent implements OnInit {
  propiedades: any[] = [];
  form: FormGroup;
  loading = false;
  error = '';
  success = '';
  showForm = false;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      precio: ['', Validators.required],
      direccion: ['', Validators.required],
      ciudad: ['', Validators.required],
      tipo: ['', Validators.required],
      dormitorios: ['', Validators.required],
      banos: ['', Validators.required],
      area: ['', Validators.required],
      descripcion: ['']
    });
  }

  ngOnInit(): void {
    this.loadPropiedades();
  }

  loadPropiedades(): void {
    this.api.getPropiedades().subscribe({
      next: (data) => {
        this.propiedades = data;
      },
      error: (err) => {
        this.error = 'Error al cargar propiedades';
      }
    });
  }

  createPropiedad(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.api.createPropiedad(this.form.value).subscribe({
      next: () => {
        this.success = 'Propiedad creada correctamente';
        this.form.reset();
        this.showForm = false;
        this.loadPropiedades();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al crear propiedad';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  deletePropiedad(id: string): void {
    if (!confirm('¿Eliminar esta propiedad?')) return;

    this.api.deletePropiedad(id).subscribe({
      next: () => {
        this.success = 'Propiedad eliminada';
        this.loadPropiedades();
      },
      error: (err) => {
        this.error = 'Error al eliminar propiedad';
      }
    });
  }
}
```

**Archivo:** `frontend/src/app/components/propiedades/propiedades.component.html`

```html
<div class="container">
  <h1>Propiedades</h1>

  <div *ngIf="success" class="alert alert-success">{{ success }}</div>
  <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

  <button class="btn btn-primary" (click)="showForm = !showForm">
    {{ showForm ? 'Cancelar' : 'Nueva Propiedad' }}
  </button>

  <!-- Formulario -->
  <div *ngIf="showForm" class="form-section">
    <form [formGroup]="form" (ngSubmit)="createPropiedad()">
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label>Título</label>
            <input type="text" class="form-control" formControlName="titulo" />
          </div>
          <div class="form-group">
            <label>Precio</label>
            <input type="number" class="form-control" formControlName="precio" />
          </div>
          <div class="form-group">
            <label>Dirección</label>
            <input type="text" class="form-control" formControlName="direccion" />
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label>Dormitorios</label>
            <input type="number" class="form-control" formControlName="dormitorios" />
          </div>
          <div class="form-group">
            <label>Baños</label>
            <input type="number" class="form-control" formControlName="banos" />
          </div>
          <div class="form-group">
            <label>Área (m²)</label>
            <input type="number" class="form-control" formControlName="area" />
          </div>
        </div>
      </div>

      <button type="submit" class="btn btn-success" [disabled]="loading">
        {{ loading ? 'Guardando...' : 'Guardar' }}
      </button>
    </form>
  </div>

  <!-- Lista -->
  <div class="properties-grid">
    <div *ngFor="let prop of propiedades" class="property-card">
      <h3>{{ prop.titulo }}</h3>
      <p><strong>Precio:</strong> ${{ prop.precio | number }}</p>
      <p><strong>Dirección:</strong> {{ prop.direccion }}</p>
      <p><strong>{{ prop.dormitorios }} Dorm. | {{ prop.banos }} Baños | {{ prop.area }} m²</strong></p>
      <button class="btn btn-danger btn-sm" (click)="deletePropiedad(prop.id)">
        Eliminar
      </button>
    </div>
  </div>
</div>
```

---

## 📧 PASO 5: Crear Email Component

**Generar:**
```bash
ng generate component components/enviar-email
```

**Archivo:** `frontend/src/app/components/enviar-email/enviar-email.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-enviar-email',
  templateUrl: './enviar-email.component.html',
  styleUrls: ['./enviar-email.component.css']
})
export class EnviarEmailComponent implements OnInit {
  form: FormGroup;
  notificationForm: FormGroup;
  loading = false;
  success = '';
  error = '';
  notificationTypes: string[] = [];
  selectedType: string = '';
  typeVariablesMap: any = {
    'RECORDATORIO_VISITA': ['propiedad', 'fecha'],
    'PAGO_VENCIDO': ['numero_cuota', 'monto'],
    'PAGO_PROXIMO': ['fecha', 'monto'],
    'NUEVA_PROPIEDAD': ['titulo'],
    'NUEVO_LEAD': ['nombre_cliente']
  };

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      destinatario: ['', [Validators.required, Validators.email]],
      asunto: ['', Validators.required],
      contenido: ['', Validators.required]
    });

    this.notificationForm = this.fb.group({
      destinatario: ['', [Validators.required, Validators.email]],
      tipo: ['', Validators.required],
      variables: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.api.getEmailNotificationTypes().subscribe({
      next: (types) => {
        this.notificationTypes = types;
      }
    });

    this.notificationForm.get('tipo')?.valueChanges.subscribe((tipo) => {
      this.updateVariablesForm(tipo);
    });
  }

  sendEmail(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const { destinatario, asunto, contenido } = this.form.value;

    this.api.sendEmail(destinatario, asunto, contenido).subscribe({
      next: () => {
        this.success = 'Email enviado correctamente';
        this.form.reset();
      },
      error: (err) => {
        this.error = err.message;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  sendNotification(): void {
    if (this.notificationForm.invalid) return;

    this.loading = true;
    const { destinatario, tipo } = this.notificationForm.value;
    
    const variables: any = {};
    (this.notificationForm.get('variables') as FormArray).value.forEach((v: any) => {
      variables[v.key] = v.value;
    });

    this.api.sendNotification(destinatario, tipo, variables).subscribe({
      next: () => {
        this.success = 'Notificación enviada correctamente';
        this.notificationForm.reset();
      },
      error: (err) => {
        this.error = err.message;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private updateVariablesForm(tipo: string): void {
    const variablesArray = this.notificationForm.get('variables') as FormArray;
    variablesArray.clear();

    const variables = this.typeVariablesMap[tipo] || [];
    variables.forEach((v: string) => {
      variablesArray.push(
        this.fb.group({
          key: [v],
          value: ['', Validators.required]
        })
      );
    });
  }

  get variables(): FormArray {
    return this.notificationForm.get('variables') as FormArray;
  }
}
```

**Archivo:** `frontend/src/app/components/enviar-email/enviar-email.component.html`

```html
<div class="container">
  <h1>Enviar Emails</h1>

  <div *ngIf="success" class="alert alert-success">{{ success }}</div>
  <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

  <!-- TAB 1: Email Manual -->
  <div class="card">
    <h2>Email Manual</h2>
    <form [formGroup]="form" (ngSubmit)="sendEmail()">
      <div class="form-group">
        <label>Destinatario</label>
        <input type="email" class="form-control" formControlName="destinatario" />
      </div>
      <div class="form-group">
        <label>Asunto</label>
        <input type="text" class="form-control" formControlName="asunto" />
      </div>
      <div class="form-group">
        <label>Contenido (HTML)</label>
        <textarea class="form-control" rows="5" formControlName="contenido"></textarea>
      </div>
      <button type="submit" class="btn btn-primary" [disabled]="loading">
        {{ loading ? 'Enviando...' : 'Enviar' }}
      </button>
    </form>
  </div>

  <!-- TAB 2: Notificación -->
  <div class="card">
    <h2>Notificación Predefinida</h2>
    <form [formGroup]="notificationForm" (ngSubmit)="sendNotification()">
      <div class="form-group">
        <label>Destinatario</label>
        <input type="email" class="form-control" formControlName="destinatario" />
      </div>
      <div class="form-group">
        <label>Tipo</label>
        <select class="form-control" formControlName="tipo">
          <option value="">-- Selecciona --</option>
          <option *ngFor="let type of notificationTypes" [value]="type">{{ type }}</option>
        </select>
      </div>

      <div formArrayName="variables">
        <div *ngFor="let variable of variables.controls; let i = index" [formGroupName]="i" class="form-group">
          <label>{{ variable.get('key')?.value }}</label>
          <input type="text" class="form-control" formControlName="value" />
        </div>
      </div>

      <button type="submit" class="btn btn-primary" [disabled]="loading">
        {{ loading ? 'Enviando...' : 'Enviar Notificación' }}
      </button>
    </form>
  </div>
</div>
```

---

## 🔗 PASO 6: Actualizar App Module

**Archivo:** `frontend/src/app/app.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { PropiedadesComponent } from './components/propiedades/propiedades.component';
import { EnviarEmailComponent } from './components/enviar-email/enviar-email.component';
import { ApiService } from './services/api.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PropiedadesComponent,
    EnviarEmailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## 🛣️ PASO 7: Configurar Rutas

**Archivo:** `frontend/src/app/app-routing.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PropiedadesComponent } from './components/propiedades/propiedades.component';
import { EnviarEmailComponent } from './components/enviar-email/enviar-email.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'propiedades', component: PropiedadesComponent },
  { path: 'emails', component: EnviarEmailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

---

## 🚀 PASO 8: Crear Guard para Autenticación

**Generar:**
```bash
ng generate guard guards/auth
```

**Archivo:** `frontend/src/app/guards/auth.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    
    if (token) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
```

**Actualizar rutas:**
```typescript
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'propiedades', component: PropiedadesComponent, canActivate: [AuthGuard] },
  { path: 'emails', component: EnviarEmailComponent, canActivate: [AuthGuard] }
];
```

---

## 📱 PASO 9: Crear Navbar

**Archivo:** `frontend/src/app/components/navbar/navbar.component.ts`

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(private router: Router) { }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
```

**Archivo:** `frontend/src/app/components/navbar/navbar.component.html`

```html
<nav class="navbar">
  <div class="navbar-brand">
    <h2>Sistema Inmobiliario</h2>
  </div>
  
  <div class="navbar-menu">
    <a routerLink="/propiedades" routerLinkActive="active">Propiedades</a>
    <a routerLink="/emails" routerLinkActive="active">Emails</a>
    <button class="btn btn-logout" (click)="logout()">Cerrar Sesión</button>
  </div>
</nav>

<div class="navbar-spacer"></div>
```

---

## 🎨 PASO 10: Actualizar App Component

**Archivo:** `frontend/src/app/app.component.html`

```html
<app-navbar *ngIf="isLoggedIn"></app-navbar>
<router-outlet></router-outlet>
```

**Archivo:** `frontend/src/app/app.component.ts`

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoggedIn = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isLoggedIn = localStorage.getItem('token') !== null;
    });
  }
}
```

---

## 🎯 USO RÁPIDO

### 1. Iniciar Sesión
```
http://localhost:4200/login
Email: usuario_test@gmail.com
Password: Password123!
```

### 2. Ver/Crear Propiedades
```
http://localhost:4200/propiedades
```

### 3. Enviar Emails
```
http://localhost:4200/emails
```

---

## ✅ CHECKLIST

- [ ] npm install en frontend
- [ ] Backend corriendo en :3000
- [ ] ng serve en frontend (:4200)
- [ ] Login funciona
- [ ] Navegar a propiedades funciona
- [ ] Crear propiedad funciona
- [ ] Enviar email funciona
- [ ] Recibir email en Gmail
- [ ] Variables en email se reemplazan

---

## 🐛 ERRORES

| Error | Solución |
|-------|----------|
| CORS error | Configurar CORS en backend `app.enableCors()` |
| 401 en requests | Token no está siendo enviado, revisar localStorage |
| Email no llega | Revisar que SMTP_USER/PASS sean correctos en .env backend |
| Form inválido | Revisar validaciones en FormGroup |

---

## 💡 PRÓXIMAS CARACTERÍSTICAS

```typescript
// Service para clientes
getClientesConPropiedades(): Observable<any> { }

// Service para visitas
getVisitasCalendar(): Observable<any> { }

// Service para reportes
getReporteVentas(): Observable<any> { }
```
