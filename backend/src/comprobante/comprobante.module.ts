import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ComprobanteService } from './comprobante.service';
import { ComprobanteController } from './comprobante.controller';
import { Comprobante } from './entities/comprobante.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comprobante,
    ]),
    CloudinaryModule,
  ],
  controllers: [ComprobanteController],
  providers: [ComprobanteService],
  exports: [ComprobanteService],
})
export class ComprobanteModule {}