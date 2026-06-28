import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('historial_propiedad')
@Index(['corredor_id'])
@Index(['propiedad_id'])
export class HistorialPropiedad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid', { nullable: true })
  propiedad_id?: string;

  @Column('uuid', { nullable: true })
  corredor_id?: string;

  // CREADA | ACTUALIZADA | ESTADO_CAMBIADO | ELIMINADA
  @Column()
  accion!: string;

  @Column({ type: 'text', nullable: true })
  detalle?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
