import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoSolicitudCliente } from '../../common/enum/estado.enum';

export class ResolverSolicitudDto {
  @IsEnum(EstadoSolicitudCliente)
  estado!: EstadoSolicitudCliente;

  @IsString()
  @IsOptional()
  motivo_rechazo?: string;
}
