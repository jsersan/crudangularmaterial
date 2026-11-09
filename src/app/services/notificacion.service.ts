// src/app/services/notificacion.service.ts  ·  Avisos con MatSnackBar
import { inject, Service } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Centraliza los avisos para que todos tengan el mismo aspecto y duración */
@Service()
export class NotificacionService {
  private readonly snackBar = inject(MatSnackBar);

  ok(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000, panelClass: 'aviso-ok' });
  }

  error(mensaje: string, e?: unknown): void {
    this.snackBar.open(`${mensaje}${this.detalle(e)}`, 'Cerrar', {
      duration: 6000,
      panelClass: 'aviso-error'
    });
  }

  /** Traduce el error HTTP a algo comprensible para el usuario */
  private detalle(e: unknown): string {
    if (!(e instanceof HttpErrorResponse)) return '';
    if (e.status === 0) return ': no hay conexión con el servidor.';
    if (e.status === 404) return ': el producto ya no existe.';
    if (e.status >= 500) return `: error del servidor (${e.status}).`;
    return ` (código ${e.status}).`;
  }
}
