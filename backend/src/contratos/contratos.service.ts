import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contrato } from './entities/contrato.entity';
import { Cliente } from '../users/entities/cliente.entity';
import { Corredor } from '../users/entities/corredor.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';

@Injectable()
export class ContratosService {
  constructor(
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Corredor)
    private readonly corredorRepository: Repository<Corredor>,
    @InjectRepository(Propiedades)
    private readonly propiedadRepository: Repository<Propiedades>,
  ) {}

  async create(dto: CreateContratoDto) {
    const cliente = await this.clienteRepository.findOneBy({
      idUsuario: dto.idCliente,
    });
    if (!cliente) {
      throw new NotFoundException(
        `Cliente con id ${dto.idCliente} no encontrado`,
      );
    }

    const corredor = await this.corredorRepository.findOneBy({
      idUsuario: dto.idCorredor,
    });
    if (!corredor) {
      throw new NotFoundException(
        `Corredor con id ${dto.idCorredor} no encontrado`,
      );
    }

    const propiedad = await this.propiedadRepository.findOneBy({
      id: dto.idPropiedad,
    });
    if (!propiedad) {
      throw new NotFoundException(
        `Propiedad con id ${dto.idPropiedad} no encontrada`,
      );
    }

    const contrato = this.contratoRepository.create({
      tipo: dto.tipo,
      montoTotal: dto.montoTotal,
      fechaInicio: new Date(dto.fechaInicio),
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
      cliente,
      corredor,
      propiedad,
    });

    return this.contratoRepository.save(contrato);
  }

  findAll() {
    return this.contratoRepository.find();
  }

  async findOne(id: number) {
    const contrato = await this.contratoRepository.findOne({
      where: { idContrato: id },
    });

    if (!contrato) {
      throw new NotFoundException(`Contrato con id ${id} no encontrado`);
    }

    return contrato;
  }

  async update(id: number, updateContratoDto: UpdateContratoDto) {
    const contrato = await this.contratoRepository.findOne({
      where: { idContrato: id },
    });
    if (!contrato) {
      throw new NotFoundException(`Contrato con id ${id} no encontrado`);
    }

    await this.contratoRepository.update(id, {
      ...updateContratoDto,
      fechaInicio: updateContratoDto.fechaInicio
        ? new Date(updateContratoDto.fechaInicio)
        : contrato.fechaInicio,
      fechaFin: updateContratoDto.fechaFin
        ? new Date(updateContratoDto.fechaFin)
        : contrato.fechaFin,
    });

    return this.contratoRepository.findOne({
      where: { idContrato: id },
    });
  }

  async remove(id: number) {
    const contrato = await this.contratoRepository.findOne({
      where: { idContrato: id },
    });
    if (!contrato) {
      throw new NotFoundException(`Contrato con id ${id} no encontrado`);
    }

    await this.contratoRepository.delete(id);

    return {
      message: `Contrato eliminado con id ${id}`,
    };
  }
}
