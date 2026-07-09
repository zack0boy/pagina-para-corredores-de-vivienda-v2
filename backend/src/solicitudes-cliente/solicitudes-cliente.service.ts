import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { SolicitudCliente } from './entities/solicitud-cliente.entity';
import { CreateSolicitudClienteDto } from './dto/create-solicitud-cliente.dto';
import { ResolverSolicitudDto } from './dto/resolver-solicitud.dto';
import { EstadoSolicitudCliente } from '../common/enum/estado.enum';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Usuario } from '../users/entities/usuario.entity';
import { RolUsuario } from '../common/enum/roles.enum';

@Injectable()
export class SolicitudesClienteService {
  constructor(
    @InjectRepository(SolicitudCliente)
    private readonly repo: Repository<SolicitudCliente>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async create(dto: CreateSolicitudClienteDto): Promise<SolicitudCliente> {
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 24);

    const solicitud = this.repo.create({
      ...dto,
      fecha_expiracion: fechaExpiracion,
    });
    const guardada = await this.repo.save(solicitud);

    try {
      if (guardada.corredor_id) {
        await this.notificacionesService.notificarNuevaSolicitud(
          guardada.empresa_id,
          guardada.corredor_id,
          guardada.mensaje || 'Nueva solicitud de cliente pendiente de revisión',
        );
      } else {
        const admins = await this.usuarioRepository.find({
          where: [
            { empresaId: guardada.empresa_id, rol: RolUsuario.ADMIN_EMPRESA },
            { empresaId: guardada.empresa_id, rol: RolUsuario.SUPER_ADMIN },
          ],
        });
        for (const admin of admins) {
          await this.notificacionesService.notificarNuevaSolicitud(
            guardada.empresa_id,
            admin.id,
            guardada.mensaje || 'Nueva solicitud de cliente pendiente de revisión',
          );
        }
      }
    } catch (error) {
      console.warn('Error creando notificación de nueva solicitud:', error);
    }

    return guardada;
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
