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
import { /* EstadoGeneral */ } from '../common/enum/estado.enum';
import * as bcrypt from 'bcrypt';
import { UsersGoogle } from './entities/user.google.entity';
import { RolUsuario } from '../common/enum/roles.enum';

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
      passwordHash: hashedPassword,
      rol: RolUsuario.CORREDOR,
      activo: true,
    } as Partial<Usuario>);

    const savedUsuario = await this.usuarioRepository.save(usuario);

    // Crear cliente
    const cliente = this.clienteRepository.create({
      idUsuario: savedUsuario.id as any,
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
      passwordHash: hashedPassword,
      rol: RolUsuario.CORREDOR,
      activo: true,
    } as Partial<Usuario>);

    const savedUsuario = await this.usuarioRepository.save(usuario);

    // Crear corredor
    const corredor = this.corredorRepository.create({
      idUsuario: savedUsuario.id as any,
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
async createUsuario(
  data: Partial<Usuario>,
): Promise<Usuario> {

  const usuario =
    this.usuarioRepository.create({
      ...data,
      apellido: data.apellido ?? '',
    });

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
    idUsuario: string,
    password: string,
  ): Promise<void> {
    await this.usuarioRepository.update(
      idUsuario,
      {
        passwordHash: password,
      },
    );
  }
  async findById(
    idUsuario: string,
  ):Promise<Usuario|null>{

    return await this.usuarioRepository.findOne({

      where:{
        id: idUsuario,
      },

    });
  }
}
