import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comprobante, ComprobanteEstado } from './entities/comprobante.entity';
import { CreateComprobanteDto } from './dto/create-comprobante.dto';
import { UpdateComprobanteDto } from './dto/update-comprobante.dto';
import { ValidarComprobanteDto } from './dto/validar-comprobante.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ComprobanteService {
  constructor(
    @InjectRepository(Comprobante)
    private readonly comprobanteRepository: Repository<Comprobante>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateComprobanteDto) {
    const comprobante =
      this.comprobanteRepository.create(dto);

    return await this.comprobanteRepository.save(
      comprobante,
    );
  }

  async uploadComprobante(
    pagoId: string,
    file: Express.Multer.File,
    observaciones?: string,
  ) {
    if (!file) {
      throw new NotFoundException('No se recibió ningún archivo en el campo "archivo"');
    }

    // Subimos desde el buffer en memoria (FileInterceptor no guarda en disco)
    const resultado = await this.cloudinaryService.uploadBuffer(file.buffer, 'comprobantes');

    const comprobante = this.comprobanteRepository.create({
      pagoId,
      archivoUrl: resultado.secure_url,
      publicId: resultado.public_id,
      nombreArchivo: file.originalname,
      tipoArchivo: file.mimetype,
      observaciones,
    });

    return await this.comprobanteRepository.save(comprobante);
  }

  async findByPago(pagoId: string) {
    return this.comprobanteRepository.find({ where: { pagoId } });
  }

  async validarComprobante(
    id: string,
    dto: ValidarComprobanteDto,
  ) {
    const comprobante = await this.findOne(id);

    comprobante.estado = dto.estado;
    comprobante.validadoPor = dto.validado_por;
    comprobante.fechaValidacion = new Date();
    if (dto.observaciones) {
      comprobante.observaciones = dto.observaciones;
    }

    return await this.comprobanteRepository.save(
      comprobante,
    );
  }

  // Usado en cascada desde PagosService.validar(): sincroniza el estado de todos los
  // comprobantes de un pago cuando se valida/rechaza el pago completo.
  async marcarEstadoPorPago(
    pagoId: string,
    estado: ComprobanteEstado,
    validado_por: string,
  ): Promise<void> {
    const comprobantes = await this.findByPago(pagoId);
    const fechaValidacion = new Date();
    for (const comprobante of comprobantes) {
      comprobante.estado = estado;
      comprobante.validadoPor = validado_por;
      comprobante.fechaValidacion = fechaValidacion;
      await this.comprobanteRepository.save(comprobante);
    }
  }

  async findAll() {
    return await this.comprobanteRepository.find();
  }

  async findOne(id: string) {
    const comprobante =
      await this.comprobanteRepository.findOne({
        where: { id },
      });

    if (!comprobante) {
      throw new NotFoundException(
        `Comprobante con id ${id} no encontrado`,
      );
    }

    return comprobante;
  }

  async update(
    id: string,
    dto: UpdateComprobanteDto,
  ) {
    const comprobante =
      await this.findOne(id);

    Object.assign(comprobante, dto);

    return await this.comprobanteRepository.save(
      comprobante,
    );
  }

  async remove(id: string) {
    const comprobante =
      await this.findOne(id);

    if (comprobante.publicId) {
      await this.cloudinaryService.deleteImage(comprobante.publicId);
    }

    await this.comprobanteRepository.remove(
      comprobante,
    );

    return {
      message: `Comprobante ${id} eliminado correctamente`,
    };
  }
}