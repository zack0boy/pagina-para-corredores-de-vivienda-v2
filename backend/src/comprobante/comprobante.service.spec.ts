import { Test, TestingModule } from '@nestjs/testing';
import { ComprobanteService } from './comprobante.service';

describe('ComprobanteService', () => {
  let service: ComprobanteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComprobanteService],
    }).compile();

    service = module.get<ComprobanteService>(ComprobanteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
