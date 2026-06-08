import { IsUUID, IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateCuotaDto {
  @IsUUID()
  contrato_id!: string;

  @IsNumber()
  numero_cuota!: number;

  @IsNumber()
  monto_total!: number;

  @IsDateString()
  fecha_vencimiento!: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
