import { Test, TestingModule } from '@nestjs/testing';
import { PropiedadImagenController } from './propiedad-imagen.controller';

describe('PropiedadImagenController', () => {
  let controller: PropiedadImagenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropiedadImagenController],
    }).compile();

    controller = module.get<PropiedadImagenController>(PropiedadImagenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
