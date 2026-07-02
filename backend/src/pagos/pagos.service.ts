import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { ValidarPagoDto } from './dto/validar-pago.dto';
import { EstadoPago } from '../common/enum/estado.enum';
import { Propiedades } from '../propiedades/entities/propiedades.entity';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Propiedades)
    private readonly propiedadesRepository: Repository<Propiedades>,
  ) {}

  async create(dto: CreatePagoDto): Promise<Pago> {
    if (!dto.corredor_id) {
      if (dto.propiedad_id) {
        const propiedad = await this.propiedadesRepository.findOne({
          where: { id: dto.propiedad_id },
          select: { corredor_id: true },
        });

        if (propiedad?.corredor_id) {
          dto.corredor_id = propiedad.corredor_id;
        }
      }

      if (!dto.corredor_id && dto.propiedad_titulo) {
        const propiedad = await this.propiedadesRepository.findOne({
          where: { titulo: ILike(dto.propiedad_titulo.trim()) },
          select: { corredor_id: true },
        });

        if (propiedad?.corredor_id) {
          dto.corredor_id = propiedad.corredor_id;
        }
      }
    }

    const pago = this.pagoRepository.create({
      ...dto,
      fecha_pago: new Date(dto.fecha_pago),
    });
    return this.pagoRepository.save(pago);
  }

  async findAll(): Promise<Pago[]> {
    return this.pagoRepository.find({ order: { created_at: 'DESC' } });
  }

  async findByCuota(cuota_id: string): Promise<Pago[]> {
    return this.pagoRepository.find({ where: { cuota_id }, order: { fecha_pago: 'DESC' } });
  }

  async findByCliente(cliente_id: string): Promise<Pago[]> {
    return this.pagoRepository.find({ where: { cliente_id }, order: { fecha_pago: 'DESC' } });
  }

  async findByCorredor(corredor_id: string): Promise<Pago[]> {
    const pagosDirectos = await this.pagoRepository.find({
      where: { corredor_id },
      order: { created_at: 'DESC' },
    });

    const propiedades = await this.propiedadesRepository.find({
      where: { corredor_id },
      select: { id: true },
    });

    const propiedadIds = propiedades.map((propiedad) => propiedad.id);

    let pagosPorPropiedad: Pago[] = [];
    if (propiedadIds.length > 0) {
      pagosPorPropiedad = await this.pagoRepository.find({
        where: { propiedad_id: In(propiedadIds) },
        order: { created_at: 'DESC' },
      });
    }

    const combinados = [...pagosDirectos, ...pagosPorPropiedad];
    const vistos = new Set<string>();

    return combinados.filter((pago) => {
      if (!pago.id || vistos.has(pago.id)) {
        return false;
      }
      vistos.add(pago.id);
      return true;
    });
  }

  async findOne(id: string): Promise<Pago> {
    const pago = await this.pagoRepository.findOne({ where: { id } });
    if (!pago) throw new NotFoundException(`Pago ${id} no encontrado`);
    return pago;
  }

  async validar(id: string, dto: ValidarPagoDto): Promise<Pago> {
    const pago = await this.findOne(id);
    pago.estado = dto.estado;
    pago.validado_por = dto.validado_por;
    pago.fecha_validacion = new Date();
    if (dto.comentario) pago.comentario = dto.comentario;
    return this.pagoRepository.save(pago);
  }

  async findPendientes(): Promise<Pago[]> {
    return this.pagoRepository.find({
      where: { estado: EstadoPago.PENDIENTE_VALIDACION },
      order: { created_at: 'ASC' },
    });
  }
}
