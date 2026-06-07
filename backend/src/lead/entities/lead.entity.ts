import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum LeadEstado {
  NUEVO = 'NUEVO',
  ASIGNADO = 'ASIGNADO',
  CONTACTADO = 'CONTACTADO',
  VISITA_PROGRAMADA = 'VISITA_PROGRAMADA',
  NEGOCIACION = 'NEGOCIACION',
  CONVERTIDO = 'CONVERTIDO',
  PERDIDO = 'PERDIDO',
  REASIGNADO = 'REASIGNADO',
}

@Entity('leads')
@Index(['empresa_id'])
@Index(['propiedad_id'])
@Index(['cliente_id'])
@Index(['corredor_id'])
@Index(['estado'])
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  empresa_id!: string;

  @Column('uuid')
  propiedad_id!: string;

  @Column('uuid', { nullable: true })
  cliente_id?: string;

  @Column('uuid', { nullable: true })
  corredor_id?: string;

  @Column()
  nombre!: string;

  @Column()
  telefono!: string;

  @Column({ nullable: true })
  email?: string;

  @Column('text', { nullable: true })
  mensaje?: string;

  @Column({
    type: 'enum',
    enum: LeadEstado,
    default: LeadEstado.NUEVO,
  })
  estado!: LeadEstado;

  @Column({ type: 'timestamp', nullable: true })
  fecha_asignacion?: Date;

  @Column({ type: 'timestamp', nullable: true })
  ultimo_contacto?: Date;

  @Column({ nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}