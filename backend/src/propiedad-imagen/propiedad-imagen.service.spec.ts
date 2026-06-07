import { Test, TestingModule } from '@nestjs/testing';
import { PropiedadImagenService } from './propiedad-imagen.service';

describe('PropiedadImagenService', () => {
  let service: PropiedadImagenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropiedadImagenService],
    }).compile();

    service = module.get<PropiedadImagenService>(PropiedadImagenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
