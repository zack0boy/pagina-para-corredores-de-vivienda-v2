import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('lead_auditoria')
export class LeadAuditoria {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  lead_id!: string;

  @Column()
  accion!: string; // 'CREADO', 'REASIGNADO', 'MOVIDO', 'ACTUALIZADO', etc

  @Column({ type: 'jsonb', nullable: true })
  datos_anteriores?: any;

  @Column({ type: 'jsonb', nullable: true })
  datos_nuevos?: any;

  @Column({ nullable: true })
  motivo?: string;

  @Column()
  realizado_por!: string; // ID del admin que hizo el cambio

  @CreateDateColumn()
  created_at!: Date;
}
