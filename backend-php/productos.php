<?php
// =============================================================================
//  PRODUCTOS  ·  Repositorio relacional de la tabla `productos`
//  Devuelve objetos con el mismo shape que espera el frontend Angular:
//  { id:number, nombre, descripcion, precio:number, stock:number, createdAt }
// =============================================================================

class ProductoRepo
{
    /** Normaliza una fila de BBDD al shape que consume el frontend. */
    private static function hydrate(array $row): array
    {
        return [
            'id'          => (int) $row['id'],
            'nombre'      => (string) $row['nombre'],
            'descripcion' => (string) $row['descripcion'],
            'precio'      => (float) $row['precio'],
            'stock'       => (int) $row['stock'],
            'createdAt'   => $row['createdAt'] ?? null,
        ];
    }

    /** Todos los productos. Si $nombre no es null, filtra por nombre (LIKE). */
    public static function all(?string $nombre = null): array
    {
        if ($nombre !== null && $nombre !== '') {
            $stmt = DB::pdo()->prepare(
                "SELECT id, nombre, descripcion, precio, stock, createdAt
                   FROM productos
                  WHERE nombre LIKE ?
                  ORDER BY id ASC"
            );
            $stmt->execute(['%' . $nombre . '%']);
        } else {
            $stmt = DB::pdo()->query(
                "SELECT id, nombre, descripcion, precio, stock, createdAt
                   FROM productos
                  ORDER BY id ASC"
            );
        }
        return array_map([self::class, 'hydrate'], $stmt->fetchAll());
    }

    public static function get(int $id): ?array
    {
        $stmt = DB::pdo()->prepare(
            "SELECT id, nombre, descripcion, precio, stock, createdAt
               FROM productos WHERE id = ?"
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? self::hydrate($row) : null;
    }

    public static function create(array $data): array
    {
        $stmt = DB::pdo()->prepare(
            "INSERT INTO productos (nombre, descripcion, precio, stock)
             VALUES (:nombre, :descripcion, :precio, :stock)"
        );
        $stmt->execute(self::sanitize($data));
        return self::get((int) DB::pdo()->lastInsertId());
    }

    public static function update(int $id, array $data): ?array
    {
        $params = self::sanitize($data);
        $params['id'] = $id;
        $stmt = DB::pdo()->prepare(
            "UPDATE productos
                SET nombre = :nombre, descripcion = :descripcion,
                    precio = :precio, stock = :stock
              WHERE id = :id"
        );
        $stmt->execute($params);
        return self::get($id);
    }

    public static function delete(int $id): bool
    {
        $stmt = DB::pdo()->prepare("DELETE FROM productos WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    /** Borra todos los productos (equivale a DELETE /api/productos del backend Node). */
    public static function deleteAll(): int
    {
        $stmt = DB::pdo()->query("DELETE FROM productos");
        return $stmt->rowCount();
    }

    /** Normaliza tipos. Permisivo, como el backend original (el formulario
     *  Angular ya valida obligatorios y longitudes en el cliente). */
    private static function sanitize(array $data): array
    {
        return [
            'nombre'      => trim((string) ($data['nombre'] ?? '')),
            'descripcion' => trim((string) ($data['descripcion'] ?? '')),
            'precio'      => (float) ($data['precio'] ?? 0),
            'stock'       => (int) ($data['stock'] ?? 0),
        ];
    }
}