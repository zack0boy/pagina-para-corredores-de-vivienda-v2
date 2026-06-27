import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { TipoEvento } from '../../common/enum/estado.enum';

@Entity('eventos_calendario')
@Index(['empresa_id'])
@Index(['corredor_id'])
@Index(['fecha_inicio'])
@Index(['tipo'])
export class EventoCalendario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  empresa_id!: string;

  @Column('uuid')
  corredor_id!: string;

  @Column('uuid', { nullable: true })
  cliente_id?: string;

  @Column('uuid', { nullable: true })
  visita_id?: string;

  @Column({ type: 'enum', enum: TipoEvento })
  tipo!: TipoEvento;

  @Column({ length: 150 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'timestamp' })
  fecha_inicio!: Date;

  @Column({ type: 'timestamp' })
  fecha_fin!: Date;

  @Column({ default: false })
  completado!: boolean;

  // ID del evento sincronizado en Google Calendar (si aplica)
  @Column({ name: 'google_event_id', type: 'text', nullable: true })
  google_event_id?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
