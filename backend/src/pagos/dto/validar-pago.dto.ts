import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { EstadoPago } from '../../common/enum/estado.enum';

export class ValidarPagoDto {
  @IsEnum(EstadoPago)
  estado!: EstadoPago;

  @IsUUID()
  validado_por!: string;

  @IsString()
  @IsOptional()
  comentario?: string;
}
