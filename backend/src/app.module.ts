import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { EmpresasModule } from './empresas/empresas.module';
import { CategoriaModule } from './categoria/categoria.module';
import { PropiedadesModule } from './propiedades/propiedades.module';
import { PropiedadImagenController } from './propiedad-imagen/propiedad-imagen.controller';
import { PropiedadImagenModule } from './propiedad-imagen/propiedad-imagen.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContratosModule } from './contratos/contratos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<number>('DB_PORT', 5432)),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'postgres'),
        entities: [__dirname + '/**/*.entity.{ts,js}'],
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    AuthModule,
    EmpresasModule,
    CategoriaModule,
    PropiedadesModule,
    PropiedadImagenModule,
    CloudinaryModule,
    ContratosModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}