import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('propiedad_imagenes')
export class PropiedadImagen {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  propiedad_id!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  public_id?: string;

  @Column({
    default: 1,
    nullable: true,
  })
  orden?: number;

  @CreateDateColumn()
  created_at!: Date;
}