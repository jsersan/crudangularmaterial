// src/app/components/estado-stock/estado-stock.component.ts
// Indicador tipo LED: verde (en stock), ámbar (stock bajo) o rojo (agotado)
import { Component, computed, input } from '@angular/core';

/** A partir de este número de unidades (incluido) el stock se considera bajo */
export const UMBRAL_STOCK_BAJO = 5;

export type NivelStock = 'ok' | 'bajo' | 'agotado';

export function nivelStock(stock: number): NivelStock {
  if (stock <= 0) return 'agotado';
  if (stock <= UMBRAL_STOCK_BAJO) return 'bajo';
  return 'ok';
}

const ETIQUETAS: Record<NivelStock, string> = {
  ok: 'En stock',
  bajo: 'Stock bajo',
  agotado: 'Agotado'
};

@Component({
  selector: 'app-estado-stock',
  template: `
    <span class="led" [class]="nivel()" aria-hidden="true"></span>
    <span class="unidades cifra">{{ stock() }}</span>
    @if (mostrarEtiqueta()) {
      <span class="etiqueta">{{ etiqueta() }}</span>
    }
  `,
  host: {
    '[attr.title]': 'etiqueta()',
    '[attr.aria-label]': 'stock() + " unidades, " + etiqueta()'
  },
  styles: `
    :host { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
    .led {
      width: 9px; height: 9px; border-radius: 50%;
      background: var(--led-color);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--led-color) 18%, transparent),
                  0 0 8px color-mix(in srgb, var(--led-color) 60%, transparent);
    }
    .ok { --led-color: var(--led-ok); }
    .bajo { --led-color: var(--led-bajo); }
    .agotado { --led-color: var(--led-agotado); box-shadow: none; }
    .unidades { font-weight: 500; min-width: 2ch; text-align: right; }
    .etiqueta { color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-body-small); }
  `
})
export class EstadoStockComponent {
  readonly stock = input.required<number>();
  readonly mostrarEtiqueta = input(false);

  readonly nivel = computed(() => nivelStock(this.stock()));
  readonly etiqueta = computed(() => ETIQUETAS[this.nivel()]);
}
