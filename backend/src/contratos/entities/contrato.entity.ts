import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TipoContrato {
  VENTA = 'VENTA',
  ARRIENDO = 'ARRIENDO',
  RESERVA = 'RESERVA',
}

export enum EstadoContrato {
  BORRADOR = 'BORRADOR',
  ACTIVO = 'ACTIVO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

@Entity('contratos')
@Index(['empresa_id'])
@Index(['cliente_id'])
@Index(['corredor_id'])
@Index(['propiedad_id'])
@Index(['estado'])
@Index(['tipo'])
export class Contrato {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  empresa_id!: string;

  @Column('uuid')
  propiedad_id!: string;

  @Column('uuid')
  cliente_id!: string;

  @Column('uuid')
  corredor_id!: string;

  @Column({ length: 100, unique: true })
  numero_contrato!: string;

  @Column({
    type: 'enum',
    enum: TipoContrato,
  })
  tipo!: TipoContrato;

  @Column('decimal', {
    precision: 15,
    scale: 2,
  })
  monto_total!: number;

  @Column({ type: 'date' })
  fecha_inicio!: Date;

  @Column({ type: 'date', nullable: true })
  fecha_fin?: Date;

  @Column({ type: 'text', nullable: true })
  contrato_url?: string;

  @Column({
    type: 'enum',
    enum: EstadoContrato,
    default: EstadoContrato.BORRADOR,
  })
  estado!: EstadoContrato;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
