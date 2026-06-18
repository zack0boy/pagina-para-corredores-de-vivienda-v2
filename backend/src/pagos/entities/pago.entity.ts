import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { EstadoPago, TipoPago } from '../../common/enum/estado.enum';

@Entity('pagos')
@Index(['cuota_id'])
@Index(['cliente_id'])
@Index(['estado'])
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  cuota_id!: string;

  @Column('uuid')
  cliente_id!: string;

  @Column('decimal', { precision: 15, scale: 2 })
  monto!: number;

  @Column({ type: 'timestamp' })
  fecha_pago!: Date;

  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.PENDIENTE_VALIDACION })
  estado!: EstadoPago;

  @Column({ type: 'enum', enum: TipoPago, default: TipoPago.TRANSFERENCIA })
  tipo_pago!: TipoPago;

  @Column({ type: 'text', nullable: true })
  comentario?: string;

  @Column('uuid', { nullable: true })
  validado_por?: string;

  @Column({ type: 'timestamp', nullable: true })
  fecha_validacion?: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
