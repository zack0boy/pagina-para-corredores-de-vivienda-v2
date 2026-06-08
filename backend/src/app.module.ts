import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { typeormConfig } from './database/typeorm.config';

import { EmpresasModule } from './empresas/empresas.module';
import { CategoriaModule } from './categoria/categoria.module';
import { PropiedadesModule } from './propiedades/propiedades.module';
import { PropiedadImagenController } from './propiedad-imagen/propiedad-imagen.controller';
import { PropiedadImagenModule } from './propiedad-imagen/propiedad-imagen.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { LeadsModule } from './lead/lead.module';
import { CorredoresModule } from './corredores/corredores.module';
import { VisitasController } from './visitas/visitas.controller';
import { VisitasModule } from './visitas/visitas.module';
import { GoogleCalendarModule } from './google-calendar/google-calendar.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { PlantillasEmailModule } from './plantillas-email/plantillas-email.module';
import { ContratosModule } from './contratos/contratos.module';
import { CuotasModule } from './cuotas/cuotas.module';
import { ComprobanteModule } from './comprobante/comprobante.module';
import { EmailModule } from './email/email.module';
import { DashboardsModule } from './dashboards/dashboards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(typeormConfig),
    UsersModule,
    AuthModule,
    EmpresasModule,
    CategoriaModule,
    PropiedadesModule,
    PropiedadImagenModule,
    CloudinaryModule,
    CorredoresModule,
    LeadsModule,
    VisitasModule,
    GoogleCalendarModule,
    NotificacionesModule,
    PlantillasEmailModule,
    CuotasModule,
    ContratosModule,
    ComprobanteModule,
    EmailModule,
    UsersModule,
    AuthModule,
    DashboardsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}