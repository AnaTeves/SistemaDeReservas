import express, { Request, Response } from 'express';
import { GestorReservas } from './GestorReservas';
import { Reserva, UNIDADES_VALIDAS } from './Reserva';

const PORT = 3000;

export function createApp(gestor: GestorReservas) {
  const app = express();

  app.use(express.json());

  app.get('/disponibilidad', (req: Request, res: Response) => {
    const { unidad, inicio, fin } = req.query;

    if (!unidad || !inicio || !fin) {
      return res.status(400).json({ error: 'Faltan parámetros: unidad, inicio, fin' });
    }

    if (typeof unidad !== 'string' || typeof inicio !== 'string' || typeof fin !== 'string') {
      return res.status(400).json({ error: 'Parámetros inválidos' });
    }

    if (!UNIDADES_VALIDAS.includes(unidad)) {
      return res.status(400).json({ error: 'ID de unidad inválido' });
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    if (fechaInicio >= fechaFin) {
      return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha de fin' });
    }

    const reservas = gestor.obtenerReservasPorUnidad(unidad);
    const disponible = !reservas.some(
      (r) =>
        r.activa &&
        r.inicio < fechaFin &&
        fechaInicio < r.fin
    );

    res.json({ disponible, unidad, inicio: fechaInicio.toISOString(), fin: fechaFin.toISOString() });
  });

  app.post('/reservas', (req: Request, res: Response) => {
    const { unidad, solicitante, inicio, fin } = req.body;

    if (!unidad || !solicitante || !inicio || !fin) {
      return res.status(400).json({ error: 'Faltan campos: unidad, solicitante, inicio, fin' });
    }

    if (!UNIDADES_VALIDAS.includes(unidad)) {
      return res.status(400).json({ error: 'ID de unidad inválido' });
    }

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).json({ error: 'Fechas inválidas' });
    }

    if (fechaInicio >= fechaFin) {
      return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha de fin' });
    }

    const nuevaReserva: Reserva = {
      id: Date.now().toString(),
      unidadId: unidad,
      solicitante,
      inicio: fechaInicio,
      fin: fechaFin,
      activa: true,
    };

    const resultado = gestor.agregarReserva(nuevaReserva);

    if (!resultado.exito) {
      return res.status(400).json({ error: resultado.error });
    }

    res.status(201).json(nuevaReserva);
  });

  app.post('/reservas/:id/cancelar', (req: Request, res: Response) => {
    const { id } = req.params;

    const resultado = gestor.cancelarReserva(String(id));

    if (!resultado.exito) {
      return res.status(404).json({ error: resultado.error });
    }

    res.json({ mensaje: 'Reserva cancelada exitosamente', id });
  });

  return app;
}

const gestor = new GestorReservas('data/reservas.json');
const app = createApp(gestor);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export { app, gestor };
