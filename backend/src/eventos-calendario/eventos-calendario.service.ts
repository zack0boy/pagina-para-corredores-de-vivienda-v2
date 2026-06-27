import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { EventoCalendario } from './entities/evento-calendario.entity';
import { CreateEventoCalendarioDto } from './dto/create-evento-calendario.dto';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';

@Injectable()
export class EventosCalendarioService {
  private readonly logger = new Logger(EventosCalendarioService.name);

  constructor(
    @InjectRepository(EventoCalendario)
    private readonly repo: Repository<EventoCalendario>,
    private readonly googleCalendar: GoogleCalendarService,
  ) {}

  // ¿Están configuradas las credenciales de Google Calendar?
  private googleHabilitado(): boolean {
    return !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
    );
  }

  async create(dto: CreateEventoCalendarioDto): Promise<EventoCalendario> {
    const evento = this.repo.create({
      ...dto,
      fecha_inicio: new Date(dto.fecha_inicio),
      fecha_fin: new Date(dto.fecha_fin),
    });
    const guardado = await this.repo.save(evento);

    // Sincronización opcional con Google Calendar (no bloquea si falla)
    if (this.googleHabilitado()) {
      try {
        const googleId = await this.googleCalendar.createEvent({
          titulo: guardado.titulo,
          descripcion: guardado.descripcion,
          fechaInicio: guardado.fecha_inicio,
          fechaFin: guardado.fecha_fin,
        });
        guardado.google_event_id = googleId;
        await this.repo.save(guardado);
      } catch (e: any) {
        this.logger.warn(`No se pudo sincronizar con Google Calendar: ${e.message}`);
      }
    }

    return guardado;
  }

  async findByCorrector(corredor_id: string): Promise<EventoCalendario[]> {
    return this.repo.find({ where: { corredor_id }, order: { fecha_inicio: 'ASC' } });
  }

  async findByCorredorEnRango(corredor_id: string, desde: Date, hasta: Date): Promise<EventoCalendario[]> {
    return this.repo.find({
      where: { corredor_id, fecha_inicio: Between(desde, hasta) },
      order: { fecha_inicio: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EventoCalendario> {
    const evento = await this.repo.findOne({ where: { id } });
    if (!evento) throw new NotFoundException(`Evento ${id} no encontrado`);
    return evento;
  }

  async marcarCompletado(id: string): Promise<EventoCalendario> {
    const evento = await this.findOne(id);
    evento.completado = true;
    return this.repo.save(evento);
  }

  async update(id: string, dto: Partial<CreateEventoCalendarioDto>): Promise<EventoCalendario> {
    const evento = await this.findOne(id);
    Object.assign(evento, {
      ...dto,
      fecha_inicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : evento.fecha_inicio,
      fecha_fin: dto.fecha_fin ? new Date(dto.fecha_fin) : evento.fecha_fin,
    });
    const guardado = await this.repo.save(evento);

    if (this.googleHabilitado() && guardado.google_event_id) {
      try {
        await this.googleCalendar.updateEvent(guardado.google_event_id, {
          titulo: guardado.titulo,
          descripcion: guardado.descripcion,
          fechaInicio: guardado.fecha_inicio,
          fechaFin: guardado.fecha_fin,
        });
      } catch (e: any) {
        this.logger.warn(`No se pudo actualizar en Google Calendar: ${e.message}`);
      }
    }

    return guardado;
  }

  async remove(id: string): Promise<{ message: string }> {
    const evento = await this.findOne(id);

    if (this.googleHabilitado() && evento.google_event_id) {
      try {
        await this.googleCalendar.deleteEvent(evento.google_event_id);
      } catch (e: any) {
        this.logger.warn(`No se pudo eliminar en Google Calendar: ${e.message}`);
      }
    }

    await this.repo.remove(evento);
    return { message: `Evento ${id} eliminado` };
  }
}
