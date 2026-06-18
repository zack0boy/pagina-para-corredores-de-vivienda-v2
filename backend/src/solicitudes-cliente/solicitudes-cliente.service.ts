import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { SolicitudCliente } from './entities/solicitud-cliente.entity';
import { CreateSolicitudClienteDto } from './dto/create-solicitud-cliente.dto';
import { ResolverSolicitudDto } from './dto/resolver-solicitud.dto';
import { EstadoSolicitudCliente } from '../common/enum/estado.enum';

@Injectable()
export class SolicitudesClienteService {
  constructor(
    @InjectRepository(SolicitudCliente)
    private readonly repo: Repository<SolicitudCliente>,
  ) {}

  async create(dto: CreateSolicitudClienteDto): Promise<SolicitudCliente> {
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 24);

    const solicitud = this.repo.create({
      ...dto,
      fecha_expiracion: fechaExpiracion,
    });
    return this.repo.save(solicitud);
  }

  async findAll(): Promise<SolicitudCliente[]> {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async findPendientesByEmpresa(empresa_id: string): Promise<SolicitudCliente[]> {
    return this.repo.find({
      where: { empresa_id, estado: EstadoSolicitudCliente.PENDIENTE },
      order: { created_at: 'ASC' },
    });
  }

  async findByCliente(cliente_id: string): Promise<SolicitudCliente[]> {
    return this.repo.find({ where: { cliente_id }, order: { created_at: 'DESC' } });
  }

  async findOne(id: string): Promise<SolicitudCliente> {
    const solicitud = await this.repo.findOne({ where: { id } });
    if (!solicitud) throw new NotFoundException(`Solicitud ${id} no encontrada`);
    return solicitud;
  }

  async resolver(id: string, dto: ResolverSolicitudDto): Promise<SolicitudCliente> {
    const solicitud = await this.findOne(id);
    solicitud.estado = dto.estado;
    if (dto.motivo_rechazo) solicitud.motivo_rechazo = dto.motivo_rechazo;
    return this.repo.save(solicitud);
  }

  async expirarVencidas(): Promise<number> {
    const result = await this.repo.update(
      {
        estado: EstadoSolicitudCliente.PENDIENTE,
        fecha_expiracion: LessThan(new Date()),
      },
      { estado: EstadoSolicitudCliente.EXPIRADA },
    );
    return result.affected ?? 0;
  }
}
