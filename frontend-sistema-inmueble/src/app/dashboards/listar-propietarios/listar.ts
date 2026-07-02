import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UsersService } from '../../services/listar-ususarios';
import { AuthService } from '../../services/auth';
import { AsignaCorredorService } from '../../services/asigna-corredor';
import { Navbar } from "../../components/navbar/navbar";

@Component({
  selector: 'app-listar-propietarios',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, RouterLink, RouterLinkActive],
  templateUrl: './listar.html',
  styleUrls: ['./listar.css']
})
export class ListarPropietariosComponent implements OnInit {

  usuarios: any[] = [];
  loading: boolean = false;
  tipoUsuario: 'clientes' | 'corredores' | 'admins' | 'superadmins' = 'clientes';
  paginaActual: number = 1;
  tamanoPagina: number = 10;
  
  // Modal
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  usuarioSeleccionado: any = null;
  formUsuario: any = {
    nombre: '',
    email: '',
    telefono: '',
    descripcion: ''
  };

  // Confirmación eliminar
  mostrarConfirmEliminar: boolean = false;
  usuarioParaEliminar: any = null;

  // Modal convertir a corredor
  mostrarModalConvertirCorredor: boolean = false;
  usuarioParaConvertir: any = null;
  mostrarConfirmConvertirCorredor: boolean = false;
  usuarioParaConfirmarConversion: any = null;
  empresaSeleccionada: string = '';
  licenciaProfesionalConversion: string = '';
  descripcionConversion: string = '';
  empresas: any[] = [];
  usuarioActual: any = null;
  esSuperAdmin: boolean = false;

  puedeEditarUsuarios(): boolean {
    return !this.esSuperAdmin;
  }

  puedeNominarAdmin(): boolean {
    return this.esSuperAdmin;
  }

  constructor(
    private usersService: UsersService, 
    private authService: AuthService,
    private asignaCorredorService: AsignaCorredorService,
    private cdr: ChangeDetectorRef
  ) {}

  // Modal nominar admin (solo SUPER_ADMIN)
  mostrarModalNominarAdmin: boolean = false;
  usuarioParaNominar: any = null;
  empresaNominacion: string = '';

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
    const rol = (this.usuarioActual?.rol || this.usuarioActual?.rolUsuario || this.usuarioActual?.role || '').toString().toUpperCase();
    this.esSuperAdmin = rol === 'SUPER_ADMIN';

    // Cargar empresas (se usan para convertir a corredor y nominar admins)
    this.asignaCorredorService.obtenerEmpresas().subscribe({
      next: (data: any) => {
        this.empresas = Array.isArray(data) ? data : data?.data ?? [];
      },
      error: (e) => console.error('Error cargando empresas:', e)
    });

    this.cargarUsuarios();
  }

  //=========================
  // CARGAR USUARIOS
  //=========================

  cargarUsuarios(): void {
    this.loading = true;
    this.cdr.markForCheck();
    console.log('Iniciando carga de', this.tipoUsuario);
    
    const servicio =
      this.tipoUsuario === 'clientes' ? this.usersService.getAllClientes()
      : this.tipoUsuario === 'corredores' ? this.usersService.getAllCorredores()
      : this.tipoUsuario === 'admins' ? this.usersService.getAdmins()
      : this.usersService.getSuperAdmins();

    servicio.subscribe({
      next: (response: any) => {
        console.log('Respuesta completa de ' + this.tipoUsuario + ':', response);
        
        let usuarios: any[] = [];
        
        // Extraer el array dependiendo de la estructura de respuesta
        if (response && response.data && Array.isArray(response.data)) {
          usuarios = response.data;
          console.log(`✅ Se cargaron ${response.data.length} ${this.tipoUsuario}`);
        } else if (Array.isArray(response)) {
          usuarios = response;
          // Se cargaron usuarios
        } else {
          console.warn('⚠️ Respuesta no es un array:', response);
          usuarios = [];
        }
        
        // Mapear datos: extraer información del objeto usuario anidado si existe
        this.usuarios = usuarios.map((item: any) => {
          if (item.usuario && typeof item.usuario === 'object') {
            // Si tiene usuario anidado (corredores/clientes con perfil)
            return {
              id: item.usuario.id || item.idUsuario || item.id,
              nombre: item.usuario.nombre || item.nombre || 'N/A',
              email: item.usuario.email || item.email || 'N/A',
              telefono: item.usuario.telefono || item.telefono || 'N/A',
              descripcion: item.descripcion || item.usuario.descripcion || 'N/A',
              createdAt: item.createdAt || item.usuario.createdAt,
              rol: item.usuario.rol,
              ...item // Mantener otros campos originales
            };
          }
          // Si no tiene usuario anidado, retornar como está
          return item;
        });

        const totalPaginas = this.totalPaginas();
        if (this.paginaActual > totalPaginas) {
          this.paginaActual = totalPaginas || 1;
        }
        
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        
        this.usuarios = [];
        this.loading = false;
        this.cdr.markForCheck();
        
        if (err.status === 404) {
          console.warn('⚠️ El endpoint GET /users/' + this.tipoUsuario + ' no existe en el backend');
          alert('⚠️ El endpoint de ' + this.tipoUsuario + ' no está implementado en el backend (404)\n\nPor favor, verifica que el backend esté ejecutando correctamente.');
        } else if (err.status === 403) {
          alert('❌ No tienes permisos para acceder a ' + this.tipoUsuario);
        } else {
          alert('❌ Error al cargar ' + this.tipoUsuario + ': ' + (err.message || 'Error desconocido'));
        }
      }
    });
  }

  puedeEditar(): boolean {
    if (this.tipoUsuario === 'superadmins') return false;
    if (this.tipoUsuario === 'admins') return this.esSuperAdmin;
    return true;
  }

  cambiarTipoUsuario(tipo: 'clientes' | 'corredores' | 'admins' | 'superadmins'): void {
    this.tipoUsuario = tipo;
    this.paginaActual = 1;
    this.cdr.markForCheck();
    this.cargarUsuarios();
    this.cerrarModal();
  }

  usuariosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.tamanoPagina;
    return this.usuarios.slice(inicio, inicio + this.tamanoPagina);
  }

  totalPaginas(): number {
    return Math.max(1, Math.ceil(this.usuarios.length / this.tamanoPagina));
  }

  cambiarPagina(pagina: number): void {
    const total = this.totalPaginas();
    if (pagina < 1 || pagina > total) return;
    this.paginaActual = pagina;
    this.cdr.markForCheck();
  }

  paginasVisibles(): number[] {
    const total = this.totalPaginas();
    const maxVisibles = 5;
    const mitad = Math.floor(maxVisibles / 2);

    let inicio = Math.max(1, this.paginaActual - mitad);
    let fin = Math.min(total, inicio + maxVisibles - 1);

    if (fin - inicio + 1 < maxVisibles) {
      inicio = Math.max(1, fin - maxVisibles + 1);
    }

    const paginas: number[] = [];
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  //=========================
  // VER DETALLES
  //=========================

  verDetalles(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.modoEdicion = false;
    this.mostrarModal = true;
  }

  //=========================
  // EDITAR
  //=========================

  abrirEditar(usuario: any): void {
    this.usuarioSeleccionado = usuario;
    this.modoEdicion = true;
    this.formUsuario = {
      nombre: usuario.nombre || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      descripcion: usuario.descripcion || ''
    };
    this.mostrarModal = true;
  }

  guardarCambios(): void {
    if (!this.usuarioSeleccionado || !this.usuarioSeleccionado.id) {
      alert('Error: Usuario no identificado');
      return;
    }

    this.loading = true;
    
    // Cada tipo de usuario acepta campos distintos (el backend rechaza los que sobran)
    const datosActualizados =
      this.tipoUsuario === 'clientes' || this.tipoUsuario === 'admins'
      ? {
          nombre: this.formUsuario.nombre,
          email: this.formUsuario.email,
          telefono: this.formUsuario.telefono,
        }
      : {
          nombre: this.formUsuario.nombre,
          licenciaProfesional: this.formUsuario.licenciaProfesional,
          descripcion: this.formUsuario.descripcion,
        };

    const servicio =
      this.tipoUsuario === 'clientes' ? this.usersService.updateCliente(this.usuarioSeleccionado.id, datosActualizados)
      : this.tipoUsuario === 'admins' ? this.usersService.updateAdmin(this.usuarioSeleccionado.id, datosActualizados)
      : this.usersService.updateCorredor(this.usuarioSeleccionado.id, datosActualizados);

    servicio.subscribe({
      next: (data: any) => {
        alert('Usuario actualizado exitosamente');
        this.loading = false;
        this.cdr.markForCheck();
        this.cerrarModal();
        this.cargarUsuarios();
      },
      error: (err: any) => {
        console.error('Error actualizando usuario', err);
        console.error('Respuesta del servidor:', err.error);
        this.loading = false;
        this.cdr.markForCheck();
        alert('Error al actualizar usuario: ' + (err.error?.message || err.statusText));
      }
    });
  }

  //=========================
  // ELIMINAR
  //=========================

  confirmarEliminar(usuario: any): void {
    this.usuarioParaEliminar = usuario;
    this.mostrarConfirmEliminar = true;
  }

  eliminarUsuario(): void {
    if (!this.usuarioParaEliminar || !this.usuarioParaEliminar.id) {
      alert('❌ Error: Usuario no identificado');
      return;
    }

    const nombreUsuario = this.usuarioParaEliminar.nombre || 'desconocido';
    const idUsuario = this.usuarioParaEliminar.id;
    
    console.log(`🗑️ Eliminando ${this.tipoUsuario}: ${nombreUsuario} (${idUsuario})`);
    this.loading = true;
    this.cdr.markForCheck();
    
    const servicio = this.tipoUsuario === 'clientes'
      ? this.usersService.deleteCliente(idUsuario)
      : this.usersService.deleteCorredor(idUsuario);

    servicio.subscribe({
      next: (response: any) => {
        console.log(`✅ ${this.tipoUsuario.charAt(0).toUpperCase() + this.tipoUsuario.slice(1)} eliminado:`, response);
        alert(`✅ ${nombreUsuario} ha sido eliminado exitosamente`);
        
        // Cerrar modal de confirmación
        this.mostrarConfirmEliminar = false;
        this.usuarioParaEliminar = null;
        
        // Recargar la lista
        this.loading = false;
        this.cdr.markForCheck();
        this.cargarUsuarios();
      },
      error: (err: any) => {
        console.error(`❌ Error eliminando ${this.tipoUsuario}:`, err);
        console.error('Status HTTP:', err.status);
        console.error('Error details:', err.error);
        
        this.loading = false;
        this.cdr.markForCheck();
        
        let mensajeError = 'Error al eliminar usuario';
        
        if (err.status === 0) {
          mensajeError = '❌ No hay conexión con el servidor';
        } else if (err.status === 400) {
          mensajeError = '❌ Solicitud inválida: ' + (err.error?.message || 'Datos incorrectos');
        } else if (err.status === 403) {
          mensajeError = '❌ No tienes permisos para eliminar este usuario';
        } else if (err.status === 404) {
          mensajeError = '❌ El usuario no existe o ya fue eliminado';
        } else if (err.status === 409) {
          mensajeError = '⚠️ No se puede eliminar: El usuario tiene datos relacionados';
        } else if (err.status >= 500) {
          mensajeError = '❌ Error del servidor: ' + (err.error?.message || err.statusText);
        } else {
          mensajeError = '❌ ' + (err.error?.message || err.statusText || 'Error desconocido');
        }
        
        alert(mensajeError);
      }
    });
  }

  cancelarEliminar(): void {
    this.mostrarConfirmEliminar = false;
    this.usuarioParaEliminar = null;
  }

  //=========================
  // BLOQUEAR / DESBLOQUEAR CLIENTE
  //=========================

  toggleBloqueoCliente(usuario: any): void {
    const bloquear = usuario.activo !== false;
    const accion = bloquear ? 'bloquear' : 'desbloquear';

    if (!confirm(`¿Seguro que deseas ${accion} a ${usuario.nombre}?`)) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.usersService.bloquearCliente(usuario.id, !bloquear).subscribe({
      next: () => {
        alert(`✅ ${usuario.nombre} ha sido ${bloquear ? 'bloqueado' : 'desbloqueado'}`);
        this.loading = false;
        this.cdr.markForCheck();
        this.cargarUsuarios();
      },
      error: (err: any) => {
        this.loading = false;
        this.cdr.markForCheck();
        alert('❌ Error al ' + accion + ': ' + (err.error?.message || err.statusText));
      }
    });
  }

  //=========================
  // SUBIR ADMIN A SUPER ADMIN (SUPER_ADMIN)
  //=========================

  subirASuperAdmin(usuario: any): void {
    if (!confirm(`¿Estás seguro de subir a ${usuario.nombre} a SUPER ADMIN?\n\nTendrá acceso total al sistema, incluyendo todas las empresas.`)) {
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.usersService.promoverSuperAdmin(usuario.id).subscribe({
      next: () => {
        alert('✅ ' + usuario.nombre + ' ahora es SUPER ADMIN');
        this.loading = false;
        this.cdr.markForCheck();
        this.cargarUsuarios();
      },
      error: (err: any) => {
        this.loading = false;
        this.cdr.markForCheck();
        alert('❌ Error al subir a super admin: ' + (err.error?.message || err.statusText));
      }
    });
  }

  //=========================
  // NOMINAR CORREDOR COMO ADMIN (SUPER_ADMIN)
  //=========================

  abrirModalNominarAdmin(usuario: any): void {
    this.usuarioParaNominar = usuario;
    this.empresaNominacion = '';
    this.mostrarModalNominarAdmin = true;
  }

  cerrarModalNominarAdmin(): void {
    this.mostrarModalNominarAdmin = false;
    this.usuarioParaNominar = null;
    this.empresaNominacion = '';
  }

  nominarAdmin(): void {
    if (!this.usuarioParaNominar?.id) {
      alert('❌ Error: Usuario no identificado');
      return;
    }
    if (!this.empresaNominacion) {
      alert('❌ Por favor selecciona una empresa');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.usersService.promoverAdmin(this.usuarioParaNominar.id, this.empresaNominacion).subscribe({
      next: () => {
        alert('✅ ' + this.usuarioParaNominar.nombre + ' ahora es administrador de la empresa');
        this.loading = false;
        this.cdr.markForCheck();
        this.cerrarModalNominarAdmin();
        this.cargarUsuarios();
      },
      error: (err: any) => {
        this.loading = false;
        this.cdr.markForCheck();
        alert('❌ Error al nominar admin: ' + (err.error?.message || err.statusText));
      }
    });
  }

  //=========================
  // CONVERTIR CLIENTE A CORREDOR
  //=========================

  abrirModalConvertirCorredor(usuario: any): void {
    if (!this.esSuperAdmin) {
      this.usuarioParaConfirmarConversion = usuario;
      this.mostrarConfirmConvertirCorredor = true;
      return;
    }

    this.usuarioParaConvertir = usuario;
    this.empresaSeleccionada = '';
    this.licenciaProfesionalConversion = '';
    this.descripcionConversion = '';
    this.mostrarModalConvertirCorredor = true;
  }

  cerrarModalConvertirCorredor(): void {
    this.mostrarModalConvertirCorredor = false;
    this.usuarioParaConvertir = null;
    this.empresaSeleccionada = '';
    this.licenciaProfesionalConversion = '';
    this.descripcionConversion = '';
  }

  cerrarConfirmConvertirCorredor(): void {
    this.mostrarConfirmConvertirCorredor = false;
    this.usuarioParaConfirmarConversion = null;
  }

  confirmarConvertirCorredor(): void {
    if (!this.usuarioParaConfirmarConversion) {
      return;
    }

    this.usuarioParaConvertir = this.usuarioParaConfirmarConversion;
    this.usuarioParaConfirmarConversion = null;
    this.mostrarConfirmConvertirCorredor = false;
    this.empresaSeleccionada = '';
    this.licenciaProfesionalConversion = '';
    this.descripcionConversion = '';
    this.convertirAcorredor();
  }

  convertirAcorredor(): void {
    if (!this.usuarioParaConvertir || !this.usuarioParaConvertir.id) {
      alert('❌ Error: Usuario no identificado');
      return;
    }

    // Solo el super admin elige empresa; el admin usa la suya (la resuelve el backend)
    if (this.esSuperAdmin) {
      if (!this.empresaSeleccionada) {
        alert('❌ Por favor selecciona una empresa');
        return;
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(this.empresaSeleccionada)) {
        alert('❌ El ID de empresa no es válido');
        return;
      }
    }

    this.loading = true;
    this.cdr.markForCheck();

    // Preparar datos para convertir cliente a corredor
    const datosConversion: any = {
      usuario_id: this.usuarioParaConvertir.id,
      empresa_id: this.esSuperAdmin ? this.empresaSeleccionada : undefined,
      licenciaProfesional: this.licenciaProfesionalConversion?.trim() || undefined,
      descripcion: this.descripcionConversion?.trim() || undefined
    };

    this.asignaCorredorService.convertirClienteAcorredor(datosConversion).subscribe({
      next: (response: any) => {
        alert('✅ ' + this.usuarioParaConvertir.nombre + ' ha sido convertido a corredor exitosamente');
        this.loading = false;
        this.cdr.markForCheck();
        this.cerrarModalConvertirCorredor();
        this.cargarUsuarios();
      },
      error: (err: any) => {
        this.loading = false;
        this.cdr.markForCheck();

        let mensajeError = 'Error al convertir cliente a corredor';
        
        if (err.status === 0) {
          mensajeError = '❌ No hay conexión con el servidor';
        } else if (err.status === 400) {
          const errMsg = err.error?.message;
          if (Array.isArray(errMsg)) {
            mensajeError = '❌ Validación: ' + errMsg.join(', ');
          } else {
            mensajeError = '❌ Datos inválidos: ' + (errMsg || 'Verifica los datos');
          }
        } else if (err.status === 409) {
          mensajeError = '⚠️ El usuario ya es un corredor';
        } else if (err.status === 500) {
          mensajeError = '❌ Error del servidor: ' + (err.error?.message || 'Intenta más tarde');
        } else {
          mensajeError = '❌ ' + (err.error?.message || err.statusText);
        }

        alert(mensajeError);
      }
    });
  }

  //=========================
  // MODAL
  //=========================

  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
    this.modoEdicion = false;
    this.formUsuario = {
      nombre: '',
      email: '',
      telefono: '',
      descripcion: ''
    };
  }

}
