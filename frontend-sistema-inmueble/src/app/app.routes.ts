import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { withInMemoryScrolling } from '@angular/router';



export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Home },
    { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
    { path: 'propiedades', loadComponent: () => import('./pages/propiedades/propiedades').then(m => m.PropiedadesComponent) },
    { path: 'propiedad/:id', loadComponent: () => import('./pages/detalle-propiedad/detalle-propiedad').then(m => m.DetallePropiedad) },
    { path: 'registro', loadComponent: () => import('./pages/registro/registro').then(m => m.Registro) },
    { path: 'recuperar-contraseña', loadComponent: () => import('./pages/recuperacionpassword/recuperacionpassword').then(m => m.Recuperacionpassword) },
    { path: 'perfil-usuario', loadComponent: () => import('./perfil-usuario/perfil-usuario').then(m => m.PerfilUsuario) },
    { path: 'dashboards', loadComponent: () => import('./dashboards/dashboards').then(m => m.Dashboards) },
    { path: 'dashboards/corredor', loadComponent: () => import('./dashboards/dashboard-corredor').then(m => m.DashboardCorredor) },
    { path: 'dashboards/admin', loadComponent: () => import('./dashboards/dashboard-admin').then(m => m.DashboardAdmin) },
    { path: 'corredor', loadComponent: () => import('./pages/corredor/corredor').then(m => m.Corredor) },
    { path: 'corredor/gestion', loadComponent: () => import('./pages/corredor/gestion').then(m => m.CorredorGestion) },
    { path: 'corredor/nueva-propiedad', loadComponent: () => import('./pages/corredor/nueva-propiedad/nueva-propiedad').then(m => m.NuevaPropiedad) },
    { path: 'corredor/solicitudes', loadComponent: () => import('./pages/corredor/solicitudes/solicitudes').then(m => m.SolicitudesCorredor) },
    { path: 'corredor/calendario', loadComponent: () => import('./pages/corredor/calendario/calendario').then(m => m.CalendarioCorredor) },
    { path: 'corredor/pagos', loadComponent: () => import('./pages/corredor/pagos/pagos').then(m => m.PagosCorredor) },
    { path: 'corredor/solicitudes-propiedad', loadComponent: () => import('./pages/corredor/solicitudes-propiedad/solicitudes-propiedad').then(m => m.SolicitudesPropiedadCorredor) },
    { path: 'corredor/perfil', loadComponent: () => import('./pages/corredor/perfil/perfil').then(m => m.PerfilCorredor) },
    { path: 'corredor/editar/:id', loadComponent: () => import('./pages/corredor/editar-propiedad/editar-propiedad').then(m => m.EditarPropiedad) },
    { path: 'corredor/historial', loadComponent: () => import('./pages/corredor/historial/historial').then(m => m.HistorialCorredor) },
    { path: 'publicar-propiedad', loadComponent: () => import('./pages/publicar-solicitud/publicar-solicitud').then(m => m.PublicarSolicitud) },
    { path: 'perfil-usuario/pagos', loadComponent: () => import('./perfil-usuario/pago-usuario/pago-usuario').then(m => m.PagoUsuario) },
    { path: 'dashboards/listar', loadComponent:() => import('./dashboards/listar-propietarios/listar').then(m => m.ListarPropietariosComponent) },
];
