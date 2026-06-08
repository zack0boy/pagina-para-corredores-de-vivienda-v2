import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EstadoCuota {
  PENDIENTE = 'PENDIENTE',
  PARCIAL = 'PARCIAL',
  PAGADA = 'PAGADA',
  VENCIDA = 'VENCIDA',
  ANULADA = 'ANULADA',
}

@Entity('cuotas')
@Index(['contrato_id'])
@Index(['estado'])
@Index(['fecha_vencimiento'])
export class Cuota {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  contrato_id!: string;

  @Column()
  numero_cuota!: number;

  @Column('decimal', {
    precision: 15,
    scale: 2,
  })
  monto_total!: number;

  @Column('decimal', {
    precision: 15,
    scale: 2,
    default: 0,
  })
  monto_pagado!: number;

  @Column('decimal', {
    precision: 15,
    scale: 2,
  })
  saldo_pendiente!: number;

  @Column({ type: 'date' })
  fecha_vencimiento!: Date;

  @Column({ type: 'date', nullable: true })
  fecha_pago?: Date;

  @Column({
    type: 'enum',
    enum: EstadoCuota,
    default: EstadoCuota.PENDIENTE,
  })
  estado!: EstadoCuota;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
