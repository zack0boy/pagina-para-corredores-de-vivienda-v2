import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { typeormConfig } from './database/typeorm.config';

import { EmpresasModule } from './empresas/empresas.module';

import { CategoriaController } from './categoria/categoria.controller';
import { CategoriaService } from './categoria/categoria.service';
import { CategoriaModule } from './categoria/categoria.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync(typeormConfig),

    EmpresasModule,
    CategoriasModule,
    CategoriaModule,
  ],

  controllers: [AppController, CategoríasController, CategoriaController],

  providers: [AppService, CategoríasService, CategoriaService],
})
export class AppModule {}