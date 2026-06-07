import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Cliente } from './entities/cliente.entity';
import { Corredor } from './entities/corredor.entity';
import { UsersGoogle } from './entities/user.google.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Cliente,
      Corredor,
      UsersGoogle,
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
