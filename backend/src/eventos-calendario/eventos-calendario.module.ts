import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoCalendario } from './entities/evento-calendario.entity';
import { EventosCalendarioService } from './eventos-calendario.service';
import { EventosCalendarioController } from './eventos-calendario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EventoCalendario])],
  controllers: [EventosCalendarioController],
  providers: [EventosCalendarioService],
  exports: [EventosCalendarioService],
})
export class EventosCalendarioModule {}
