import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Lead } from './entities/lead.entity';

import { LeadsController } from './lead.controller';
import { LeadsService } from './lead.service';

import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { CorredoresModule } from '../corredores/corredores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      Propiedades,
    ]),
    CorredoresModule,
  ],
  controllers: [
    LeadsController,
  ],
  providers: [
    LeadsService,
  ],
  exports: [
    LeadsService,
  ],
})
export class LeadsModule {}