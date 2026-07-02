import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from '../users/entities/usuario.entity';
import { Cliente } from '../users/entities/cliente.entity';
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

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  /**
   * Convierte un cliente existente en corredor
   */
  async convertirClienteACorredor(
    dto: ConvertirClienteACorredorDto,
    solicitanteId?: string,
  ) {
    const cliente = await this.clienteRepository.findOne({
      where: {
        id: dto.usuario_id,
      },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Solo el SUPER_ADMIN puede elegir empresa; el ADMIN_EMPRESA queda
    // bloqueado a la suya aunque envíe otra en la petición
    let empresaId = dto.empresa_id;
    if (solicitanteId) {
      const solicitante = await this.usuarioRepository.findOne({
        where: { id: solicitanteId },
      });

      if (solicitante && solicitante.rol !== RolUsuario.SUPER_ADMIN) {
        empresaId = solicitante.empresaId;
      }
    }

    if (!empresaId) {
      throw new BadRequestException(
        'No se pudo determinar la empresa: selecciona una o verifica que tu cuenta tenga empresa asignada',
      );
    }

    const empresa = await this.empresaRepository.findOne({
      where: {
        id: empresaId,
      },
    });

    if (!empresa) {
      throw new NotFoundException(
        'Empresa no encontrada',
      );
    }

    let usuario = await this.usuarioRepository.findOne({
      where: {
        id: dto.usuario_id,
      },
    });

    if (!usuario) {
      usuario = this.usuarioRepository.create({
        id: cliente.id,
        empresaId: empresa.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email ?? '',
        telefono: cliente.telefono,
        password: cliente.password ?? '',
        rol: RolUsuario.CORREDOR,
        activo: true,
      });
    } else {
      usuario.empresaId = empresa.id;
      usuario.nombre = cliente.nombre;
      usuario.apellido = cliente.apellido;
      usuario.email = cliente.email ?? usuario.email;
      usuario.telefono = cliente.telefono;
      usuario.rol = RolUsuario.CORREDOR;
      usuario.activo = true;
      if (cliente.password) {
        usuario.password = cliente.password;
      }
    }

    const usuarioGuardado = await this.usuarioRepository.save(usuario);

    let corredor = await this.corredorRepository.findOne({
      where: {
        idUsuario: usuarioGuardado.id,
      },
    });

    if (!corredor) {
      corredor = this.corredorRepository.create({
        idUsuario: usuarioGuardado.id,
        licenciaProfesional: dto.licenciaProfesional,
        descripcion: dto.descripcion,
      });
    } else {
      corredor.licenciaProfesional = dto.licenciaProfesional;
      corredor.descripcion = dto.descripcion;
    }

    const corredorGuardado = await this.corredorRepository.save(corredor);

    // El usuario ya es corredor: se elimina su registro de cliente
    await this.clienteRepository.delete(cliente.id);

    return {
      message: 'Cliente convertido en corredor',
      usuario: usuarioGuardado,
      corredor: corredorGuardado,
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
