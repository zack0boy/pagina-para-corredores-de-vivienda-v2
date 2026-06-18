import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateSolicitudClienteDto {
  @IsUUID()
  empresa_id!: string;

  @IsUUID()
  cliente_id!: string;

  @IsUUID()
  @IsOptional()
  corredor_id?: string;

  @IsString()
  @IsOptional()
  mensaje?: string;
}
