import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../users/entities/cliente.entity';
import { Corredor } from '../../users/entities/corredor.entity';
import { Propiedades } from '../../propiedades/entities/propiedades.entity';
import {
  EstadoGeneral,
  TipoOperacion,
} from '../../common/enum/estado.enum';

@Entity({ name: 'contrato' })
export class Contrato {
  @PrimaryGeneratedColumn({ name: 'id_contrato' })
  idContrato!: number;

  @Column({
    name: 'tipo',
    type: 'enum',
    enum: TipoOperacion,
  })
  tipo!: TipoOperacion;

  @Column({ name: 'monto_total', type: 'numeric', precision: 15, scale: 2 })
  montoTotal!: number;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: Date;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin?: Date;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoGeneral,
    default: EstadoGeneral.ACTIVO,
  })
  estado!: EstadoGeneral;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Cliente, { eager: true })
  @JoinColumn({ name: 'id_cliente' })
  cliente!: Cliente;

  @ManyToOne(() => Corredor, { eager: true })
  @JoinColumn({ name: 'id_corredor' })
  corredor!: Corredor;

  @ManyToOne(() => Propiedades, { eager: true })
  @JoinColumn({ name: 'id_propiedad' })
  propiedad!: Propiedades;
}

