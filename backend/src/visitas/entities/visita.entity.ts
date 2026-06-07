import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { EstadoVisita } from './estado-visita.enum';

@Entity('visitas')
@Index(['empresa_id'])
@Index(['cliente_id'])
@Index(['corredor_id'])
@Index(['propiedad_id'])
@Index(['estado'])
@Index(['fecha_inicio'])
export class Visita {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  empresa_id!: string;

  @Column('uuid', { nullable: true })
  lead_id?: string;

  @Column('uuid')
  propiedad_id!: string;

  @Column('uuid')
  cliente_id!: string;

  @Column('uuid')
  corredor_id!: string;

  @Column({
    type: 'timestamp',
  })
  fecha_inicio!: Date;

  @Column({
    type: 'timestamp',
  })
  fecha_fin!: Date;

  @Column({
    type: 'enum',
    enum: EstadoVisita,
    default: EstadoVisita.PROGRAMADA,
  })
  estado!: EstadoVisita;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  google_event_id?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  observaciones?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}