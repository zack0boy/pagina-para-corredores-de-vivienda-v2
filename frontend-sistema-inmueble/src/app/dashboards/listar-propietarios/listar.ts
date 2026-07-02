import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/listar-ususarios';
import { AuthService } from '../../services/auth';
import { AsignaCorredorService } from '../../services/asigna-corredor';
import { Navbar } from "../../components/navbar/navbar";

@Component({
  selector: 'app-listar-propietarios',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './listar.html',
  styleUrls: ['./listar.css']
})
export class ListarPropietariosComponent implements OnInit {

  usuarios: any[] = [];
  loading: boolean = false;
  tipoUsuario: 'clientes' | 'corredores' = 'clientes';
  
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
  empresaSeleccionada: string = '';
  licenciaProfesionalConversion: string = '';
  descripcionConversion: string = '';
  empresas: any[] = [];
  usuarioActual: any = null;
  esSuperAdmin: boolean = false;

  constructor(
    private usersService: UsersService, 
    private authService: AuthService,
    private asignaCorredorService: AsignaCorredorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
    this.esSuperAdmin = this.usuarioActual?.rol === 'SUPER_ADMIN';
    
    // Si es SUPER_ADMIN, cargar empresas
    if (this.esSuperAdmin) {
      this.asignaCorredorService.obtenerEmpresas().subscribe({
        next: (data: any) => {
          this.empresas = Array.isArray(data) ? data : data?.data ?? [];
        },
        error: (e) => console.error('Error cargando empresas:', e)
      });
    }
    
    this.cargarUsuarios();
  }

  //=========================
  // CARGAR USUARIOS
  //=========================

  cargarUsuarios(): void {
    this.loading = true;
    this.cdr.markForCheck();
    console.log('Iniciando carga de', this.tipoUsuario);
    
    const servicio = this.tipoUsuario === 'clientes' 
      ? this.usersService.getAllClientes()
      : this.usersService.getAllCorredores();

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
              ...item // Mantener otros campos originales
            };
          }
          // Si no tiene usuario anidado, retornar como está
          return item;
        });
        
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

  cambiarTipoUsuario(tipo: 'clientes' | 'corredores'): void {
    this.tipoUsuario = tipo;
    this.cdr.markForCheck();
    this.cargarUsuarios();
    this.cerrarModal();
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
    const datosActualizados = this.tipoUsuario === 'clientes'
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

    const servicio = this.tipoUsuario === 'clientes'
      ? this.usersService.updateCliente(this.usuarioSeleccionado.id, datosActualizados)
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
  // CONVERTIR CLIENTE A CORREDOR
  //=========================

  abrirModalConvertirCorredor(usuario: any): void {
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

  convertirAcorredor(): void {
    if (!this.usuarioParaConvertir || !this.usuarioParaConvertir.id) {
      alert('❌ Error: Usuario no identificado');
      return;
    }

    if (!this.empresaSeleccionada) {
      alert('❌ Por favor selecciona una empresa');
      return;
    }

    // Validar que empresa_id sea un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.empresaSeleccionada)) {
      alert('❌ El ID de empresa no es válido');
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    // Preparar datos para convertir cliente a corredor
    const datosConversion: any = {
      usuario_id: this.usuarioParaConvertir.id,
      empresa_id: this.empresaSeleccionada,
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