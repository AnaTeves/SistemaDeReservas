import request from 'supertest';
import { createApp } from '../src/server';
import { GestorReservas } from '../src/GestorReservas';
import * as fs from 'fs';

describe('API REST - Endpoints básicos', () => {
  const testFilePath = 'data/reservas-api-test.json';
  let gestor: GestorReservas;
  let app: any;

  beforeAll(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    gestor = new GestorReservas(testFilePath);
    app = createApp(gestor);
  });

  afterAll(() => {
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  test('GET /disponibilidad debe responder que está disponible cuando no hay reservas', async () => {
    const response = await request(app)
      .get('/disponibilidad')
      .query({
        unidad: 'MIC-01',
        inicio: '2026-11-02T10:00:00.000Z',
        fin: '2026-11-02T11:00:00.000Z',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('disponible', true);
    expect(response.body).toHaveProperty('unidad', 'MIC-01');
  });

  test('GET /disponibilidad debe responder 400 si faltan parámetros', async () => {
    const response = await request(app)
      .get('/disponibilidad')
      .query({
        unidad: 'MIC-01',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('POST /reservas debe crear una reserva exitosamente', async () => {
    const response = await request(app)
      .post('/reservas')
      .send({
        unidad: 'MIC-01',
        solicitante: 'Juan Pérez',
        inicio: '2026-11-02T10:00:00.000Z',
        fin: '2026-11-02T11:00:00.000Z',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('unidadId', 'MIC-01');
    expect(response.body).toHaveProperty('solicitante', 'Juan Pérez');
    expect(response.body).toHaveProperty('activa', true);
  });

  test('POST /reservas debe responder 400 si hay superposición', async () => {
    await request(app)
      .post('/reservas')
      .send({
        unidad: 'MIC-01',
        solicitante: 'Juan Pérez',
        inicio: '2026-11-02T10:00:00.000Z',
        fin: '2026-11-02T11:00:00.000Z',
      });

    const response = await request(app)
      .post('/reservas')
      .send({
        unidad: 'MIC-01',
        solicitante: 'María García',
        inicio: '2026-11-02T10:30:00.000Z',
        fin: '2026-11-02T11:30:00.000Z',
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('POST /reservas/:id/cancelar debe cancelar una reserva existente', async () => {
    const crearResponse = await request(app)
      .post('/reservas')
      .send({
        unidad: 'MIC-02',
        solicitante: 'Ana López',
        inicio: '2026-11-02T14:00:00.000Z',
        fin: '2026-11-02T15:00:00.000Z',
      });

    const reservaId = crearResponse.body.id;

    const cancelarResponse = await request(app)
      .post(`/reservas/${reservaId}/cancelar`);

    expect(cancelarResponse.status).toBe(200);
    expect(cancelarResponse.body).toHaveProperty('mensaje', 'Reserva cancelada exitosamente');
    expect(cancelarResponse.body).toHaveProperty('id', reservaId);
  });

  test('POST /reservas/:id/cancelar debe responder 404 si la reserva no existe', async () => {
    const response = await request(app)
      .post('/reservas/999/cancelar');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
});
