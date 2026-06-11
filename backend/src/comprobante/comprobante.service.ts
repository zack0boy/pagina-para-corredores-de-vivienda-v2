import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comprobante } from './entities/comprobante.entity';
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
    const resultado = await this.cloudinaryService.uploadImage(
      file.path,
    );

    const comprobante = this.comprobanteRepository.create({
      pagoId,
      archivoUrl: resultado.secure_url,
      nombreArchivo: file.originalname,
      tipoArchivo: file.mimetype,
      observaciones,
    });

    return await this.comprobanteRepository.save(comprobante);
  }

  async validarComprobante(
    id: string,
    dto: ValidarComprobanteDto,
  ) {
    const comprobante = await this.findOne(id);

    if (dto.observaciones) {
      comprobante.observaciones = dto.observaciones;
    }

    return await this.comprobanteRepository.save(
      comprobante,
    );
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

    await this.comprobanteRepository.remove(
      comprobante,
    );

    return {
      message: `Comprobante ${id} eliminado correctamente`,
    };
  }
}