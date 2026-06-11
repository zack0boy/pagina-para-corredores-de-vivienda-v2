import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Cliente } from './entities/cliente.entity';
import { Corredor } from './entities/corredor.entity';
import { CreateClienteDto, UpdateClienteDto } from './dto/create-cliente.dto';
import { CreateCorredorDto, UpdateCorredorDto } from './dto/create-corredor.dto';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../common/enum/roles.enum';
import { FilterClienteDto } from './dto/filter-cliente.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Corredor)
    private corredorRepository: Repository<Corredor>,
  ) {}

  async createCliente(dto: CreateClienteDto): Promise<Cliente> {
    // Verificar si el email ya existe
    const existingUser = await this.usuarioRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar si el RUT ya existe
    const existingCliente = await this.clienteRepository.findOne({ where: { rut: dto.rut } });
    if (existingCliente) {
      throw new ConflictException('El RUT ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear usuario
    const usuario = this.usuarioRepository.create({
      nombre: dto.nombre,
      email: dto.email,
      password: hashedPassword,
      rol: RolUsuario.CLIENTE,
      activo: true,
    });

    const savedUsuario = await this.usuarioRepository.save(usuario);

    // Crear cliente
    const cliente = this.clienteRepository.create({
      idUsuario: savedUsuario.id,
      telefono: dto.telefono,
      rut: dto.rut,
      direccion: dto.direccion,
    });

    return this.clienteRepository.save(cliente);
  }

  async createCorredor(dto: CreateCorredorDto): Promise<Corredor> {
    // Verificar si el email ya existe
    const existingUser = await this.usuarioRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear usuario
    const usuario = this.usuarioRepository.create({
      nombre: dto.nombre,
      email: dto.email,
      password: hashedPassword,
      rol: RolUsuario.CORREDOR,
      activo: true,
    });

    const savedUsuario = await this.usuarioRepository.save(usuario);

    // Crear corredor
    const corredor = this.corredorRepository.create({
      idUsuario: savedUsuario.id,
      licenciaProfesional: dto.licenciaProfesional,
      descripcion: dto.descripcion,
    });

    return this.corredorRepository.save(corredor);
  }

  async getCliente(idUsuario: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { idUsuario },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  async getCorredor(idUsuario: string): Promise<Corredor> {
    const corredor = await this.corredorRepository.findOne({
      where: { idUsuario },
    });

    if (!corredor) {
      throw new NotFoundException('Corredor no encontrado');
    }

    return corredor;
  }

  async updateCliente(idUsuario: string, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { idUsuario } });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Actualizar usuario si es necesario
    if (dto.nombre || dto.email) {
      await this.usuarioRepository.update(idUsuario, {
        nombre: dto.nombre,
        email: dto.email,
      });
    }

    // Actualizar cliente
    Object.assign(cliente, dto);
    return this.clienteRepository.save(cliente);
  }

  async updateCorredor(idUsuario: string, dto: UpdateCorredorDto): Promise<Corredor> {
    const corredor = await this.corredorRepository.findOne({ where: { idUsuario } });
    if (!corredor) {
      throw new NotFoundException('Corredor no encontrado');
    }

    // Actualizar usuario si es necesario
    if (dto.nombre) {
      await this.usuarioRepository.update(idUsuario, {
        nombre: dto.nombre,
      });
    }

    // Actualizar corredor
    Object.assign(corredor, dto);
    return this.corredorRepository.save(corredor);
  }

  async getAllClientes(): Promise<Cliente[]> {
  return this.clienteRepository.find();
  }

  async getAllCorredores(): Promise<Corredor[]> {
    return this.corredorRepository.find({ relations: { usuario: true } });
  }

  async findClientesWithFilters(filters: FilterClienteDto) {
    const query = this.clienteRepository.createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.usuario', 'usuario');

    if (filters.nombre) {
      query.andWhere('usuario.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    }

    if (filters.apellido) {
      query.andWhere('usuario.apellido ILIKE :apellido', { apellido: `%${filters.apellido}%` });
    }

    if (filters.email) {
      query.andWhere('usuario.email ILIKE :email', { email: `%${filters.email}%` });
    }

    if (filters.telefono) {
      query.andWhere('cliente.telefono ILIKE :telefono', { telefono: `%${filters.telefono}%` });
    }

    if (filters.documento) {
      query.andWhere('cliente.rut ILIKE :documento', { documento: `%${filters.documento}%` });
    }

    if (filters.ciudad) {
      query.andWhere('cliente.ciudad ILIKE :ciudad', { ciudad: `%${filters.ciudad}%` });
    }

    if (filters.activo !== undefined) {
      query.andWhere('usuario.activo = :activo', { activo: filters.activo });
    }

    const skip = ((filters.page || 1) - 1) * (filters.limit || 10);
    query.skip(skip).take(filters.limit || 10);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      pages: Math.ceil(total / (filters.limit || 10)),
    };
  }

  async findUsuariosWithFilters(filters: FilterUsuarioDto) {
    const query = this.usuarioRepository.createQueryBuilder('usuario');

    if (filters.nombre) {
      query.andWhere('usuario.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    }

    if (filters.apellido) {
      query.andWhere('usuario.apellido ILIKE :apellido', { apellido: `%${filters.apellido}%` });
    }

    if (filters.email) {
      query.andWhere('usuario.email ILIKE :email', { email: `%${filters.email}%` });
    }

    if (filters.telefono) {
      query.andWhere('usuario.telefono ILIKE :telefono', { telefono: `%${filters.telefono}%` });
    }

    if (filters.rol) {
      query.andWhere('usuario.rol = :rol', { rol: filters.rol });
    }

    if (filters.activo !== undefined) {
      query.andWhere('usuario.activo = :activo', { activo: filters.activo });
    }

    const skip = ((filters.page || 1) - 1) * (filters.limit || 10);
    query.skip(skip).take(filters.limit || 10);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
      pages: Math.ceil(total / (filters.limit || 10)),
    };
  }

async createUsuario(
  data: Partial<Usuario>,
): Promise<Usuario> {

  const usuario =
    this.usuarioRepository.create(data);

  return await this.usuarioRepository.save(
    usuario,
  );
}

async save(usuario: Usuario): Promise<Usuario> {
  return this.usuarioRepository.save(usuario);
}

async findByEmail(email: string) {
  return this.usuarioRepository.findOne({
    where: { email },
  });
}

async updatePassword(
  id: string,
  password: string,
): Promise<void> {
  await this.usuarioRepository.update(
    { id },
    {
      password,
    },
  );
}

async findById(id: string): Promise<Usuario | null> {
  return await this.usuarioRepository.findOne({
    where: { id },
  });
}
}