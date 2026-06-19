import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { EstadoCliente } from '../../common/enum/estado.enum';

@Entity({ name: 'clientes' })
@Index(['empresa_id'])
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  empresa_id!: string;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  @Column({ length: 150, nullable: true, unique: true })
  email?: string;

  @Column({ length: 30 })
  telefono!: string;

  @Column({ type: 'text', nullable: true, name: 'password_hash' })
  password?: string;

  @Column({ nullable: true, name: 'google_id' })
  googleId?: string;

  @Column({ default: true })
  activo!: boolean;

  @Column({ name: 'email_verificado', default: false })
  emailVerificado!: boolean;

  @Column({
    type: 'enum',
    enum: EstadoCliente,
    default: EstadoCliente.PENDIENTE_VALIDACION,
  })
  estado!: EstadoCliente;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
