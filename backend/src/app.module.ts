import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
import { ContratosModule } from './contratos/contratos.module';
import { CuotasModule } from './cuotas/cuotas.module';
import { ComprobanteModule } from './comprobante/comprobante.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync(typeormConfig),

    EmpresasModule,
    CategoriaModule,
    PropiedadesModule,
    PropiedadImagenModule,
    CloudinaryModule,
    CorredoresModule,
    LeadsModule,
    VisitasModule,
    GoogleCalendarModule,
    CuotasModule,
    ContratosModule,
    UsersModule,
    AuthModule,
    ComprobanteModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}