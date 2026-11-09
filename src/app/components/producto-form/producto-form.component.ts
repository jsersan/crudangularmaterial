// src/app/components/producto-form/producto-form.component.ts
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Diálogo de Material: directivas (mat-dialog-title, -content, -actions) y tokens
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Producto } from '../../models/producto.model';
import { ProductoService } from '../../services/producto.service';
import { NotificacionService } from '../../services/notificacion.service';

/**
 * Formulario de creación y edición de productos.
 * Normalmente se abre en un diálogo; también funciona como página en /add.
 */
@Component({
  selector: 'app-producto-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.css'
})
export class ProductoFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productoService = inject(ProductoService);
  private readonly avisos = inject(NotificacionService);
  private readonly router = inject(Router);

  // { optional: true } -> null si el componente no se abrió en un diálogo (ruta /add)
  readonly dialogRef = inject<MatDialogRef<ProductoFormComponent>>(MatDialogRef, { optional: true });
  private readonly data = inject<Partial<Producto> | null>(MAT_DIALOG_DATA, { optional: true });

  // Producto recibido (vacío al crear o en /add)
  private readonly producto: Partial<Producto> = this.data ?? {};

  // ¿Editando (true) o creando (false)? Edición si el producto recibido tiene id
  readonly isEditing = !!this.producto.id;

  // true mientras la petición está en curso (evita dobles envíos)
  readonly guardando = signal(false);

  // Formulario reactivo tipado: valor inicial y validadores de cada campo
  readonly productoForm = this.fb.nonNullable.group({
    nombre: [this.producto.nombre ?? '', [Validators.required, Validators.minLength(3)]],
    descripcion: [this.producto.descripcion ?? '', [Validators.required]],
    precio: [this.producto.precio ?? 0, [Validators.required, Validators.min(0)]],
    stock: [this.producto.stock ?? 0, [Validators.required, Validators.min(0)]]
  });

  /** Crea o actualiza según el modo */
  onSubmit(): void {
    if (this.productoForm.invalid || this.guardando()) {
      this.productoForm.markAllAsTouched();
      return;
    }
    // getRawValue() devuelve { nombre, descripcion, precio, stock } con sus tipos
    const producto: Producto = this.productoForm.getRawValue();
    this.guardando.set(true);

    const peticion = this.isEditing
      ? this.productoService.update(this.producto.id!, producto)
      : this.productoService.create(producto);

    peticion.subscribe({
      next: () => {
        this.avisos.ok(this.isEditing ? 'Cambios guardados' : 'Producto creado');
        this.cerrar(true);
      },
      error: e => {
        this.guardando.set(false);
        this.avisos.error(this.isEditing ? 'No se pudieron guardar los cambios' : 'No se pudo crear el producto', e);
      }
    });
  }

  /** Cancela sin devolver resultado */
  cancelar(): void {
    this.cerrar();
  }

  /** Cierra el diálogo o, si no hay diálogo (ruta /add), vuelve a la lista */
  private cerrar(resultado?: boolean): void {
    if (this.dialogRef) {
      this.dialogRef.close(resultado);
    } else {
      this.router.navigate(['/productos']);
    }
  }
}
