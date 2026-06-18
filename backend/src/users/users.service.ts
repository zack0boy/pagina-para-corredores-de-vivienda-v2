import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Cliente } from './entities/cliente.entity';
import { Corredor } from './entities/corredor.entity';
import { CreateClienteDto, UpdateClienteDto } from './dto/create-cliente.dto';
import { CreateCorredorDto, UpdateCorredorDto } from './dto/create-corredor.dto';
import { FilterClienteDto } from './dto/filter-cliente.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { EstadoCliente } from '../common/enum/estado.enum';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../common/enum/roles.enum';

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

  // ─── CLIENTES ────────────────────────────────────────────────────────────────

  async createCliente(dto: CreateClienteDto): Promise<Cliente> {
    if (dto.email) {
      const existente = await this.clienteRepository.findOne({ where: { email: dto.email } });
      if (existente) throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;

    const cliente = this.clienteRepository.create({
      empresa_id: dto.empresa_id,
      nombre: dto.nombre,
      apellido: dto.apellido,
      email: dto.email,
      telefono: dto.telefono,
      password: hashedPassword,
      activo: true,
      estado: EstadoCliente.PENDIENTE_VALIDACION,
    });

    return this.clienteRepository.save(cliente);
  }

  async findClienteByEmail(email: string): Promise<Cliente | null> {
    return this.clienteRepository.findOne({ where: { email } });
  }

  async findClienteById(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async updateCliente(id: string, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findClienteById(id);
    Object.assign(cliente, dto);
    return this.clienteRepository.save(cliente);
  }

  async getAllClientes(): Promise<Cliente[]> {
    return this.clienteRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findClientesWithFilters(filters: FilterClienteDto) {
    const query = this.clienteRepository.createQueryBuilder('cliente');

    if (filters.nombre) {
      query.andWhere('cliente.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    }
    if (filters.apellido) {
      query.andWhere('cliente.apellido ILIKE :apellido', { apellido: `%${filters.apellido}%` });
    }
    if (filters.email) {
      query.andWhere('cliente.email ILIKE :email', { email: `%${filters.email}%` });
    }
    if (filters.telefono) {
      query.andWhere('cliente.telefono ILIKE :telefono', { telefono: `%${filters.telefono}%` });
    }
    if (filters.activo !== undefined) {
      query.andWhere('cliente.activo = :activo', { activo: filters.activo });
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

  // ─── CORREDORES ──────────────────────────────────────────────────────────────

  async createCorredor(dto: CreateCorredorDto): Promise<Corredor> {
    const existingUser = await this.usuarioRepository.findOne({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const usuario = this.usuarioRepository.create({
      nombre: dto.nombre,
      email: dto.email,
      password: hashedPassword,
      rol: RolUsuario.CORREDOR,
      activo: true,
    });
    const savedUsuario = await this.usuarioRepository.save(usuario);

    const corredor = this.corredorRepository.create({
      idUsuario: savedUsuario.id,
      licenciaProfesional: dto.licenciaProfesional,
      descripcion: dto.descripcion,
    });

    return this.corredorRepository.save(corredor);
  }

  async getCorredor(idUsuario: string): Promise<Corredor> {
    const corredor = await this.corredorRepository.findOne({ where: { idUsuario } });
    if (!corredor) throw new NotFoundException('Corredor no encontrado');
    return corredor;
  }

  async updateCorredor(idUsuario: string, dto: UpdateCorredorDto): Promise<Corredor> {
    const corredor = await this.corredorRepository.findOne({ where: { idUsuario } });
    if (!corredor) throw new NotFoundException('Corredor no encontrado');

    if (dto.nombre) {
      await this.usuarioRepository.update(idUsuario, { nombre: dto.nombre });
    }

    Object.assign(corredor, dto);
    return this.corredorRepository.save(corredor);
  }

  async getAllCorredores(): Promise<Corredor[]> {
    return this.corredorRepository.find({ relations: { usuario: true } });
  }

  // ─── USUARIOS (STAFF) ─────────────────────────────────────────────────────────

  async createUsuario(data: Partial<Usuario>): Promise<Usuario> {
    const usuario = this.usuarioRepository.create(data);
    return this.usuarioRepository.save(usuario);
  }

  async save(usuario: Usuario): Promise<Usuario> {
    return this.usuarioRepository.save(usuario);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { id } });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    await this.usuarioRepository.update({ id }, { password });
  }

  async findUsuariosWithFilters(filters: FilterUsuarioDto) {
    const query = this.usuarioRepository.createQueryBuilder('usuario');

    if (filters.nombre) query.andWhere('usuario.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
    if (filters.apellido) query.andWhere('usuario.apellido ILIKE :apellido', { apellido: `%${filters.apellido}%` });
    if (filters.email) query.andWhere('usuario.email ILIKE :email', { email: `%${filters.email}%` });
    if (filters.telefono) query.andWhere('usuario.telefono ILIKE :telefono', { telefono: `%${filters.telefono}%` });
    if (filters.rol) query.andWhere('usuario.rol = :rol', { rol: filters.rol });
    if (filters.activo !== undefined) query.andWhere('usuario.activo = :activo', { activo: filters.activo });

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
}
