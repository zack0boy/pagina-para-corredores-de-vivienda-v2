import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('propiedades')
export class Propiedades {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  empresa_id!: string;

  @Column('uuid')
  categoria_id!: string;

  @Column({ length: 200 })
  titulo!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  descripcion?: string;

  @Column('decimal', {
    precision: 15,
    scale: 2,
  })
  precio!: number;

  @Column()
  tipo_operacion!: string;

  @Column()
  direccion!: string;

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

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}