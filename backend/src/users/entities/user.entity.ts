import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToOne, JoinColumn, Unique } from 'typeorm';

@Entity({ name: 'users_google' })
@Unique(['idUsuario'])
@Unique(['googleId'])
export class UsersGoogle {
  @PrimaryGeneratedColumn({ name: 'id_google' })
  idGoogle!: number;

  @Column({ name: 'id_usuario' })
  idUsuario!: number;

  @Column({ name: 'google_id', length: 255 })
  googleId!: string;

  @Column({ name: 'google_email', length: 150 })
  googleEmail!: string;

  @Column({ name: 'google_picture', type: 'text', nullable: true })
  googlePicture?: string;

  @Column({ name: 'access_token', type: 'text', nullable: true })
  accessToken?: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ name: 'token_expiry_date', type: 'timestamp', nullable: true })
  tokenExpiryDate?: Date;

  @Column({ name: 'calendar_enabled', default: true })
  calendarEnabled!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

}
