// src/app/components/api-test/api-test.component.ts  ·  Banco de pruebas (temporal)
import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';

@Component({
  selector: 'app-api-test',
  imports: [JsonPipe, MatButtonModule, MatIconModule],
  templateUrl: './api-test.component.html',
  styleUrl: './api-tes.component.css'
})
export class ApiTestComponent {
  private readonly productoService = inject(ProductoService);

  // Lo que se muestra en pantalla: signals, para que se repinte sin zone.js
  readonly titulo = signal('Pulsa un botón');
  readonly resultado = signal<unknown>(null);
  readonly error = signal<string | null>(null);

  // Id del último producto creado con «Crear» (para Actualizar y Borrar)
  readonly ultimoId = signal<number | null>(null);

  // Producto de prueba que se envía al crear
  private readonly prueba: Producto = {
    nombre: 'Producto de prueba',
    descripcion: 'Creado desde el banco de pruebas',
    precio: 10.5,
    stock: 3
  };

  /** Ejecuta una llamada del servicio y muestra su resultado y su duración */
  private ejecutar(titulo: string, peticion: Observable<unknown>): void {
    this.titulo.set(`${titulo}…`);
    this.resultado.set(null);
    this.error.set(null);
    const inicio = performance.now();

    peticion.subscribe({
      next: datos => {
        const ms = Math.round(performance.now() - inicio);
        this.titulo.set(`${titulo} · OK en ${ms} ms`);
        this.resultado.set(datos);
        console.log(`[api-test] ${titulo}`, datos);
      },
      error: (e: HttpErrorResponse) => {
        this.titulo.set(`${titulo} · ERROR ${e.status}`);
        this.error.set(e.message);
        this.resultado.set(e.error);
        console.error(`[api-test] ${titulo}`, e);
      }
    });
  }

  listar(): void {
    this.ejecutar('GET /productos', this.productoService.getAll());
  }

  obtener(id: number): void {
    this.ejecutar(`GET /productos/${id}`, this.productoService.get(id));
  }

  buscar(texto: string): void {
    this.ejecutar(`GET /productos?nombre=${texto}`, this.productoService.findByNombre(texto));
  }

  crear(): void {
    this.ejecutar(
      'POST /productos',
      this.productoService.create(this.prueba).pipe(
        tap(creado => this.ultimoId.set(creado.id ?? null)) // guarda el id nuevo
      )
    );
  }

  actualizar(): void {
    const id = this.ultimoId();
    if (id === null) return;
    this.ejecutar(
      `PUT /productos/${id}`,
      this.productoService.update(id, { ...this.prueba, precio: 12.75, stock: 7 })
    );
  }

  borrar(): void {
    const id = this.ultimoId();
    if (id === null) return;
    this.ejecutar(
      `DELETE /productos/${id}`,
      this.productoService.delete(id).pipe(tap(() => this.ultimoId.set(null)))
    );
  }
}
