<?php
/**
 * ==============================================
 * API v1 — ANA ROUTER
 * ==============================================
 * Tüm /api/v1/* isteklerini ilgili endpoint
 * dosyasına yönlendirir.
 *
 * URL yapısı (.htaccess ile yönlendirilir):
 *   GET  /api/v1/menu/{username}              → menu.php
 *   GET  /api/v1/menu/{username}/categories   → menu.php
 *   GET  /api/v1/menu/{username}/products     → menu.php
 *   GET  /api/v1/menu/{username}/products/{id}→ menu.php
 *   GET  /api/v1/categories                   → categories.php
 *   POST /api/v1/categories                   → categories.php
 *   GET  /api/v1/categories/{id}              → categories.php
 *   PUT  /api/v1/categories/{id}              → categories.php
 *   DELETE /api/v1/categories/{id}            → categories.php
 *   GET  /api/v1/products                     → products.php
 *   POST /api/v1/products                     → products.php
 *   GET  /api/v1/products/{id}                → products.php
 *   PUT  /api/v1/products/{id}                → products.php
 *   DELETE /api/v1/products/{id}              → products.php
 *
 * @version 1.0
 * @since   FAZA 13
 * ==============================================
 */

define('API_V1_ENTRY', true);

header('Content-Type: application/json; charset=UTF-8');

// İstek URI'sini parse et — XAMPP (/LokmaQR/api/v1/) ve hosting (/api/v1/) için dinamik
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path       = parse_url($requestUri, PHP_URL_PATH);

// SCRIPT_NAME'den /api/v1 öncesini bul (örn: /LokmaQR/api/v1/index.php → /LokmaQR)
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '/api/v1/index.php';
$apiBase    = preg_replace('#/api/v1/.*$#', '', $scriptName); // /LokmaQR veya ''

// Base prefix'ini kaldır, sonra /api/v1 prefix'ini kaldır
if ($apiBase !== '' && strpos($path, $apiBase) === 0) {
    $path = substr($path, strlen($apiBase));
}
$path = preg_replace('#^/api/v1#', '', $path);
$path = '/' . trim($path, '/');

// HTTP metodu
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// PUT/DELETE için request body parse
if (in_array($method, ['PUT', 'PATCH', 'DELETE'])) {
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
        $parsed = json_decode($raw, true);
        if (is_array($parsed)) {
            $_POST = array_merge($_POST, $parsed);
        }
    }
}

// --------------------------------------------------
// ROUTING
// --------------------------------------------------

// 1) GET /api/v1/ — API bilgisi (auth gerektirmez)
if ($path === '/' && $method === 'GET') {
    echo json_encode([
        'success' => true,
        'name'    => 'QR Menü RESTful API',
        'version' => 'v1',
        'docs'    => '/api/v1/docs',
        'endpoints' => [
            'GET /api/v1/menu/{username}'                  => 'Şube + tüm kategoriler + ürünler',
            'GET /api/v1/menu/{username}/categories'       => 'Şubeye ait kategori listesi',
            'GET /api/v1/menu/{username}/products'         => 'Şubeye ait ürün listesi',
            'GET /api/v1/menu/{username}/products/{id}'    => 'Tek ürün detayı',
            'GET /api/v1/categories'                       => 'Kategori listesi (auth gerekli)',
            'POST /api/v1/categories'                      => 'Yeni kategori ekle (auth gerekli)',
            'GET /api/v1/categories/{id}'                  => 'Kategori detayı (auth gerekli)',
            'PUT /api/v1/categories/{id}'                  => 'Kategori güncelle (auth gerekli)',
            'DELETE /api/v1/categories/{id}'               => 'Kategori sil (auth gerekli)',
            'GET /api/v1/products'                         => 'Ürün listesi (auth gerekli)',
            'POST /api/v1/products'                        => 'Yeni ürün ekle (auth gerekli)',
            'GET /api/v1/products/{id}'                    => 'Ürün detayı (auth gerekli)',
            'PUT /api/v1/products/{id}'                    => 'Ürün güncelle (auth gerekli)',
            'DELETE /api/v1/products/{id}'                 => 'Ürün sil (auth gerekli)',
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// 2) /menu/{username}* — Public endpoint (auth gerekli)
if (preg_match('#^/menu(/.*)?$#', $path)) {
    require_once __DIR__ . '/menu.php';
    exit;
}

// 3) /products/{id}/image veya /categories/{id}/image|banner — upload endpoint
if (preg_match('#^/(products|categories)/\d+/(image|banner)$#', $path)) {
    require_once __DIR__ . '/upload.php';
    exit;
}

// 4) /categories veya /categories/{id}
if (preg_match('#^/categories(/\d+)?$#', $path)) {
    require_once __DIR__ . '/categories.php';
    exit;
}

// 5) /products veya /products/{id}
if (preg_match('#^/products(/\d+)?$#', $path)) {
    require_once __DIR__ . '/products.php';
    exit;
}

// 5) Eşleşmeyen rota → 404
http_response_code(404);
echo json_encode([
    'success' => false,
    'error'   => 'Endpoint bulunamadı: ' . $method . ' ' . $path,
    'code'    => 404
], JSON_UNESCAPED_UNICODE);
exit;