import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('solicitudes_propiedad')
@Index(['estado'])
export class SolicitudPropiedad {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  empresa_id?: string;

  // Datos de quien solicita publicar
  @Column()
  solicitante_nombre!: string;

  @Column({ nullable: true })
  solicitante_email?: string;

  @Column({ nullable: true })
  solicitante_telefono?: string;

  // Datos de la propiedad propuesta
  @Column()
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column()
  direccion!: string;

  @Column('decimal', { precision: 15, scale: 2 })
  precio!: number;

  @Column({ default: 'VENTA' })
  tipo_operacion!: string;

  @Column({ type: 'uuid', nullable: true })
  categoria_id?: string;

  // PENDIENTE | APROBADA | RECHAZADA
  @Column({ default: 'PENDIENTE' })
  estado!: string;

  // Corredor que resolvió la solicitud (representante)
  @Column({ type: 'uuid', nullable: true })
  corredor_id?: string;

  @Column({ type: 'text', nullable: true })
  motivo_rechazo?: string;

  // Propiedad creada al aprobar
  @Column({ type: 'uuid', nullable: true })
  propiedad_id?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
