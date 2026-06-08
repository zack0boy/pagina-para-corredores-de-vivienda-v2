import { PartialType } from '@nestjs/mapped-types';
import { CreateContratoDto } from './create-contrato.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoContrato } from '../entities/contrato.entity';

export class UpdateContratoDto extends PartialType(CreateContratoDto) {
  @IsOptional()
  @IsEnum(EstadoContrato)
  estado?: EstadoContrato;
}
