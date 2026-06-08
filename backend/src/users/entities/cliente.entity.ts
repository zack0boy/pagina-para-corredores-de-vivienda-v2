import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { UsersGoogle } from './user.google.entity';
import { Usuario } from './usuario.entity';
@Entity({ name: 'cliente' })
export class Cliente {
  @PrimaryColumn({ name: 'id_usuario', type: 'uuid' })
  idUsuario!: string;

  @Column({ name: 'telefono', length: 20, nullable: true })
  telefono?: string;

  @Column({ name: 'rut', length: 12, unique: true })
  rut!: string;

  @Column({ name: 'direccion', type: 'text', nullable: true })
  direccion?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToOne(()=>Usuario)
  @JoinColumn({name:"id_usuario"})
  usuario!:Usuario;


}
