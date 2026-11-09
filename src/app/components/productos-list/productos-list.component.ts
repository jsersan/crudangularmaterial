// src/app/components/productos-list/productos-list.component.ts  ·  Inventario
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // para [(ngModel)] del buscador
import { Router, RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';
import { NotificacionService } from '../../services/notificacion.service';
import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { ConfirmarDialogoComponent, DatosConfirmacion } from '../confirmar-dialogo/confirmar-dialogo.component';
import { EstadoStockComponent, nivelStock } from '../estado-stock/estado-stock.component';

@Component({
  selector: 'app-productos-list',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    FormsModule,
    RouterLink,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    EstadoStockComponent
  ],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-lis.component.css'
})
export class ProductosListComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly avisos = inject(NotificacionService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  // En pantallas estrechas se ocultan columnas secundarias
  private readonly estrecho = toSignal(
    inject(BreakpointObserver).observe('(max-width: 719px)').pipe(map(e => e.matches)),
    { initialValue: false }
  );

  // Columnas que se mostrarán en la tabla, en este orden
  readonly displayedColumns = computed(() =>
    this.estrecho()
      ? ['nombre', 'stock', 'acciones']
      : ['id', 'nombre', 'precio', 'stock', 'acciones']
  );

  // Estado de la pantalla
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal(false);

  // Término de búsqueda (lo actualiza el propio input con [(ngModel)])
  nombreBusqueda = '';
  // Término con el que se hizo la última búsqueda (para el aviso «Resultados de…»)
  readonly busquedaActiva = signal('');

  // Ordenación (MatSort) y paginación
  readonly orden = signal<Sort>({ active: '', direction: '' });
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  // Resumen del inventario visible
  readonly resumen = computed(() => {
    const lista = this.productos();
    return {
      referencias: lista.length,
      unidades: lista.reduce((total, p) => total + Number(p.stock), 0),
      valor: lista.reduce((total, p) => total + Number(p.precio) * Number(p.stock), 0),
      aReponer: lista.filter(p => nivelStock(Number(p.stock)) !== 'ok').length
    };
  });

  // Lista ordenada según la columna elegida
  private readonly ordenados = computed(() => {
    const { active, direction } = this.orden();
    const lista = [...this.productos()];
    if (!active || !direction) return lista;

    const signo = direction === 'asc' ? 1 : -1;
    return lista.sort((a, b) => {
      const va = a[active as keyof Producto];
      const vb = b[active as keyof Producto];
      if (typeof va === 'string' && typeof vb === 'string') {
        return va.localeCompare(vb, 'es', { sensitivity: 'base' }) * signo;
      }
      return (Number(va) - Number(vb)) * signo;
    });
  });

  // Página visible = trozo del array ordenado
  readonly paginaActual = computed(() => {
    const inicio = this.pageIndex() * this.pageSize();
    return this.ordenados().slice(inicio, inicio + this.pageSize());
  });

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos(): void {
    this.cargando.set(true);
    this.errorCarga.set(false);
    this.productoService.getAll().subscribe({
      next: data => this.cargar(data),
      error: e => this.falloCarga('No se pudo cargar el inventario', e)
    });
  }

  /** Busca por nombre; si el campo está vacío, recarga todo */
  buscarPorNombre(): void {
    const texto = this.nombreBusqueda.trim();
    this.pageIndex.set(0); // volver a la página 1 tras filtrar
    this.busquedaActiva.set(texto);

    if (!texto) {
      this.obtenerProductos();
      return;
    }
    this.cargando.set(true);
    this.errorCarga.set(false);
    this.productoService.findByNombre(texto).subscribe({
      next: data => this.cargar(data),
      error: e => this.falloCarga('No se pudo completar la búsqueda', e)
    });
  }

  limpiarBusqueda(): void {
    this.nombreBusqueda = '';
    this.buscarPorNombre();
  }

  /** Abre el formulario en un diálogo (crear si no hay producto, editar si lo hay) */
  abrirFormulario(producto?: Producto): void {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '560px',
      maxWidth: '94vw',
      panelClass: 'dialogo-app',
      autoFocus: 'first-tabbable',
      data: producto ? { ...producto } : {} // copia: no tocar la fila hasta guardar
    });

    // afterClosed() emite el valor con el que se cerró el diálogo (undefined si se canceló)
    dialogRef.afterClosed().subscribe(guardado => {
      if (guardado) this.recargar();
    });
  }

  verDetalle(producto: Producto): void {
    this.router.navigate(['/productos', producto.id]);
  }

  /** Elimina un producto tras confirmarlo en un diálogo */
  eliminarProducto(producto: Producto): void {
    const datos: DatosConfirmacion = {
      titulo: 'Eliminar producto',
      mensaje: `«${producto.nombre}» se borrará del inventario. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar'
    };

    this.dialog
      .open(ConfirmarDialogoComponent, { data: datos, width: '440px', maxWidth: '94vw', panelClass: 'dialogo-app' })
      .afterClosed()
      .subscribe(confirmado => {
        if (!confirmado || producto.id == null) return;
        this.productoService.delete(producto.id).subscribe({
          next: () => {
            this.avisos.ok('Producto eliminado');
            this.recargar();
          },
          error: e => this.avisos.error('No se pudo eliminar el producto', e)
        });
      });
  }

  cambiarOrden(orden: Sort): void {
    this.orden.set(orden);
    this.pageIndex.set(0);
  }

  /** Evento (page) del paginador: guarda página y tamaño */
  cambiarPagina(evento: PageEvent): void {
    this.pageIndex.set(evento.pageIndex);
    this.pageSize.set(evento.pageSize);
  }

  /** Repite la consulta actual (respeta la búsqueda si la hay) */
  private recargar(): void {
    if (this.busquedaActiva()) {
      this.productoService.findByNombre(this.busquedaActiva()).subscribe({
        next: data => this.cargar(data),
        error: e => this.falloCarga('No se pudo actualizar la lista', e)
      });
    } else {
      this.obtenerProductos();
    }
  }

  /** Guarda los datos y corrige la página si se ha quedado vacía (p. ej. tras borrar) */
  private cargar(data: Producto[]): void {
    this.productos.set(data);
    this.cargando.set(false);
    const ultimaPagina = Math.max(0, Math.ceil(data.length / this.pageSize()) - 1);
    if (this.pageIndex() > ultimaPagina) {
      this.pageIndex.set(ultimaPagina);
    }
  }

  private falloCarga(mensaje: string, e: unknown): void {
    console.error('[lista]', mensaje, e);
    this.cargando.set(false);
    this.errorCarga.set(true);
    this.avisos.error(mensaje, e);
  }
}
