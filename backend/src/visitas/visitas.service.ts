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

@Injectable()
export class VisitasService {
  constructor(
    @InjectRepository(Visita)
    private readonly visitaRepository: Repository<Visita>,
  ) {}

  async create(
    createVisitaDto: CreateVisitaDto,
  ): Promise<Visita> {
    const visita = this.visitaRepository.create({
      ...createVisitaDto,
      estado: EstadoVisita.PROGRAMADA,
    });

    return await this.visitaRepository.save(
      visita,
    );
  }

  async findAll(): Promise<Visita[]> {
    return await this.visitaRepository.find({
      order: {
        fecha_inicio: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Visita> {
    const visita =
      await this.visitaRepository.findOne({
        where: { id },
      });

    if (!visita) {
      throw new NotFoundException(
        'Visita no encontrada',
      );
    }

    return visita;
  }

  async update(
    id: string,
    updateVisitaDto: UpdateVisitaDto,
  ): Promise<Visita> {
    const visita = await this.findOne(id);

    Object.assign(
      visita,
      updateVisitaDto,
    );

    return await this.visitaRepository.save(
      visita,
    );
  }

  async remove(id: string) {
    const visita = await this.findOne(id);

    await this.visitaRepository.remove(
      visita,
    );

    return {
      message:
        'Visita eliminada correctamente',
    };
  }
}