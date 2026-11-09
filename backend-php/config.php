<?php
// backend-php/config.php · Valores por defecto para desarrollo (MAMP). SIN secretos.
$config = [
    'db' => [
        'host'    => '127.0.0.1',   // 127.0.0.1 fuerza TCP; 'localhost' usaría el socket
        'port'    => '3307',        // MySQL de XAMPP
        'name'    => 'crud_electronica_mysql',
        'user'    => 'root',
        'pass'    => '',
        'port' => '3307',
        'charset' => 'utf8mb4',
    ],
    'cors_origins' => ['http://localhost:4200'],
];

// Si existe config.local.php (servidor de producción), sobrescribe estos valores
$local = __DIR__ . '/config.local.php';
if (is_file($local)) {
    $override = require $local;
    if (is_array($override)) {
        $config = array_replace_recursive($config, $override);
    }
}

return $config;