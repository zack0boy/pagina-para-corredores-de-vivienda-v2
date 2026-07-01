import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Corredor } from './entities/corredor.entity';
import { CorredoresService } from './corredores.service';
import { CorredoresController } from './corredores.controller';
import { AsignaCorredorService } from './asigna-corredor.service';
import { Usuario } from '../users/entities/usuario.entity';
import { Corredor as CorredorUsuario } from '../users/entities/corredor.entity';
import { Empresa } from '../empresas/entities/empresa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Corredor,
      Usuario,
      CorredorUsuario,
      Empresa,
    ]),
  ],
  controllers: [CorredoresController],
  providers: [CorredoresService, AsignaCorredorService],
  exports: [CorredoresService],
})
export class CorredoresModule {}
