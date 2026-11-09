<?php
// =============================================================================
//  INDEX.PHP  ·  Front controller / router REST  (CRUD Electrónica)
//  - CORS lo primero (para que el preflight OPTIONS responda siempre).
//  - Parseo de ruta compatible con PHP 7/8 y tolerante a que NO haya
//    mod_rewrite (admite /productos, index.php/productos y ?path=productos).
// =============================================================================

declare(strict_types=1);

// ---------- CORS (antes de cargar nada más) ----------
$__allowed = [
    'http://localhost:4200', 'http://127.0.0.1:4200',
    'http://txemaserrano.com', 'https://txemaserrano.com',
];
$__origin  = $_SERVER['HTTP_ORIGIN'] ?? '';
header('Access-Control-Allow-Origin: ' . (in_array($__origin, $__allowed, true) ? $__origin : '*'));
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Vary: Origin');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$config = require __DIR__ . '/config.php';
require __DIR__ . '/helpers.php';
require __DIR__ . '/db.php';
require __DIR__ . '/productos.php';

DB::init($config);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ---------- Resolver la ruta ----------
$uri    = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';
$script = $_SERVER['SCRIPT_NAME'] ?? '';        // p.ej. /.../backend-php/index.php
$base   = rtrim(dirname($script), '/');         // p.ej. /.../backend-php
$path   = $uri;
if ($base !== '' && strpos($path, $base) === 0) {
    $path = substr($path, strlen($base));
}
$path = ltrim($path, '/');
if (strpos($path, 'index.php') === 0) {         // sin mod_rewrite: index.php/...
    $path = ltrim(substr($path, strlen('index.php')), '/');
}
if (isset($_GET['path'])) {                     // alternativa explícita: ?path=...
    $path = trim((string) $_GET['path'], '/');
}
$path     = trim($path, '/');
$segments = $path === '' ? [] : explode('/', $path);

// Acepta un prefijo opcional "api/" (compatibilidad con /api/productos).
if (($segments[0] ?? '') === 'api') {
    array_shift($segments);
}

try {
    $recurso = $segments[0] ?? '';

    if ($recurso !== 'productos') {
        Response::error(404, 'Ruta no encontrada');
    }

    $id = isset($segments[1]) ? (int) $segments[1] : null;

    switch ($method) {
        case 'GET':
            if ($id) {
                $doc = ProductoRepo::get($id);
                $doc ? Response::json($doc) : Response::error(404, 'Producto no encontrado');
            }
            $nombre = isset($_GET['nombre']) ? (string) $_GET['nombre'] : null;
            Response::json(ProductoRepo::all($nombre));

        case 'POST':
            Response::json(ProductoRepo::create(body_json()), 201);

        case 'PUT':
        case 'PATCH':
            if (!$id) Response::error(400, 'Falta el id');
            $upd = ProductoRepo::update($id, body_json());
            $upd ? Response::json($upd) : Response::error(404, 'Producto no encontrado');

        case 'DELETE':
            if (!$id) {                                  // DELETE /productos → borra todos
                ProductoRepo::deleteAll();
                Response::json(['message' => 'Todos los productos fueron eliminados correctamente!']);
            }
            ProductoRepo::delete($id);
            Response::json(['message' => 'Producto eliminado correctamente!']);

        default:
            Response::error(405, 'Método no permitido');
    }
} catch (PDOException $e) {
    Response::error(500, 'Error de base de datos: ' . $e->getMessage());
} catch (Throwable $e) {
    Response::error(500, 'Error: ' . $e->getMessage());
}