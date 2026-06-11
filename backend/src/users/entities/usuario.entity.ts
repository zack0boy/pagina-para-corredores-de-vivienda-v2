import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  Unique,
} from 'typeorm';

import { Cliente } from './cliente.entity';
import { Corredor } from './corredor.entity';
import { RolUsuario } from '../../common/enum/roles.enum';

@Entity({ name: 'usuarios' })
@Unique(['email'])
export class Usuario {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'nombre' })
  nombre!: string;

  @Column({ name: 'apellido', nullable: true })
  apellido?: string;

  @Column({ name: 'email' })
  email!: string;

  @Column({ name: 'telefono', nullable: true })
  telefono?: string;

  @Column({ name: 'password_hash' })
  password!: string;

  @Column({ name: 'rol' })
  rol!: RolUsuario;

  @Column({ name: 'activo', default: true })
  activo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToOne(() => Cliente, (cliente) => cliente.usuario)
  cliente?: Cliente;

  @OneToOne(() => Corredor, (corredor) => corredor.usuario)
  corredor?: Corredor;
}
