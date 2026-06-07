import {
  IsUUID,
  IsOptional,
  IsString,
} from 'class-validator';

export class MoveLeadDto {
  @IsUUID()
  propiedad_id!: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}
