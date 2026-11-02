import { Reserva, validarReserva } from './Reserva';
import * as fs from 'fs';
import * as path from 'path';

export class GestorReservas {
  private reservas: Reserva[] = [];
  private filePath: string;

  constructor(filePath: string = 'data/reservas.json') {
    this.filePath = filePath;
    this.cargarReservas();
  }

  private cargarReservas(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        const reservasJson = JSON.parse(data);
        this.reservas = reservasJson.map((r: any) => ({
          ...r,
          inicio: new Date(r.inicio),
          fin: new Date(r.fin),
        }));
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
      this.reservas = [];
    }
  }

  private guardarReservas(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data = JSON.stringify(this.reservas, null, 2);
      fs.writeFileSync(this.filePath, data, 'utf-8');
    } catch (error) {
      console.error('Error al guardar reservas:', error);
    }
  }

  agregarReserva(reserva: Reserva): { exito: boolean; error?: string } {
    const validacion = validarReserva(reserva);
    if (!validacion.valido) {
      return { exito: false, error: validacion.error };
    }

    if (this.haySuperposicion(reserva)) {
      return { exito: false, error: 'La unidad ya tiene una reserva en ese intervalo de tiempo' };
    }

    this.reservas.push(reserva);
    this.guardarReservas();
    return { exito: true };
  }

  private haySuperposicion(nuevaReserva: Reserva): boolean {
    return this.reservas.some(
      (existente) =>
        existente.unidadId === nuevaReserva.unidadId &&
        existente.activa &&
        this.seSuperponen(existente, nuevaReserva)
    );
  }

  private seSuperponen(r1: Reserva, r2: Reserva): boolean {
    return r1.inicio < r2.fin && r2.inicio < r1.fin;
  }

  obtenerReservas(): Reserva[] {
    return [...this.reservas];
  }

  obtenerReservasPorUnidad(unidadId: string): Reserva[] {
    return this.reservas.filter((r) => r.unidadId === unidadId);
  }

  cancelarReserva(id: string): { exito: boolean; error?: string } {
    const reserva = this.reservas.find((r) => r.id === id);
    if (!reserva) {
      return { exito: false, error: 'Reserva no encontrada' };
    }

    reserva.activa = false;
    this.guardarReservas();
    return { exito: true };
  }
}
