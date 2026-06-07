import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriasService } from './categoria.service';
import { CategoriasController } from './categoria.controller';
import { Categoria } from './entities/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria])],
  controllers: [CategoriasController],
  providers: [CategoriasService],
})
export class CategoriaModule {}