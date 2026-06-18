import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { EventoCalendario } from './entities/evento-calendario.entity';
import { CreateEventoCalendarioDto } from './dto/create-evento-calendario.dto';

@Injectable()
export class EventosCalendarioService {
  constructor(
    @InjectRepository(EventoCalendario)
    private readonly repo: Repository<EventoCalendario>,
  ) {}

  async create(dto: CreateEventoCalendarioDto): Promise<EventoCalendario> {
    const evento = this.repo.create({
      ...dto,
      fecha_inicio: new Date(dto.fecha_inicio),
      fecha_fin: new Date(dto.fecha_fin),
    });
    return this.repo.save(evento);
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
    return this.repo.save(evento);
  }

  async remove(id: string): Promise<{ message: string }> {
    const evento = await this.findOne(id);
    await this.repo.remove(evento);
    return { message: `Evento ${id} eliminado` };
  }
}
