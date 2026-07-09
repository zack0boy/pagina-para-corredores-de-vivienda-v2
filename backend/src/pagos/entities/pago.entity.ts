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
@Index(['empresa_id'])
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { nullable: true })
  empresa_id?: string;

  @Column('uuid', { nullable: true })
  cuota_id?: string;

  @Column('uuid', { nullable: true })
  cliente_id?: string;

  // Nombre del cliente para registro manual (cuando no es un cliente registrado)
  @Column({ type: 'text', nullable: true })
  cliente_nombre?: string;

  // Corredor que registró el pago
  @Column('uuid', { nullable: true })
  corredor_id?: string;

  // Propiedad asociada al pago (opcional)
  @Column('uuid', { nullable: true })
  propiedad_id?: string;

  // Título de la propiedad (para mostrar sin otra consulta)
  @Column({ type: 'text', nullable: true })
  propiedad_titulo?: string;

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
