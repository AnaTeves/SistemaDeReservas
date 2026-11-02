import { Reserva, validarReserva } from './Reserva';

export class GestorReservas {
  private reservas: Reserva[] = [];

  agregarReserva(reserva: Reserva): { exito: boolean; error?: string } {
    const validacion = validarReserva(reserva);
    if (!validacion.valido) {
      return { exito: false, error: validacion.error };
    }

    if (this.haySuperposicion(reserva)) {
      return { exito: false, error: 'La unidad ya tiene una reserva en ese intervalo de tiempo' };
    }

    this.reservas.push(reserva);
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
    return { exito: true };
  }
}
