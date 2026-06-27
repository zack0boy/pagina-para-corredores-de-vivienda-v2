import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class CreateSolicitudPropiedadDto {
  @IsString()
  @IsOptional()
  empresa_id?: string;

  @IsString()
  solicitante_nombre!: string;

  @IsEmail()
  @IsOptional()
  solicitante_email?: string;

  @IsString()
  @IsOptional()
  solicitante_telefono?: string;

  @IsString()
  titulo!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  direccion!: string;

  @IsNumber()
  precio!: number;

  @IsString()
  @IsOptional()
  tipo_operacion?: string;

  @IsString()
  @IsOptional()
  categoria_id?: string;
}

export class ResolverSolicitudPropiedadDto {
  // APROBADA | RECHAZADA
  @IsString()
  estado!: string;

  // Corredor que resuelve (representante)
  @IsString()
  @IsOptional()
  corredor_id?: string;

  @IsString()
  @IsOptional()
  motivo_rechazo?: string;
}
