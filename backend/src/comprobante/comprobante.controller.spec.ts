import { Test, TestingModule } from '@nestjs/testing';
import { ComprobanteController } from './comprobante.controller';
import { ComprobanteService } from './comprobante.service';

describe('ComprobanteController', () => {
  let controller: ComprobanteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComprobanteController],
      providers: [ComprobanteService],
    }).compile();

    controller = module.get<ComprobanteController>(ComprobanteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
