import { Injectable, NotFoundException } from '@nestjs/common';
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
    cliente_id: string,
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
    }

    return await this.crearNotificacion({
      empresa_id,
      usuario_id: cliente_id,
      tipo: TipoNotificacion.PAGO,
      titulo,
      mensaje,
    });
  }

  // ====================================
  // Validación de Cuotas por Vencer
  // ====================================

  async obtenerCuotasProximas(): Promise<any[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const proximosDias = [1, 3, 7];
    const cuotasProximas = [];

    for (const dias of proximosDias) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + dias);

      const cuotas = await this.notificacionRepository.query(`
        SELECT c.id, c.numero_cuota, c.fecha_vencimiento, co.cliente_id, co.empresa_id
        FROM cuotas c
        JOIN contratos co ON c.contrato_id = co.id
        WHERE DATE(c.fecha_vencimiento) = DATE($1)
        AND c.estado IN ('PENDIENTE', 'PARCIAL')
      `, [fecha]);

      cuotasProximas.push(...cuotas.map(c => ({ ...c, dias })));
    }

    return cuotasProximas;
  }

  async crearNotificacionesCuotasProximas(): Promise<number> {
    const cuotas = await this.obtenerCuotasProximas();
    let creadas = 0;

    for (const cuota of cuotas) {
      await this.notificarCuotaProxima(
        cuota.empresa_id,
        cuota.cliente_id,
        cuota.numero_cuota,
        cuota.fecha_vencimiento,
        cuota.dias,
      );
      creadas++;
    }

    return creadas;
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
