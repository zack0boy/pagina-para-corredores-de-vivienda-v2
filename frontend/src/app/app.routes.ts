import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PropiedadesComponent } from './pages/propiedades/propiedades.component';
import { LeadsComponent } from './pages/leads/leads.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { VisitasComponent } from './pages/visitas/visitas.component';
import { ContratosComponent } from './pages/contratos/contratos.component';
import { PagosComponent } from './pages/pagos/pagos.component';
import { PortalComponent } from './pages/portal/portal.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Rutas públicas
    {path: '', component: PortalComponent },
    {path: 'portal', component: PortalComponent },
    {path: 'login', component: LoginComponent },

    // Rutas protegidas
    {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    {path: 'propiedades', component: PropiedadesComponent, canActivate: [AuthGuard] },
    {path: 'leads', component: LeadsComponent, canActivate: [AuthGuard] },
    {path: 'clientes', component: ClientesComponent, canActivate: [AuthGuard] },
    {path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
    {path: 'visitas', component: VisitasComponent, canActivate: [AuthGuard] },
    {path: 'contratos', component: ContratosComponent, canActivate: [AuthGuard] },
    {path: 'pagos', component: PagosComponent, canActivate: [AuthGuard] },

    // Ruta por defecto (wildcard)
    {path: '**', redirectTo: '' }
];
