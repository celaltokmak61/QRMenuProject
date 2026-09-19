<?php
/**
 * QR MENÜ SİSTEMİ - ÖRNEK KONFİGÜRASYON DOSYASI
 * 
 * Bu dosyayı kopyalayın ve config.php olarak kaydedin:
 *   cp config.example.php config.php
 * 
 * Ardından tüm YOUR_* değerlerini gerçek bilgilerinizle doldurun.
 * 
 * @see README.md for full setup instructions
 */

// ==============================================
// HATA RAPORLAMA AYARLARI
// ==============================================
define('ENVIRONMENT', 'development'); // 'development' veya 'production'

if (ENVIRONMENT === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/logs/php-errors.log');
}

// ==============================================
// SİTE GENEL BİLGİLERİ
// ==============================================
define('SITE_NAME', 'QR Menü Sistemi');
define('SITE_SLOGAN', 'Dijital Menü Çözümünüz');
define('SITE_DESCRIPTION', 'Restoran ve kafeler için profesyonel QR menü yönetim sistemi');

$_detected_host     = $_SERVER['HTTP_HOST'] ?? 'localhost';
$_detected_scheme   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$_detected_base     = $_detected_scheme . '://' . $_detected_host;
$_detected_basepath = (strpos($_detected_host, 'localhost') !== false || filter_var($_detected_host, FILTER_VALIDATE_IP)) ? '/LokmaQR' : '';
define('SITE_URL', $_detected_base . $_detected_basepath);
define('DOMAIN', $_detected_host);
define('ADMIN_URL', SITE_URL . '/admin');
define('CLIENT_URL', SITE_URL . '/client');
define('MENU_URL', SITE_URL . '/menu');
define('API_URL', SITE_URL . '/api');

define('ADMIN_PATH', __DIR__ . '/admin');
define('CLIENT_PATH', __DIR__ . '/client');
define('MENU_PATH', __DIR__ . '/menu');

define('SITE_LOGO', '/assets/images/logo.png');
define('SITE_FAVICON', '/assets/images/favicon.ico');
define('DEFAULT_AVATAR', '/assets/images/default-avatar.png');

// ==============================================
// VERİTABANI AYARLARI  ← BURAYA GERÇEK BİLGİLERİNİZİ GİRİN
// ==============================================
define('DB_HOST', 'YOUR_DB_HOST');        // örn: localhost
define('DB_USER', 'YOUR_DB_USER');        // örn: root
define('DB_PASS', 'YOUR_DB_PASSWORD');    // örn: secret123
define('DB_NAME', 'qrmenu_main');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATION', 'utf8mb4_unicode_ci');

define('USER_DB_PREFIX', 'user_');

// ==============================================
// PARA BİRİMİ VE FİYATLANDIRMA
// ==============================================
define('CURRENCY', 'TRY');
define('CURRENCY_SYMBOL', '₺');
define('CURRENCY_POSITION', 'after');

define('DEFAULT_SINGLE_BRANCH_PRICE', 1500);
define('DEFAULT_PER_BRANCH_PRICE', 500);

// ==============================================
// ZAMAN VE TARİH AYARLARI
// ==============================================
date_default_timezone_set('Europe/Istanbul');

define('DATE_FORMAT', 'd.m.Y');
define('DATETIME_FORMAT', 'd.m.Y H:i');
define('TIME_FORMAT', 'H:i');

define('TRIAL_DAYS', 14);
define('SUBSCRIPTION_DAYS', 365);

// ==============================================
// DİL AYARLARI
// ==============================================
define('DEFAULT_LANGUAGE', 'tr');

define('SUPPORTED_LANGUAGES', json_encode([
    'tr' => 'Türkçe',
    'en' => 'English',
    'de' => 'Deutsch',
    'fr' => 'Français',
    'es' => 'Español',
    'it' => 'Italiano',
    'ru' => 'Русский',
    'ar' => 'العربية'
]));

// ==============================================
// MICROSOFT AZURE TRANSLATOR API  ← API ANAHTARINIZI GİRİN
// ==============================================
// Portal: https://portal.azure.com → Cognitive Services → Translator
define('AZURE_TRANSLATOR_KEY', 'YOUR_AZURE_TRANSLATOR_KEY');
define('AZURE_TRANSLATOR_REGION', 'YOUR_AZURE_REGION');  // örn: 'westeurope'
define('AZURE_TRANSLATOR_ENDPOINT', 'https://api.cognitive.microsofttranslator.com/');

// ==============================================
// E-POSTA AYARLARI  ← SMTP BİLGİLERİNİZİ GİRİN
// ==============================================
define('ADMIN_EMAIL', 'admin@yourdomain.com');
define('ADMIN_NAME', 'QR Menü Admin');

define('SMTP_HOST', 'YOUR_SMTP_HOST');        // örn: smtp-mail.outlook.com
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'YOUR_SMTP_EMAIL');
define('SMTP_PASSWORD', 'YOUR_SMTP_PASSWORD');
define('SMTP_ENCRYPTION', 'tls');
define('SMTP_CIPHER_KEY', 'YOUR_RANDOM_32_CHAR_KEY');

define('MAIL_FROM_EMAIL', 'noreply@yourdomain.com');
define('MAIL_FROM', 'noreply@yourdomain.com');
define('MAIL_FROM_NAME', 'QR Menü Sistemi');

// ==============================================
// DOSYA YÜKLEME AYARLARI
// ==============================================
define('MAX_FILE_SIZE', 10 * 1024 * 1024);

define('ALLOWED_IMAGE_FORMATS', json_encode([
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic',
    'svg', 'bmp', 'tiff', 'ico', 'avif'
]));

define('UPLOAD_DIR', __DIR__ . '/uploads');
define('USER_UPLOAD_DIR', UPLOAD_DIR . '/users');
define('PAYMENT_UPLOAD_DIR', UPLOAD_DIR . '/payments');

define('IMAGE_THUMB_WIDTH', 200);
define('IMAGE_THUMB_HEIGHT', 200);
define('IMAGE_DISPLAY_WIDTH', 800);
define('IMAGE_DISPLAY_HEIGHT', 800);

// ==============================================
// GÜVENLİK AYARLARI
// ==============================================
define('SESSION_NAME', 'QRMENU_SESSION');
define('SESSION_LIFETIME', 7200);
define('SESSION_SECRET', 'YOUR_RANDOM_SESSION_SECRET_KEY');

define('MIN_PASSWORD_LENGTH', 6);
define('REQUIRE_STRONG_PASSWORD', false);

define('CSRF_TOKEN_EXPIRE', 3600);
define('API_RATE_LIMIT', 150);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_BLOCK_TIME', 900);

// ==============================================
// TEMA VE TASARIM
// ==============================================
define('BOOTSTRAP_VERSION', '5.3.0');
define('FONTAWESOME_VERSION', '6.4.0');

define('PRIMARY_COLOR', '#007bff');
define('SECONDARY_COLOR', '#6c757d');
define('SUCCESS_COLOR', '#28a745');
define('DANGER_COLOR', '#dc3545');
define('WARNING_COLOR', '#ffc107');
define('INFO_COLOR', '#17a2b8');
define('LIGHT_COLOR', '#f8f9fa');
define('DARK_COLOR', '#343a40');

// ==============================================
// QR KOD AYARLARI
// ==============================================
define('QR_CODE_SIZE', 300);
define('QR_ERROR_CORRECTION', 'M');
define('QR_LOGO_ENABLED', true);
define('QR_FOREGROUND_COLOR', '#000000');
define('QR_BACKGROUND_COLOR', '#FFFFFF');

// ==============================================
// YEDEKLEME AYARLARI
// ==============================================
define('BACKUP_DIR', __DIR__ . '/backups');
define('BACKUP_FILE_FORMAT', 'Y-m-d_His');
define('BACKUP_RETENTION_DAYS', 30);

// ==============================================
// SAYFALAMA AYARLARI
// ==============================================
define('ITEMS_PER_PAGE', 20);
define('ADMIN_TABLE_LIMIT', 25);

// ==============================================
// ÖDEME AYARLARI  ← BANKA VE ÖDEME AYARLARINIZI GİRİN
// ==============================================
define('BANK_NAME', 'YOUR_BANK_NAME');
define('BANK_ACCOUNT_NAME', 'YOUR_ACCOUNT_NAME');
define('BANK_IBAN', 'YOUR_IBAN');
define('BANK_ACCOUNT_NUMBER', 'YOUR_ACCOUNT_NUMBER');

define('IYZICO_API_KEY', 'YOUR_IYZICO_API_KEY');
define('IYZICO_SECRET_KEY', 'YOUR_IYZICO_SECRET_KEY');
define('IYZICO_BASE_URL', 'https://sandbox-api.iyzipay.com');

// ==============================================
// CACHE AYARLARI
// ==============================================
define('CACHE_ENABLED', true);
define('CACHE_LIFETIME', 3600);
define('CACHE_DIR', __DIR__ . '/cache');

// ==============================================
// LOG AYARLARI
// ==============================================
define('LOG_DIR', __DIR__ . '/logs');
define('LOG_LEVEL', 'DEBUG');

// ==============================================
// SOSYAL MEDYA
// ==============================================
define('COMPANY_FACEBOOK', 'https://facebook.com/qrmenu');
define('COMPANY_INSTAGRAM', 'https://instagram.com/qrmenu');
define('COMPANY_TWITTER', 'https://twitter.com/qrmenu');
define('COMPANY_LINKEDIN', 'https://linkedin.com/company/qrmenu');

// ==============================================
// DESTEK VE İLETİŞİM
// ==============================================
define('SUPPORT_EMAIL', 'destek@yourdomain.com');
define('SUPPORT_PHONE', '+90 5XX XXX XX XX');
define('SUPPORT_WHATSAPP', '+905XXXXXXXXX');

define('COMPANY_NAME', 'YOUR_COMPANY_NAME');
define('COMPANY_ADDRESS', 'YOUR_COMPANY_ADDRESS');
define('COMPANY_TAX_OFFICE', 'YOUR_TAX_OFFICE');
define('COMPANY_TAX_NUMBER', 'YOUR_TAX_NUMBER');

// ==============================================
// VERSYON BİLGİSİ
// ==============================================
define('APP_VERSION', '1.0.0');
define('APP_BUILD', '20260328');
define('APP_RELEASE_DATE', '2026-03-28');

// ==============================================
// DİĞER AYARLAR
// ==============================================
define('MAINTENANCE_MODE', false);
define('REGISTRATION_ENABLED', true);
define('DEMO_MODE', false);
define('DEBUG_MODE', ENVIRONMENT === 'development');

// ==============================================
// AUTOLOADER
// ==============================================
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . '/core/' . $class . '.php',
        __DIR__ . '/admin/includes/' . $class . '.php',
        __DIR__ . '/client/includes/' . $class . '.php',
    ];
    
    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            return;
        }
    }
});

// ==============================================
// YARDIMCI FONKSİYONLAR
// ==============================================

function url($path = '') {
    return SITE_URL . '/' . ltrim($path, '/');
}

function asset($path = '') {
    return SITE_URL . '/assets/' . ltrim($path, '/');
}

function formatCurrency($amount, $currency = CURRENCY) {
    $formatted = number_format($amount, 2, ',', '.');
    if (CURRENCY_POSITION === 'before') {
        return CURRENCY_SYMBOL . $formatted;
    } else {
        return $formatted . ' ' . CURRENCY_SYMBOL;
    }
}

function formatDate($date, $format = DATE_FORMAT) {
    return date($format, strtotime($date));
}

function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

function dd($data, $exit = true) {
    echo '<pre>';
    print_r($data);
    echo '</pre>';
    if ($exit) exit;
}
?>
