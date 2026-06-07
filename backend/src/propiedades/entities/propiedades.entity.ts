import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('propiedades')
@Index(['empresa_id'])
@Index(['categoria_id'])
@Index(['estado'])
@Index(['tipo_operacion'])
export class Propiedades {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  empresa_id!: string;

  @Column('uuid', { nullable: true })
  corredor_id?: string;

  @Column('uuid')
  categoria_id!: string;

  @Column({ length: 50, unique: true })
  codigo!: string;

  @Column({ length: 250 })
  titulo!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  descripcion?: string;

  @Column()
  direccion!: string;

  @Column('decimal', {
    precision: 15,
    scale: 2,
  })
  precio!: number;

  @Column()
  tipo_operacion!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitud?: number;

  @Column({
    type: 'decimal',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitud?: number;

  @Column({
    default: 'DISPONIBLE',
  })
  estado!: string;

  @Column({ type: 'integer', default: 0, nullable: true })
  habitaciones?: number;

  @Column({ type: 'integer', default: 0, nullable: true })
  banos?: number;

  @Column({ type: 'integer', default: 0, nullable: true })
  estacionamientos?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  metros_totales?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  metros_construidos?: number;

  @Column('uuid', { nullable: true })
  created_by?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}