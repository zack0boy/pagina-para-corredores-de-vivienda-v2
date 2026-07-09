import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum TipoNotificacion {
  LEAD = 'LEAD',
  VISITA = 'VISITA',
  PAGO = 'PAGO',
  SISTEMA = 'SISTEMA',
  CONTRATO = 'CONTRATO',
  SOLICITUD = 'SOLICITUD',
}

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  empresa_id: string;

  @Column('uuid')
  usuario_id: string;

  @Column({
    type: 'enum',
    enum: TipoNotificacion,
    default: TipoNotificacion.SISTEMA,
  })
  tipo: TipoNotificacion;

  @Column('varchar', { length: 255 })
  titulo: string;

  @Column('text')
  mensaje: string;

  @Column('boolean', { default: false })
  leida: boolean;

  @Column('timestamp', { nullable: true })
  fecha_lectura: Date;

  @CreateDateColumn()
  created_at: Date;
}
