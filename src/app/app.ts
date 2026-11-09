// src/app/app.ts  ·  Estructura general: menú lateral + contenido
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TemaService } from './services/tema.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly tema = inject(TemaService);

  // true en pantallas estrechas: el menú pasa a ser desplegable
  readonly movil = toSignal(
    inject(BreakpointObserver).observe('(max-width: 959px)').pipe(map(estado => estado.matches)),
    { initialValue: false }
  );

  readonly modoMenu = computed(() => (this.movil() ? 'over' : 'side'));

  readonly enlaces = [
    { ruta: '/productos', icono: 'inventory_2', texto: 'Inventario' },
    { ruta: '/add', icono: 'add_box', texto: 'Nuevo producto' },
    { ruta: '/pruebas-api', icono: 'cable', texto: 'Pruebas de la API' }
  ];
}
