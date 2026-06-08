import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlantillaEmail } from './entities/plantilla-email.entity';
import { PlantillasEmailService } from './plantillas-email.service';
import { PlantillasEmailController } from './plantillas-email.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlantillaEmail])],
  controllers: [PlantillasEmailController],
  providers: [PlantillasEmailService],
  exports: [PlantillasEmailService],
})
export class PlantillasEmailModule {}
