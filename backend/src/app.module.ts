import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { typeormConfig } from './database/typeorm.config';

import { EmpresasModule } from './empresas/empresas.module';
import { CategoriaModule } from './categoria/categoria.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync(typeormConfig),

    EmpresasModule,
    CategoriaModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}