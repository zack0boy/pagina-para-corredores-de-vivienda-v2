import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PagosService } from './pagos.service';
import { Pago } from './entities/pago.entity';
import { Propiedades } from '../propiedades/entities/propiedades.entity';
import { TipoPago } from '../common/enum/estado.enum';

describe('PagosService', () => {
  let service: PagosService;
  let pagoRepository: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock };
  let propiedadesRepository: { findOne: jest.Mock; find: jest.Mock };

  beforeEach(async () => {
    pagoRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    propiedadesRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        PagosService,
        { provide: getRepositoryToken(Pago), useValue: pagoRepository },
        { provide: getRepositoryToken(Propiedades), useValue: propiedadesRepository },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
  });

  it('asigna el corredor cuando el pago llega solo con el título de la propiedad', async () => {
    propiedadesRepository.findOne.mockResolvedValue({ corredor_id: 'corredor-123' });
    pagoRepository.create.mockImplementation((value) => value);
    pagoRepository.save.mockImplementation((value) => Promise.resolve({ id: 'pago-1', ...value }));

    const dto = {
      cliente_id: 'cliente-1',
      cliente_nombre: 'Juan Pérez',
      monto: 120000,
      fecha_pago: '2024-01-01T10:00:00.000Z',
      tipo_pago: TipoPago.TRANSFERENCIA,
      propiedad_titulo: 'Casa bonita',
    };

    await service.create(dto as any);

    expect(propiedadesRepository.findOne).toHaveBeenCalled();
    expect(pagoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ corredor_id: 'corredor-123' }),
    );
  });
});
