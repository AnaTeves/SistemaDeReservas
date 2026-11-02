export interface Reserva {
  id: string;
  unidadId: string;
  solicitante: string;
  inicio: Date;
  fin: Date;
  activa: boolean;
}

export const UNIDADES_VALIDAS = ['MIC-01', 'MIC-02', 'OSC-01', 'MUL-01', 'FUE-01'];

export function validarReserva(reserva: Partial<Reserva>): { valido: boolean; error?: string } {
  if (!reserva.unidadId || !UNIDADES_VALIDAS.includes(reserva.unidadId)) {
    return { valido: false, error: 'ID de unidad inválido' };
  }

  if (!reserva.solicitante || reserva.solicitante.trim() === '') {
    return { valido: false, error: 'El solicitante no puede estar vacío' };
  }

  if (!reserva.inicio || !reserva.fin) {
    return { valido: false, error: 'Las fechas de inicio y fin son requeridas' };
  }

  if (reserva.inicio >= reserva.fin) {
    return { valido: false, error: 'La fecha de inicio debe ser estrictamente anterior a la fecha de fin' };
  }

  return { valido: true };
}
