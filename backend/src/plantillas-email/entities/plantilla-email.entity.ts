import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('plantillas_email')
export class PlantillaEmail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  empresa_id: string;

  @Column('varchar', { length: 150 })
  nombre: string;

  @Column('varchar', { length: 255 })
  asunto: string;

  @Column('text')
  contenido: string;

  @Column('boolean', { default: true })
  activa: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
