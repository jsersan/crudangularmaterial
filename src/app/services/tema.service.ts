// src/app/services/tema.service.ts  ·  Modo claro / oscuro
import { DOCUMENT, effect, inject, Service, signal } from '@angular/core';

const CLAVE = 'crud-electronica-tema';

/**
 * Guarda el modo de color en un signal y lo aplica al <html>:
 * la clase .tema-oscuro cambia color-scheme y el tema de Material
 * (theme-type: color-scheme) recalcula todos sus colores solo.
 */
@Service()
export class TemaService {
  private readonly document = inject(DOCUMENT);

  readonly oscuro = signal(this.preferenciaInicial());

  constructor() {
    effect(() => {
      const oscuro = this.oscuro();
      this.document.documentElement.classList.toggle('tema-oscuro', oscuro);
      try {
        localStorage.setItem(CLAVE, oscuro ? 'oscuro' : 'claro');
      } catch {
        // Sin localStorage (modo privado estricto): el tema no se recuerda
      }
    });
  }

  alternar(): void {
    this.oscuro.update(valor => !valor);
  }

  /** Lo guardado por el usuario o, si no hay nada, la preferencia del sistema */
  private preferenciaInicial(): boolean {
    try {
      const guardado = localStorage.getItem(CLAVE);
      if (guardado) return guardado === 'oscuro';
    } catch {
      /* sin acceso a localStorage */
    }
    return this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches ?? false;
  }
}
