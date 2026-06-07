import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Unique,
} from 'typeorm';

import { EstadoGeneral, RolUsuario } from '../../common/enum/estado.enum';
import { Role } from '../../common/enum/roles.enum';

import { Cliente } from './cliente.entity';
import { Corredor } from './corredor.entity';
import { UsersGoogle } from '../entities/user.google.entity';


@Entity({ name: 'usuario' })
@Unique(['email'])
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario' })
  idUsuario!: number;

  @Column({ name: 'nombre', length: 100 })
  nombre!: string;

  @Column({ name: 'email', length: 150 })
  email!: string;

  @Column({ name: 'password', length: 255 })
  password!: string;

  @Column({ name: 'rol', type: 'enum', enum: RolUsuario })
  rol!: RolUsuario;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoGeneral,
    default: EstadoGeneral.ACTIVO,
  })
  estado!: EstadoGeneral;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToOne(() => Cliente, { nullable: true })
  cliente?: Cliente;

  @OneToOne(() => Corredor, { nullable: true })
  corredor?: Corredor;

  @OneToOne(() => UsersGoogle, { nullable: true })
  usersGoogle?: UsersGoogle;


}
