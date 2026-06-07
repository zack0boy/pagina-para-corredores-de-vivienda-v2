import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsUrl,
} from 'class-validator';

export class CreatePropiedadImagenDto {
  @IsUUID()
  propiedad_id!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  public_id?: string;

  @IsOptional()
  @IsNumber()
  orden?: number;
}