import { GestorReservas } from '../src/GestorReservas';
import { Reserva } from '../src/Reserva';
import * as fs from 'fs';
import * as path from 'path';

describe('GestorReservas - Persistencia y Cancelación', () => {
  const testFilePath = 'data/reservas-test.json';

  afterEach(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  test('debe persistir y recuperar reservas, incluyendo canceladas', () => {
    const baseDate = new Date('2026-11-02T10:00:00');

    const reserva1: Reserva = {
      id: '1',
      unidadId: 'MIC-01',
      solicitante: 'Juan Pérez',
      inicio: new Date(baseDate.getTime()),
      fin: new Date(baseDate.getTime() + 60 * 60 * 1000),
      activa: true,
    };

    const gestor1 = new GestorReservas(testFilePath);
    const resultado1 = gestor1.agregarReserva(reserva1);
    expect(resultado1.exito).toBe(true);

    const resultadoCancelacion = gestor1.cancelarReserva('1');
    expect(resultadoCancelacion.exito).toBe(true);

    const reservasAntes = gestor1.obtenerReservas();
    expect(reservasAntes).toHaveLength(1);
    expect(reservasAntes[0].id).toBe('1');
    expect(reservasAntes[0].activa).toBe(false);

    const gestor2 = new GestorReservas(testFilePath);
    const reservasDespues = gestor2.obtenerReservas();
    expect(reservasDespues).toHaveLength(1);
    expect(reservasDespues[0].id).toBe('1');
    expect(reservasDespues[0].solicitante).toBe('Juan Pérez');
    expect(reservasDespues[0].activa).toBe(false);

    const reserva2: Reserva = {
      id: '2',
      unidadId: 'MIC-01',
      solicitante: 'María García',
      inicio: new Date(baseDate.getTime()),
      fin: new Date(baseDate.getTime() + 60 * 60 * 1000),
      activa: true,
    };

    const resultado2 = gestor2.agregarReserva(reserva2);
    expect(resultado2.exito).toBe(true);

    const reservasFinales = gestor2.obtenerReservas();
    expect(reservasFinales).toHaveLength(2);
    expect(reservasFinales.find((r) => r.id === '1')?.activa).toBe(false);
    expect(reservasFinales.find((r) => r.id === '2')?.activa).toBe(true);
  });

  test('debe crear el directorio data si no existe', () => {
    const customPath = 'data/test-nested/reservas-test.json';
    const testDir = path.dirname(customPath);

    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }

    const gestor = new GestorReservas(customPath);
    expect(fs.existsSync(testDir)).toBe(true);

    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
});
