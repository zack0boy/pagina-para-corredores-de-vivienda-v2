import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

import { Propiedades } from '../propiedades/entities/propiedades.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,

    @InjectRepository(Propiedades)
    private readonly propiedadRepository: Repository<Propiedades>,
  ) {}

  async create(
    createLeadDto: CreateLeadDto,
  ) {
    const propiedad =
      await this.propiedadRepository.findOne({
        where: {
          id: createLeadDto.propiedad_id,
        },
      });

    if (!propiedad) {
      throw new NotFoundException(
        'Propiedad no encontrada',
      );
    }

    const lead = this.leadRepository.create({
      empresa_id: propiedad.empresa_id,
      propiedad_id: propiedad.id,
      nombre: createLeadDto.nombre,
      telefono: createLeadDto.telefono,
      email: createLeadDto.email,
      mensaje: createLeadDto.mensaje,
    });

    return await this.leadRepository.save(
      lead,
    );
  }

  async findAll() {
    return await this.leadRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    const lead =
      await this.leadRepository.findOne({
        where: { id },
      });

    if (!lead) {
      throw new NotFoundException(
        'Lead no encontrado',
      );
    }

    return lead;
  }

  async update(
    id: string,
    updateLeadDto: UpdateLeadDto,
  ) {
    const lead =
      await this.findOne(id);

    Object.assign(
      lead,
      updateLeadDto,
    );

    return await this.leadRepository.save(
      lead,
    );
  }

  async remove(id: string) {
    const lead =
      await this.findOne(id);

    await this.leadRepository.remove(
      lead,
    );

    return {
      message:
        'Lead eliminado correctamente',
    };
  }
}