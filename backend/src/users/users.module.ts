import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Cliente } from './entities/cliente.entity';
import { Corredor } from './entities/corredor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Cliente,
      Corredor,
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
