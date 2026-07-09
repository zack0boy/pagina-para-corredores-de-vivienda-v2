import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ComprobanteEstado {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
}

@Entity({ name: 'comprobantes' })
export class Comprobante {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'pago_id',
    type: 'uuid',
  })
  pagoId!: string;

  @Column({
    name: 'archivo_url',
    type: 'text',
  })
  archivoUrl!: string;

  @Column({
    name: 'nombre_archivo',
    length: 255,
    nullable: true,
  })
  nombreArchivo?: string;

  @Column({
    name: 'tipo_archivo',
    length: 50,
    nullable: true,
  })
  tipoArchivo?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  observaciones?: string;

  @Column({
    type: 'enum',
    enum: ComprobanteEstado,
    default: ComprobanteEstado.PENDIENTE,
  })
  estado!: ComprobanteEstado;

  @Column({
    name: 'public_id',
    type: 'text',
    nullable: true,
  })
  publicId?: string;

  @Column({
    name: 'validado_por',
    type: 'uuid',
    nullable: true,
  })
  validadoPor?: string;

  @Column({
    name: 'fecha_validacion',
    type: 'timestamp',
    nullable: true,
  })
  fechaValidacion?: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt!: Date;
}