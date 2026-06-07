import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lead, LeadEstado } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { CorredoresService } from '../corredores/corredores.service';


@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,

    @InjectRepository(Propiedades)
    private readonly propiedadRepository: Repository<Propiedades>,

    private readonly corredoresService: CorredoresService,
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

    // ROUND ROBIN: Obtener siguiente corredor automáticamente
    const proximoCorredor =
      await this.corredoresService.getNextCorredorRoundRobin(
        propiedad.empresa_id,
      );

    const leadData: any = {
      empresa_id: propiedad.empresa_id,
      propiedad_id: propiedad.id,
      nombre: createLeadDto.nombre,
      telefono: createLeadDto.telefono,
      email: createLeadDto.email,
      mensaje: createLeadDto.mensaje,
      estado: proximoCorredor ? LeadEstado.ASIGNADO : LeadEstado.NUEVO,
    };

    if (proximoCorredor) {
      leadData.corredor_id = proximoCorredor.id;
    }

    const lead = this.leadRepository.create(leadData);

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