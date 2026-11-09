// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProductosListComponent } from './components/productos-list/productos-list.component';
import { ProductoDetalleComponent } from './components/producto-detalle/producto-detalle.component';
import { ApiTestComponent } from './components/api-test/api-test.component';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';

// title: texto de la pestaña del navegador en cada ruta
export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: 'productos', component: ProductosListComponent, title: 'Inventario | CRUD Electrónica' },
  { path: 'productos/:id', component: ProductoDetalleComponent, title: 'Producto | CRUD Electrónica' },
  { path: 'pruebas-api', component: ApiTestComponent, title: 'Pruebas de la API | CRUD Electrónica' }, // temporal (Paso 6)
  { path: 'add', component: ProductoFormComponent, title: 'Nuevo producto | CRUD Electrónica' },
  { path: '**', redirectTo: 'productos' }
];
