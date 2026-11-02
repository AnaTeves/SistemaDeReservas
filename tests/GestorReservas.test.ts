import { GestorReservas } from '../src/GestorReservas';
import { Reserva } from '../src/Reserva';

describe('GestorReservas - Validación de superposiciones', () => {
  let gestor: GestorReservas;

  beforeEach(() => {
    gestor = new GestorReservas();
  });

  test('debe rechazar superposiciones para la misma unidad MIC-01', () => {
    const baseDate = new Date('2026-11-02T10:00:00');

    const reserva1: Reserva = {
      id: '1',
      unidadId: 'MIC-01',
      solicitante: 'Juan Pérez',
      inicio: new Date(baseDate.getTime()),
      fin: new Date(baseDate.getTime() + 60 * 60 * 1000),
      activa: true,
    };

    const reserva2: Reserva = {
      id: '2',
      unidadId: 'MIC-01',
      solicitante: 'María García',
      inicio: new Date(baseDate.getTime() + 30 * 60 * 1000),
      fin: new Date(baseDate.getTime() + 90 * 60 * 1000),
      activa: true,
    };

    const resultado1 = gestor.agregarReserva(reserva1);
    expect(resultado1.exito).toBe(true);

    const resultado2 = gestor.agregarReserva(reserva2);
    expect(resultado2.exito).toBe(false);
    expect(resultado2.error).toBe('La unidad ya tiene una reserva en ese intervalo de tiempo');
  });

  test('debe permitir límites consecutivos para la misma unidad MIC-01', () => {
    const baseDate = new Date('2026-11-02T10:00:00');

    const reserva1: Reserva = {
      id: '1',
      unidadId: 'MIC-01',
      solicitante: 'Juan Pérez',
      inicio: new Date(baseDate.getTime()),
      fin: new Date(baseDate.getTime() + 60 * 60 * 1000),
      activa: true,
    };

    const reserva2: Reserva = {
      id: '2',
      unidadId: 'MIC-01',
      solicitante: 'María García',
      inicio: new Date(baseDate.getTime() + 60 * 60 * 1000),
      fin: new Date(baseDate.getTime() + 120 * 60 * 1000),
      activa: true,
    };

    const resultado1 = gestor.agregarReserva(reserva1);
    expect(resultado1.exito).toBe(true);

    const resultado2 = gestor.agregarReserva(reserva2);
    expect(resultado2.exito).toBe(true);
  });

  test('debe rechazar solicitante vacío', () => {
    const baseDate = new Date('2026-11-02T10:00:00');

    const reserva: Reserva = {
      id: '1',
      unidadId: 'MIC-01',
      solicitante: '',
      inicio: new Date(baseDate.getTime()),
      fin: new Date(baseDate.getTime() + 60 * 60 * 1000),
      activa: true,
    };

    const resultado = gestor.agregarReserva(reserva);
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toBe('El solicitante no puede estar vacío');
  });

  test('debe rechazar solicitante con solo espacios', () => {
    const baseDate = new Date('2026-11-02T10:00:00');

    const reserva: Reserva = {
      id: '1',
      unidadId: 'MIC-01',
      solicitante: '   ',
      inicio: new Date(baseDate.getTime()),
      fin: new Date(baseDate.getTime() + 60 * 60 * 1000),
      activa: true,
    };

    const resultado = gestor.agregarReserva(reserva);
    expect(resultado.exito).toBe(false);
    expect(resultado.error).toBe('El solicitante no puede estar vacío');
  });
});
