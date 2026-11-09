// src/app/components/producto-detalle/producto-detalle.component.ts
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';
import { NotificacionService } from '../../services/notificacion.service';
import { ConfirmarDialogoComponent, DatosConfirmacion } from '../confirmar-dialogo/confirmar-dialogo.component';
import { EstadoStockComponent } from '../estado-stock/estado-stock.component';

/**
 * Muestra y modifica los detalles de un producto en una página propia (no en diálogo).
 */
@Component({
  selector: 'app-producto-detalle',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    EstadoStockComponent
  ],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css'
})
export class ProductoDetalleComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly avisos = inject(NotificacionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);

  // Producto tal como está guardado (null mientras carga) y mensaje de error
  readonly currentProducto = signal<Producto | null>(null);
  readonly message = signal('');
  readonly guardando = signal(false);

  readonly productoForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', [Validators.required]],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  // Valores del formulario como signal: el panel lateral se actualiza al teclear
  private readonly valores = toSignal(this.productoForm.valueChanges, {
    initialValue: this.productoForm.getRawValue()
  });
  readonly stockActual = computed(() => Number(this.valores().stock ?? 0));
  readonly valorStock = computed(() => Number(this.valores().precio ?? 0) * this.stockActual());

  /** Lee el :id de la URL y carga el producto */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // /productos/abc daría NaN: el PHP lo convertiría en 0 y devolvería la lista entera
    if (!Number.isInteger(id) || id <= 0) {
      this.message.set('El identificador de la dirección no es válido.');
      return;
    }
    this.obtenerProducto(id);
  }

  obtenerProducto(id: number): void {
    this.productoService.get(id).subscribe({
      next: data => {
        this.currentProducto.set(data);
        this.productoForm.reset({
          nombre: data.nombre,
          descripcion: data.descripcion,
          precio: Number(data.precio),
          stock: Number(data.stock)
        });
      },
      error: e => {
        console.error('[detalle] error', e.status);
        this.message.set(
          e.status === 404
            ? `No existe ningún producto con el ID ${id}. Puede que se haya eliminado.`
            : 'No se pudo cargar el producto. Comprueba la conexión con el servidor.'
        );
      }
    });
  }

  actualizarProducto(): void {
    const producto = this.currentProducto();
    if (!producto?.id || this.productoForm.invalid) return;

    this.guardando.set(true);
    const cambios: Producto = { ...producto, ...this.productoForm.getRawValue() };

    this.productoService.update(producto.id, cambios).subscribe({
      next: () => {
        this.guardando.set(false);
        this.currentProducto.set(cambios);
        this.productoForm.markAsPristine(); // el botón vuelve a deshabilitarse
        this.avisos.ok('Cambios guardados');
      },
      error: e => {
        this.guardando.set(false);
        this.avisos.error('No se pudieron guardar los cambios', e);
      }
    });
  }

  descartarCambios(): void {
    const p = this.currentProducto();
    if (!p) return;
    this.productoForm.reset({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: Number(p.precio),
      stock: Number(p.stock)
    });
  }

  eliminarProducto(): void {
    const producto = this.currentProducto();
    if (!producto?.id) return;

    const datos: DatosConfirmacion = {
      titulo: 'Eliminar producto',
      mensaje: `«${producto.nombre}» se borrará del inventario. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Eliminar'
    };

    this.dialog
      .open(ConfirmarDialogoComponent, { data: datos, width: '440px', maxWidth: '94vw', panelClass: 'dialogo-app' })
      .afterClosed()
      .subscribe(confirmado => {
        if (!confirmado) return;
        this.productoService.delete(producto.id!).subscribe({
          next: () => {
            this.avisos.ok('Producto eliminado');
            this.router.navigate(['/productos']);
          },
          error: e => this.avisos.error('No se pudo eliminar el producto', e)
        });
      });
  }

  /** createdAt llega de MySQL como "2026-11-05 07:21:13": se pasa a ISO para el pipe date */
  fechaAlta(valor?: string): string | null {
    return valor ? valor.replace(' ', 'T') : null;
  }
}
