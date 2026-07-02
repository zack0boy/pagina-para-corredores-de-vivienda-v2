import { IsString, Matches } from 'class-validator';

export class PromoverAdminDto {
  // Patrón hex laxo: la BD tiene ids sembrados que no cumplen el RFC de UUID
  @IsString()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'empresa_id debe ser un UUID válido',
  })
  empresa_id!: string;
}
