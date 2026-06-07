import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ length: 20, nullable: true })
  rut?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  telefono?: string;

  @Column({ type: 'text', nullable: true })
  direccion?: string;

  @Column({ nullable: true })
  logo_url?: string;

  @Column({ length: 50, default: 'BASICO' })
  plan?: string;

  @Column({ type: 'date', nullable: true })
  fecha_vencimiento?: Date;

  @Column({
    type: 'enum',
    enum: ['ACTIVA', 'SUSPENDIDA'],
    default: 'ACTIVA',
  })
  estado!: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at!: Date;
}