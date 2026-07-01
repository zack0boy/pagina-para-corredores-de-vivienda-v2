import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from '../users/entities/usuario.entity';
import { Corredor } from '../users/entities/corredor.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { RolUsuario } from '../common/enum/roles.enum';
import { ConvertirClienteACorredorDto } from './dto/convertir-cliente-corredor.dto';

@Injectable()
export class AsignaCorredorService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Corredor)
    private readonly corredorRepository: Repository<Corredor>,

    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}

  /**
   * Convierte un cliente existente en corredor
   */
  async convertirClienteACorredor(
    dto: ConvertirClienteACorredorDto,
  ) {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        id: dto.usuario_id,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (usuario.rol !== RolUsuario.CLIENTE) {
      throw new BadRequestException(
        'El usuario no es un cliente',
      );
    }

    const empresa = await this.empresaRepository.findOne({
      where: {
        id: dto.empresa_id,
      },
    });

    if (!empresa) {
      throw new NotFoundException(
        'Empresa no encontrada',
      );
    }

    usuario.rol = RolUsuario.CORREDOR;
    await this.usuarioRepository.save(usuario);

    const corredor = this.corredorRepository.create({
      idUsuario: usuario.id,
      licenciaProfesional: dto.licenciaProfesional,
      descripcion: dto.descripcion,
    });

    await this.corredorRepository.save(corredor);

    return {
      message: 'Cliente convertido en corredor',
      usuario,
      corredor,
    };
  }

  /**
   * Obtiene todas las empresas
   */
  async obtenerEmpresas() {
    return this.empresaRepository.find({
      order: {
        nombre: 'ASC',
      },
    });
  }
}
