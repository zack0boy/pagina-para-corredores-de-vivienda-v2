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
import { EstadoGeneral } from '../common/enum/estado.enum';
import * as bcrypt from 'bcrypt';
import { UsersGoogle } from './entities/user.google.entity';
import { RolUsuario } from '../common/enum/roles.enum';
import { FilterClienteDto } from './dto/filter-cliente.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';

@Injectable()
export class UsersService {
constructor(
    @InjectRepository(UsersGoogle)
    private usersGoogleRepository: Repository<UsersGoogle>,
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
      estado: EstadoGeneral.ACTIVO,
    });

    const savedUsuario = await this.usuarioRepository.save(usuario);

    // Crear cliente
    const cliente = this.clienteRepository.create({
      idUsuario: savedUsuario.idUsuario,
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
      estado: EstadoGeneral.ACTIVO,
    });

    const savedUsuario = await this.usuarioRepository.save(usuario);

    // Crear corredor
    const corredor = this.corredorRepository.create({
      idUsuario: savedUsuario.idUsuario,
      licenciaProfesional: dto.licenciaProfesional,
      descripcion: dto.descripcion,
    });

    return this.corredorRepository.save(corredor);
  }

  async getCliente(idUsuario: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { idUsuario },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }

  async getCorredor(idUsuario: number): Promise<Corredor> {
    const corredor = await this.corredorRepository.findOne({
      where: { idUsuario },
    });

    if (!corredor) {
      throw new NotFoundException('Corredor no encontrado');
    }

    return corredor;
  }

  async updateCliente(idUsuario: number, dto: UpdateClienteDto): Promise<Cliente> {
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

  async updateCorredor(idUsuario: number, dto: UpdateCorredorDto): Promise<Corredor> {
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
      query.andWhere('usuario.estado = :estado', { estado: filters.activo ? EstadoGeneral.ACTIVO : EstadoGeneral.INACTIVO });
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
      query.andWhere('usuario.estado = :estado', { estado: filters.activo ? EstadoGeneral.ACTIVO : EstadoGeneral.INACTIVO });
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
async findGoogleUserByEmail(email: string) {
  return this.usersGoogleRepository.findOne({
    where: {
      googleEmail: email,
    },
    relations: { usuario: true },
  });
}
async createGoogleUser(
  data: Partial<UsersGoogle>,
) {
  const googleUser =
    this.usersGoogleRepository.create(data);

  return this.usersGoogleRepository.save(
    googleUser,
  );
}
async findByEmail(email: string) {
  return this.usuarioRepository.findOne({
    where: { email },
  });
}

async updatePassword(
  idUsuario: number,
  password: string,
): Promise<void> {
  await this.usuarioRepository.update(
    { idUsuario },
    {
      password,
    },
  );
}
async findById(
  idUsuario:number,
):Promise<Usuario|null>{

  return await this.usuarioRepository.findOne({

    where:{
      idUsuario,
    },

  });

}
}