import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

import { Corredor } from './corredor.entity';
import { Cliente } from './cliente.entity';
import { UsersGoogle } from './user.google.entity';
import { RolUsuario } from '../../common/enum/roles.enum';

@Entity('usuarios')
export class Usuario {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({
    name: 'google_id',
    nullable: true,
  })
  googleId?: string;

  @Column({
    type: 'enum',
    enum: RolUsuario,
  })
  rol!: RolUsuario;

  @Column({
    default: true,
  })
  activo!: boolean;

  @Column({
    name: 'ultimo_acceso',
    nullable: true,
  })
  ultimoAcceso?: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt!: Date;

  @OneToOne(
    () => Cliente,
    (cliente) => cliente.usuario,
  )
  cliente?: Cliente;

  @OneToOne(
    () => Corredor,
    (corredor) => corredor.usuario,
  )
  corredor?: Corredor;

  @OneToOne(
    () => UsersGoogle,
    (google) => google.usuario,
  )
  usersGoogle?: UsersGoogle;
}