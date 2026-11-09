// src/app/components/confirmar-dialogo/confirmar-dialogo.component.ts
// Sustituye a window.confirm(): devuelve true al confirmar y undefined al cancelar
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
}

@Component({
  selector: 'app-confirmar-dialogo',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="titulo">
      <mat-icon class="icono">delete_outline</mat-icon>
      {{ datos.titulo }}
    </h2>
    <mat-dialog-content>
      <p class="mensaje">{{ datos.mensaje }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close cdkFocusInitial type="button">Cancelar</button>
      <button matButton="filled" class="boton-peligro" [mat-dialog-close]="true" type="button">
        {{ datos.textoConfirmar }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .titulo { display: flex; align-items: center; gap: 12px; }
    .icono {
      flex: none;
      width: 40px; height: 40px; font-size: 22px; line-height: 40px;
      text-align: center; border-radius: 50%;
      color: var(--mat-sys-on-error-container);
      background: var(--mat-sys-error-container);
    }
    .mensaje { margin: 0; max-width: 42ch; }
  `
})
export class ConfirmarDialogoComponent {
  readonly datos = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
}
