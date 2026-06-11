import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';

@Entity({ name: 'corredor' })
export class Corredor {
  @PrimaryColumn('uuid', { name: 'id_usuario' })
  idUsuario!: string;

  @Column({ name: 'licencia_profesional', length: 50, nullable: true })
  licenciaProfesional?: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  usuario!: Usuario;
}
