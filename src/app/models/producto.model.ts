// src/app/models/producto.model.ts
// Forma de un producto tal como lo devuelve el backend PHP (hydrate()).
export interface Producto {
  id?: number;        // opcional: no existe hasta que MySQL lo asigna
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  createdAt?: string; // lo rellena MySQL: "2026-11-05 07:21:13"
}
