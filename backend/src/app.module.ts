import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmpresasModule } from './empresas/empresas.module';

@Module({
  imports: [EmpresasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
