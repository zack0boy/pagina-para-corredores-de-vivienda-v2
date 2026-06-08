import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Visita } from './entities/visita.entity';
import { VisitasService } from './visitas.service';
import { VisitasController } from './visitas.controller';
import { GoogleCalendarModule } from '../google-calendar/google-calendar.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Visita]),
    GoogleCalendarModule,
    NotificacionesModule,
  ],
  controllers: [VisitasController],
  providers: [VisitasService],
  exports: [VisitasService],
})
export class VisitasModule {}