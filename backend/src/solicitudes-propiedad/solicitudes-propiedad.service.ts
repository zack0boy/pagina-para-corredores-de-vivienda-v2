import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudPropiedad } from './entities/solicitud-propiedad.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import {
  CreateSolicitudPropiedadDto,
  ResolverSolicitudPropiedadDto,
} from './dto/create-solicitud-propiedad.dto';

@Injectable()
export class SolicitudesPropiedadService {
  constructor(
    @InjectRepository(SolicitudPropiedad)
    private readonly repo: Repository<SolicitudPropiedad>,
    @InjectRepository(Propiedades)
    private readonly propiedadRepo: Repository<Propiedades>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  create(dto: CreateSolicitudPropiedadDto) {
    const solicitud = this.repo.create({
      ...dto,
      estado: 'PENDIENTE',
    });
    return this.repo.save(solicitud);
  }

  findAll() {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  findPendientes() {
    return this.repo.find({ where: { estado: 'PENDIENTE' }, order: { created_at: 'ASC' } });
  }

  async findOne(id: string) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Solicitud no encontrada');
    return s;
  }

  async resolver(id: string, dto: ResolverSolicitudPropiedadDto) {
    const solicitud = await this.findOne(id);

    if (solicitud.estado !== 'PENDIENTE') {
      throw new BadRequestException('Esta solicitud ya fue resuelta');
    }

    if (dto.estado === 'APROBADA') {
      // La propiedad necesita categoría. Si la solicitud no trae una,
      // usamos la primera categoría disponible como predeterminada.
      let categoriaId = solicitud.categoria_id;
      if (!categoriaId) {
        const primera = await this.categoriaRepo.find({ take: 1 });
        if (!primera.length) {
          throw new BadRequestException(
            'No hay categorías creadas. Crea al menos una categoría antes de aprobar.',
          );
        }
        categoriaId = primera[0].id;
      }

      // Crear la propiedad real con el corredor como representante
      const codigo = 'SOL-' + Date.now().toString().slice(-6);
      const propiedad = this.propiedadRepo.create({
        empresa_id: solicitud.empresa_id ?? '00000000-0000-0000-0000-000000000001',
        categoria_id: categoriaId,
        codigo,
        titulo: solicitud.titulo,
        descripcion: solicitud.descripcion,
        direccion: solicitud.direccion,
        precio: solicitud.precio,
        tipo_operacion: solicitud.tipo_operacion,
        corredor_id: dto.corredor_id,
        estado: 'DISPONIBLE',
      });
      const propiedadGuardada = await this.propiedadRepo.save(propiedad);

      solicitud.estado = 'APROBADA';
      solicitud.corredor_id = dto.corredor_id;
      solicitud.propiedad_id = propiedadGuardada.id;
      await this.repo.save(solicitud);

      return { message: 'Solicitud aprobada y propiedad publicada', propiedad: propiedadGuardada };
    }

    // Rechazo
    solicitud.estado = 'RECHAZADA';
    solicitud.corredor_id = dto.corredor_id;
    solicitud.motivo_rechazo = dto.motivo_rechazo;
    await this.repo.save(solicitud);
    return { message: 'Solicitud rechazada' };
  }
}
