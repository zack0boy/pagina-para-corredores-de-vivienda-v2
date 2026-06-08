import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Visita } from './entities/visita.entity';
import { CreateVisitaDto } from './dto/create-visita.dto';
import { UpdateVisitaDto } from './dto/update-visita.dto';
import { EstadoVisita } from './entities/estado-visita.enum';
import { GoogleCalendarService } from '../google-calendar/google-calendar.service';

@Injectable()
export class VisitasService {
  constructor(
    @InjectRepository(Visita)
    private readonly visitaRepository: Repository<Visita>,

    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  async create(createVisitaDto: CreateVisitaDto): Promise<Visita> {
    let googleEventId: string | undefined;

    try {
      googleEventId = await this.googleCalendarService.createEvent({
        titulo: `Visita propiedad`,
        descripcion: createVisitaDto.observaciones,
        fechaInicio: new Date(createVisitaDto.fecha_inicio),
        fechaFin: new Date(createVisitaDto.fecha_fin),
      });
    } catch {
      // Si Google Calendar falla, la visita igual se crea
    }

    const visita = this.visitaRepository.create({
      ...createVisitaDto,
      estado: EstadoVisita.PROGRAMADA,
      google_event_id: googleEventId,
    });

    return await this.visitaRepository.save(visita);
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
      } catch {
        // Si falla, igual actualiza en BD
      }
    }

    Object.assign(visita, updateVisitaDto);

    return await this.visitaRepository.save(visita);
  }

  async cancelar(id: string): Promise<Visita> {
    const visita = await this.findOne(id);

    if (visita.google_event_id) {
      try {
        await this.googleCalendarService.deleteEvent(visita.google_event_id);
      } catch {
        // Si falla, igual cancela en BD
      }
    }

    visita.estado = EstadoVisita.CANCELADA;

    return await this.visitaRepository.save(visita);
  }

  async remove(id: string) {
    const visita = await this.findOne(id);

    if (visita.google_event_id) {
      try {
        await this.googleCalendarService.deleteEvent(visita.google_event_id);
      } catch {}
    }

    await this.visitaRepository.remove(visita);

    return { message: 'Visita eliminada correctamente' };
  }
}