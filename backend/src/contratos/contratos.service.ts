import { Injectable, BadRequestException, NotFoundException, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contrato, EstadoContrato } from './entities/contrato.entity';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { CuotasService } from '../cuotas/cuotas.service';

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(Contrato)
    private contratoRepository: Repository<Contrato>,
    @Optional() @Inject(CuotasService) private cuotasService?: CuotasService,
  ) {}

  async create(createContratoDto: CreateContratoDto): Promise<Contrato> {
    // Validar que el número de contrato sea único
    const exists = await this.contratoRepository.findOneBy({
      numero_contrato: createContratoDto.numero_contrato,
    });

    if (exists) {
      throw new BadRequestException('El número de contrato ya existe');
    }

    const contrato = this.contratoRepository.create({
      ...createContratoDto,
      estado: EstadoContrato.BORRADOR,
    });

    return await this.contratoRepository.save(contrato);
  }

  async findAll(): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contrato> {
    const contrato = await this.contratoRepository.findOneBy({ id });

    if (!contrato) {
      throw new NotFoundException('Contrato no encontrado');
    }

    return contrato;
  }

  async update(id: string, updateContratoDto: UpdateContratoDto): Promise<Contrato> {
    const contrato = await this.findOne(id);

    Object.assign(contrato, updateContratoDto);

    return await this.contratoRepository.save(contrato);
  }

  async activar(id: string): Promise<Contrato> {
    const contrato = await this.findOne(id);

    if (contrato.estado !== EstadoContrato.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden activar contratos en estado BORRADOR',
      );
    }

    contrato.estado = EstadoContrato.ACTIVO;

    // Si es arriendo, generar cuotas automáticamente
    if (contrato.tipo === 'ARRIENDO' && this.cuotasService) {
      try {
        await this.cuotasService.generarCuotasPorArriendo(id);
      } catch (error) {
        console.warn('Error generando cuotas:', error);
      }
    }

    return await this.contratoRepository.save(contrato);
  }

  async finalizar(id: string): Promise<Contrato> {
    const contrato = await this.findOne(id);

    if (contrato.estado !== EstadoContrato.ACTIVO) {
      throw new BadRequestException(
        'Solo se pueden finalizar contratos activos',
      );
    }

    contrato.estado = EstadoContrato.FINALIZADO;

    return await this.contratoRepository.save(contrato);
  }

  async cancelar(id: string): Promise<Contrato> {
    const contrato = await this.findOne(id);

    contrato.estado = EstadoContrato.CANCELADO;

    return await this.contratoRepository.save(contrato);
  }

  async findByEmpresa(empresa_id: string): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      where: { empresa_id },
      order: { created_at: 'DESC' },
    });
  }

  async findByCliente(cliente_id: string): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      where: { cliente_id },
      order: { created_at: 'DESC' },
    });
  }

  async findByCorredor(corredor_id: string): Promise<Contrato[]> {
    return await this.contratoRepository.find({
      where: { corredor_id },
      order: { created_at: 'DESC' },
    });
  }

  async remove(id: string) {
    const contrato = await this.findOne(id);

    // Eliminar cuotas asociadas si está disponible el servicio
    if (this.cuotasService) {
      try {
        await this.cuotasService.eliminarCuotasPorContrato(id);
      } catch (error) {
        console.warn('Error eliminando cuotas:', error);
      }
    }

    await this.contratoRepository.remove(contrato);

    return { message: 'Contrato eliminado correctamente' };
  }
}
