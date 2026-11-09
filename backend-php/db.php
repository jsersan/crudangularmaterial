<?php
// =============================================================================
//  DB.PHP  ·  Conexión PDO a MySQL (compatible con PHP 7.0+; sin tipos 7.4)
// =============================================================================

class DB
{
    private static $pdo = null;
    private static $cfg = array();

    public static function init($config)
    {
        self::$cfg = $config;
    }

    public static function pdo()
    {
        if (self::$pdo === null) {
            $c   = self::$cfg['db'];
            $dsn = "mysql:host={$c['host']};port={$c['port']};dbname={$c['name']};charset={$c['charset']}";
            self::$pdo = new PDO($dsn, $c['user'], $c['pass'], array(
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ));
        }
        return self::$pdo;
    }
}