import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pago } from './entities/pago.entity';
import { CreatePagoDto } from './dto/create-pago.dto';
import { ValidarPagoDto } from './dto/validar-pago.dto';
import { EstadoPago } from '../common/enum/estado.enum';

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {}

  async create(dto: CreatePagoDto): Promise<Pago> {
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
    return this.pagoRepository.find({ where: { corredor_id }, order: { created_at: 'DESC' } });
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
