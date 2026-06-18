import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { EstadoSolicitudCliente } from '../../common/enum/estado.enum';

@Entity('solicitudes_cliente')
@Index(['empresa_id'])
@Index(['cliente_id'])
@Index(['corredor_id'])
@Index(['estado'])
export class SolicitudCliente {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  empresa_id!: string;

  @Column('uuid')
  cliente_id!: string;

  @Column('uuid', { nullable: true })
  corredor_id?: string;

  @Column({ type: 'enum', enum: EstadoSolicitudCliente, default: EstadoSolicitudCliente.PENDIENTE })
  estado!: EstadoSolicitudCliente;

  @Column({ type: 'text', nullable: true })
  mensaje?: string;

  @Column({ type: 'text', nullable: true })
  motivo_rechazo?: string;

  @Column({ type: 'timestamp' })
  fecha_expiracion!: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
