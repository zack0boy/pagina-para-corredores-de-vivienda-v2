import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lead, LeadEstado } from './entities/lead.entity';
import { LeadAuditoria } from './entities/lead-auditoria.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { CorredoresService } from '../corredores/corredores.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';


@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,

    @InjectRepository(Propiedades)
    private readonly propiedadRepository: Repository<Propiedades>,

    @InjectRepository(LeadAuditoria)
    private readonly auditRepository: Repository<LeadAuditoria>,

    private readonly corredoresService: CorredoresService,
    private readonly notificacionesService: NotificacionesService,
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

    // Validar que la empresa_id coincida
    if (propiedad.empresa_id !== createLeadDto.empresa_id) {
      throw new Error(
        'La propiedad no pertenece a esta empresa',
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

    if (createLeadDto.cliente_id) {
      leadData.cliente_id = createLeadDto.cliente_id;
    }

    const lead = this.leadRepository.create(leadData);

    const leadGuardado = await this.leadRepository.save(lead);

    // 🔔 Crear notificación si se asignó corredor
    if (proximoCorredor) {
      await this.notificacionesService.notificarNuevoLead(
        propiedad.empresa_id,
        proximoCorredor.id,
        `${createLeadDto.nombre} - ${propiedad.titulo}`,
      );
    }

    return leadGuardado;
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

  /**
   * REASIGNACIÓN: Admin reasigna el lead a otro corredor
   */
  async reassignCorredor(id: string, corredor_id: string, admin_id?: string) {
    const lead = await this.findOne(id);

    // Validar que el corredor existe
    const corredor = await this.corredoresService.findOne(corredor_id);
    if (!corredor) {
      throw new NotFoundException(
        'Corredor no encontrado',
      );
    }

    // Validar que el corredor pertenece a la misma empresa
    if (corredor.empresa_id !== lead.empresa_id) {
      throw new Error(
        'El corredor debe pertenecer a la misma empresa del lead',
      );
    }

    const corredor_anterior = lead.corredor_id;

    lead.corredor_id = corredor_id;
    lead.estado = LeadEstado.REASIGNADO;

    const leadActualizado = await this.leadRepository.save(lead);

    // � Notificar al nuevo corredor
    const propiedad = await this.propiedadRepository.findOne({
      where: { id: lead.propiedad_id },
    });
    if (propiedad) {
      await this.notificacionesService.notificarNuevoLead(
        lead.empresa_id,
        corredor_id,
        `${lead.nombre} - ${propiedad.titulo} (Reasignación)`,
      );
    }

    // �📝 Registrar en auditoría
    await this.auditRepository.save({
      lead_id: id,
      accion: 'REASIGNADO',
      datos_anteriores: { corredor_id: corredor_anterior },
      datos_nuevos: { corredor_id: corredor_id },
      realizado_por: admin_id || 'sistema',
    });

    return leadActualizado;
  }

  /**
   * MOVIMIENTO: Admin mueve el lead a otra propiedad
   */
  async moveToProperty(id: string, propiedad_id: string, admin_id?: string) {
    const lead = await this.findOne(id);

    const propiedad = await this.propiedadRepository.findOne({
      where: { id: propiedad_id },
    });

    if (!propiedad) {
      throw new NotFoundException(
        'Propiedad no encontrada',
      );
    }

    // Validar que la propiedad pertenece a la misma empresa
    if (propiedad.empresa_id !== lead.empresa_id) {
      throw new Error(
        'La propiedad debe pertenecer a la misma empresa del lead',
      );
    }

    const propiedad_anterior = lead.propiedad_id;
    const corredor_anterior = lead.corredor_id;

    // Actualizar la propiedad del lead
    lead.propiedad_id = propiedad_id;

    // Reasignar automáticamente un corredor para la nueva propiedad
    const proximoCorredor =
      await this.corredoresService.getNextCorredorRoundRobin(
        propiedad.empresa_id,
      );

    if (proximoCorredor) {
      lead.corredor_id = proximoCorredor.id;
      lead.estado = LeadEstado.REASIGNADO;
    }

    const leadActualizado = await this.leadRepository.save(lead);

    // 📝 Registrar en auditoría
    await this.auditRepository.save({
      lead_id: id,
      accion: 'MOVIDO',
      datos_anteriores: {
        propiedad_id: propiedad_anterior,
        corredor_id: corredor_anterior,
      },
      datos_nuevos: {
        propiedad_id: propiedad_id,
        corredor_id: proximoCorredor?.id ?? null,
      },
      realizado_por: admin_id || 'sistema',
    });

    return leadActualizado;
  }
}