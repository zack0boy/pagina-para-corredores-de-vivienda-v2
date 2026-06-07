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
import { RolUsuario, EstadoGeneral } from '../common/enum/estado.enum';
import * as bcrypt from 'bcrypt';
import { UsersGoogle } from './entities/user.google.entity';

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
  async createUsuario(data: Partial<Usuario>) {
  const usuario =
    this.usuarioRepository.create(data);

  return this.usuarioRepository.save(usuario);
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
}