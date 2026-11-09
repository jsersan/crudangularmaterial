// src/app/services/producto.service.ts  ·  Versión completa
// Service: decorador de Angular 22 (= @Injectable({ providedIn: 'root' }))
// inject: obtiene dependencias sin usar el constructor
import { inject, Service } from '@angular/core';
// HttpClient para las peticiones; HttpParams para los parámetros de consulta
import { HttpClient, HttpParams } from '@angular/common/http';
// Observable para manejar operaciones asíncronas
import { Observable } from 'rxjs';
// Modelo Producto
import { Producto } from '../models/producto.model';
// URL base según el entorno (desarrollo / producción)
import { environment } from '../../environments/environment';

@Service()
export class ProductoService {
  // HttpClient viene incluido en Angular 22: no hace falta provideHttpClient()
  private readonly http = inject(HttpClient);

  // http://localhost:8888/angular22/crud-angular-mysql/backend-php/productos
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  /** GET /productos → todos los productos */
  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  /** GET /productos/{id} → un producto (404 si no existe) */
  get(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  /** GET /productos?nombre=texto → productos cuyo nombre contiene el texto */
  findByNombre(nombre: string): Observable<Producto[]> {
    // HttpParams codifica el texto: "Mecánico" viaja como Mec%C3%A1nico
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<Producto[]>(this.apiUrl, { params });
  }

  /** POST /productos → crea y devuelve el producto con su id (201) */
  create(data: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, data);
  }

  /** PUT /productos/{id} → actualiza y devuelve el producto (404 si no existe) */
  update(id: number, data: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, data);
  }

  /** DELETE /productos/{id} → { message: '...' } */
  delete(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
