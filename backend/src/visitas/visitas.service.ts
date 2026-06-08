import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Visita } from './entities/visita.entity';
import { CreateVisitaDto } from './dto/create-visita.dto';
import { UpdateVisitaDto } from './dto/update-visita.dto';
import { EstadoVisita } from './entities/estado-visita.enum';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class VisitasService {
  constructor(
    @InjectRepository(Visita)
    private readonly visitaRepository: Repository<Visita>,

    private readonly googleCalendarService: GoogleCalendarService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async create(createVisitaDto: CreateVisitaDto): Promise<Visita> {
    let googleEventId: string | undefined;

    try {
      // Crear evento en Google Calendar
      googleEventId = await this.googleCalendarService.createEvent({
        titulo: `Visita propiedad - ${createVisitaDto.propiedad_id.substring(0, 8)}`,
        descripcion: createVisitaDto.observaciones,
        fechaInicio: new Date(createVisitaDto.fecha_inicio),
        fechaFin: new Date(createVisitaDto.fecha_fin),
      });
    } catch (error) {
      // Si Google Calendar falla, la visita igual se crea
      console.warn('Google Calendar sincronización fallida:', error);
    }

    const visita = this.visitaRepository.create({
      ...createVisitaDto,
      estado: EstadoVisita.PROGRAMADA,
      google_event_id: googleEventId,
    });

    const visitaGuardada = await this.visitaRepository.save(visita);

    // 🔔 Notificar al corredor sobre la nueva visita
    try {
      await this.notificacionesService.notificarNuevaVisita(
        createVisitaDto.empresa_id,
        createVisitaDto.corredor_id,
        `Propiedad - ${createVisitaDto.propiedad_id.substring(0, 8)}`,
        new Date(createVisitaDto.fecha_inicio),
      );
    } catch (error) {
      console.warn('Error al crear notificación de visita:', error);
    }

    return visitaGuardada;
  }

  async findAll(): Promise<Visita[]> {
    return await this.visitaRepository.find({
      order: { fecha_inicio: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Visita> {
    const visita = await this.visitaRepository.findOne({ where: { id } });

    if (!visita) {
      throw new NotFoundException('Visita no encontrada');
    }

    return visita;
  }

  async update(id: string, updateVisitaDto: UpdateVisitaDto): Promise<Visita> {
    const visita = await this.findOne(id);

    // Actualizar evento en Google Calendar si existe
    if (
      visita.google_event_id &&
      (updateVisitaDto.fecha_inicio || updateVisitaDto.fecha_fin)
    ) {
      try {
        await this.googleCalendarService.updateEvent(visita.google_event_id, {
          fechaInicio: updateVisitaDto.fecha_inicio
            ? new Date(updateVisitaDto.fecha_inicio)
            : undefined,
          fechaFin: updateVisitaDto.fecha_fin
            ? new Date(updateVisitaDto.fecha_fin)
            : undefined,
        });
      } catch (error) {
        console.warn('Error actualizando Google Calendar:', error);
        // Si falla, igual actualiza en BD
      }
    }

    Object.assign(visita, updateVisitaDto);

    return await this.visitaRepository.save(visita);
  }

  async cancelar(id: string): Promise<Visita> {
    const visita = await this.findOne(id);

    if (visita.estado === EstadoVisita.CANCELADA) {
      throw new BadRequestException('La visita ya está cancelada');
    }

    // Eliminar evento de Google Calendar
    if (visita.google_event_id) {
      try {
        await this.googleCalendarService.deleteEvent(visita.google_event_id);
      } catch (error) {
        console.warn('Error eliminando de Google Calendar:', error);
        // Si falla, igual cancela en BD
      }
    }

    visita.estado = EstadoVisita.CANCELADA;

    return await this.visitaRepository.save(visita);
  }

  async marcarRealizada(id: string): Promise<Visita> {
    const visita = await this.findOne(id);

    if (
      visita.estado !== EstadoVisita.PROGRAMADA &&
      visita.estado !== EstadoVisita.CONFIRMADA
    ) {
      throw new BadRequestException(
        'Solo se pueden marcar como realizadas visitas programadas o confirmadas',
      );
    }

    visita.estado = EstadoVisita.REALIZADA;

    return await this.visitaRepository.save(visita);
  }

  async marcarNoAsistio(id: string): Promise<Visita> {
    const visita = await this.findOne(id);

    if (
      visita.estado !== EstadoVisita.PROGRAMADA &&
      visita.estado !== EstadoVisita.CONFIRMADA
    ) {
      throw new BadRequestException(
        'Solo se pueden marcar como no asistidas visitas programadas o confirmadas',
      );
    }

    visita.estado = EstadoVisita.NO_ASISTIO;

    return await this.visitaRepository.save(visita);
  }

  async confirmar(id: string): Promise<Visita> {
    const visita = await this.findOne(id);

    if (visita.estado !== EstadoVisita.PROGRAMADA) {
      throw new BadRequestException('Solo se pueden confirmar visitas programadas');
    }

    visita.estado = EstadoVisita.CONFIRMADA;

    return await this.visitaRepository.save(visita);
  }

  async remove(id: string) {
    const visita = await this.findOne(id);

    // Eliminar de Google Calendar si existe
    if (visita.google_event_id) {
      try {
        await this.googleCalendarService.deleteEvent(visita.google_event_id);
      } catch (error) {
        console.warn('Error eliminando de Google Calendar:', error);
      }
    }

    await this.visitaRepository.remove(visita);

    return { message: 'Visita eliminada correctamente' };
  }

  async sincronizarVisita(id: string): Promise<Visita> {
    const visita = await this.findOne(id);

    if (visita.estado === EstadoVisita.CANCELADA) {
      throw new BadRequestException(
        'No se puede sincronizar una visita cancelada',
      );
    }

    try {
      if (visita.google_event_id) {
        // Si ya existe, actualizar
        await this.googleCalendarService.updateEvent(visita.google_event_id, {
          titulo: `Visita propiedad - ${visita.propiedad_id.substring(0, 8)}`,
          fechaInicio: visita.fecha_inicio,
          fechaFin: visita.fecha_fin,
        });
      } else {
        // Si no existe, crear
        const googleEventId =
          await this.googleCalendarService.createEvent({
            titulo: `Visita propiedad - ${visita.propiedad_id.substring(0, 8)}`,
            descripcion: visita.observaciones,
            fechaInicio: visita.fecha_inicio,
            fechaFin: visita.fecha_fin,
          });

        visita.google_event_id = googleEventId;
      }

      return await this.visitaRepository.save(visita);
    } catch (error) {
      throw new BadRequestException(
        'Error al sincronizar con Google Calendar',
      );
    }
  }

  async obtenerVisitasPorCorredor(corredor_id: string): Promise<Visita[]> {
    return await this.visitaRepository.find({
      where: { corredor_id },
      order: { fecha_inicio: 'ASC' },
    });
  }

  async obtenerVisitasPorEmpresa(empresa_id: string): Promise<Visita[]> {
    return await this.visitaRepository.find({
      where: { empresa_id },
      order: { fecha_inicio: 'ASC' },
    });
  }
}