import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notificacion, TipoNotificacion } from './entities/notificacion.entity';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
  ) {}

  // ====================================
  // CRUD Básico
  // ====================================

  async crearNotificacion(
    createNotificacionDto: CreateNotificacionDto,
  ): Promise<Notificacion> {
    const notificacion = this.notificacionRepository.create(
      createNotificacionDto,
    );
    return await this.notificacionRepository.save(notificacion);
  }

  async obtenerPorUsuario(usuario_id: string): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      where: { usuario_id },
      order: { created_at: 'DESC' },
    });
  }

  async obtenerNoLeidas(usuario_id: string): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      where: { usuario_id, leida: false },
      order: { created_at: 'DESC' },
    });
  }

  async marcarComoLeida(id: string): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOneBy({ id });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    notificacion.leida = true;
    notificacion.fecha_lectura = new Date();

    return await this.notificacionRepository.save(notificacion);
  }

  async marcarComoLeidaDeUsuario(id: string, usuario_id: string): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOneBy({ id });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notificacion.usuario_id !== usuario_id) {
      throw new ForbiddenException('No tiene acceso a esta notificación');
    }

    notificacion.leida = true;
    notificacion.fecha_lectura = new Date();

    return await this.notificacionRepository.save(notificacion);
  }

  async obtenerPorId(id: string): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOneBy({ id });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return notificacion;
  }

  // ====================================
  // Eventos - LEAD
  // ====================================

  async notificarNuevoLead(
    empresa_id: string,
    corredor_id: string,
    nombre_cliente: string,
  ): Promise<Notificacion> {
    return await this.crearNotificacion({
      empresa_id,
      usuario_id: corredor_id,
      tipo: TipoNotificacion.LEAD,
      titulo: 'Nuevo Lead',
      mensaje: `Se te ha asignado un nuevo lead: ${nombre_cliente}`,
    });
  }

  // ====================================
  // Eventos - VISITA
  // ====================================

  async notificarNuevaVisita(
    empresa_id: string,
    corredor_id: string,
    propiedad_titulo: string,
    fecha_visita: Date,
  ): Promise<Notificacion> {
    const fecha = new Date(fecha_visita).toLocaleDateString('es-CL');

    return await this.crearNotificacion({
      empresa_id,
      usuario_id: corredor_id,
      tipo: TipoNotificacion.VISITA,
      titulo: 'Nueva visita programada',
      mensaje: `Tienes una visita programada para ${fecha} en ${propiedad_titulo}`,
    });
  }

  // ====================================
  // Eventos - PAGO/CUOTA
  // ====================================

  async notificarCuotaProxima(
    empresa_id: string,
    corredor_id: string,
    numero_cuota: number,
    fecha_vencimiento: Date,
    dias_para_vencer: number,
  ): Promise<Notificacion> {
    const fecha = new Date(fecha_vencimiento).toLocaleDateString('es-CL');
    let titulo = 'Cuota próxima a vencer';
    let mensaje = `La cuota #${numero_cuota} vence el ${fecha}`;

    if (dias_para_vencer === 7) {
      titulo = 'Cuota vence en 7 días';
      mensaje = `La cuota #${numero_cuota} vence el ${fecha} (7 días)`;
    } else if (dias_para_vencer === 3) {
      titulo = 'Cuota vence en 3 días';
      mensaje = `La cuota #${numero_cuota} vence el ${fecha} (3 días)`;
    } else if (dias_para_vencer === 1) {
      titulo = 'Cuota vence mañana';
      mensaje = `La cuota #${numero_cuota} vence MAÑANA (${fecha})`;
    } else if (dias_para_vencer === 0) {
      titulo = 'Cuota vencida hoy';
      mensaje = `La cuota #${numero_cuota} venció HOY (${fecha})`;
    }

    return await this.crearNotificacion({
      empresa_id,
      usuario_id: corredor_id,
      tipo: TipoNotificacion.PAGO,
      titulo,
      mensaje,
    });
  }

  // ====================================
  // Eventos - PAGO (registro/validación)
  // ====================================

  async notificarNuevoPago(
    empresa_id: string,
    admin_id: string,
    monto: number,
    referencia: string,
  ): Promise<Notificacion> {
    return await this.crearNotificacion({
      empresa_id,
      usuario_id: admin_id,
      tipo: TipoNotificacion.PAGO,
      titulo: 'Nuevo pago registrado',
      mensaje: `Se registró un pago de $${monto} (${referencia}) pendiente de validación`,
    });
  }

  async notificarPagoValidado(
    empresa_id: string,
    corredor_id: string,
    monto: number,
    aprobado: boolean,
  ): Promise<Notificacion> {
    return await this.crearNotificacion({
      empresa_id,
      usuario_id: corredor_id,
      tipo: TipoNotificacion.PAGO,
      titulo: aprobado ? 'Pago validado' : 'Pago rechazado',
      mensaje: `Tu pago de $${monto} fue ${aprobado ? 'validado' : 'rechazado'}.`,
    });
  }

  // ====================================
  // Eventos - CONTRATO
  // ====================================

  async notificarContratoActivado(
    empresa_id: string,
    corredor_id: string,
    numero_contrato: string,
  ): Promise<Notificacion> {
    return await this.crearNotificacion({
      empresa_id,
      usuario_id: corredor_id,
      tipo: TipoNotificacion.CONTRATO,
      titulo: 'Contrato activado',
      mensaje: `El contrato ${numero_contrato} fue activado y ya está vigente.`,
    });
  }

  // ====================================
  // Eventos - SOLICITUD
  // ====================================

  async notificarNuevaSolicitud(
    empresa_id: string,
    usuario_id: string,
    detalle: string,
  ): Promise<Notificacion> {
    return await this.crearNotificacion({
      empresa_id,
      usuario_id,
      tipo: TipoNotificacion.SOLICITUD,
      titulo: 'Nueva solicitud de cliente',
      mensaje: detalle,
    });
  }

  // ====================================
  // Limpieza
  // ====================================

  async eliminarNotificacionesAntiguasPorUsuario(
    usuario_id: string,
    diasRetener: number = 30,
  ): Promise<number> {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasRetener);

    const resultado = await this.notificacionRepository
      .createQueryBuilder()
      .delete()
      .where('usuario_id = :usuario_id', { usuario_id })
      .andWhere('created_at < :fecha', { fecha })
      .execute();

    return resultado.affected || 0;
  }
}
