<?php
// =============================================================================
//  HELPERS  ·  Respuestas JSON y utilidades de petición
// =============================================================================

class Response
{
    public static function json($data, int $code = 200): void
    {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(int $code, string $message): void
    {
        self::json(['error' => $message], $code);
    }
}

/** Lee y decodifica el cuerpo JSON de la petición. */
function body_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}