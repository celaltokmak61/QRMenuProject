<?php
/**
 * QR Menü - Ana Sayfa
 * Şube bilgisi ile kategori listesi
 * FAZA 11:   Dil desteği eklendi (DB'den çeviri - Azure API çağrısı YOK)
 * FAZA 11.5: Sabit UI metinleri çeviri sistemi eklendi (menu/config/translations.php)
 *
 * URL formatı: /menu/{branchId}/ veya /menu/{branchId}/lang/{langCode}/
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/Translator.php';

// ── Sabit UI Metinleri (FAZA 11.5) ────────────────────────────
// Tüm dillerin çeviri dizisi yüklenir; dil seçimi daha aşağıda yapılır
$allMenuTranslations = require __DIR__ . '/config/translations.php';

// Branch ID al — clean URL: /menu/2/ veya eski format: ?branch=2&user=1
$branchId = $_GET['branch'] ?? null;
$langCode = trim($_GET['lang'] ?? '');

if (!$branchId) {
    $ui = $allMenuTranslations['tr'];
    die(htmlspecialchars($ui['invalid_qr']));
}

// Database bağlantısı
$db = new Database();

// Tek kullanıcı modeli: ana veritabanından ilk aktif kullanıcıyı al
$db->switchDatabase(DB_NAME);
$userInfo = $db->fetch("SELECT id, subdomain FROM users WHERE deleted_at IS NULL ORDER BY id ASC LIMIT 1");

if (!$userInfo) {
    die('Kullanıcı bulunamadı.');
}
$userId = $userInfo['id'];

// Kullanıcının kendi veritabanına geç
$userDb = 'user_' . $userId;
$db->switchDatabase($userDb);
$pdo = $db->getConnection();

// Şube bilgisini kullanıcı veritabanından al
$branch = $db->fetch("
    SELECT * FROM branches
    WHERE id = :id AND deleted_at IS NULL
", ['id' => $branchId]);

// Aktif kampanyalar (bu şubeye ait)
$campaigns = [];
try {
    $campaigns = $db->fetchAll("
        SELECT * FROM campaigns
        WHERE branch_id = :bid AND is_active = 1
        ORDER BY sort_order ASC, created_at DESC
    ", ['bid' => $branchId]);
} catch (Exception $e) { $campaigns = []; }

if (!$branch) {
    die('Şube bulunamadı.');
}

// Kullanıcı bilgilerini branch dizisine ekle (header/footer componentleri için)
$branch['user_id']   = $userId;
$branch['subdomain'] = $userInfo['subdomain'];

// ── Menü Tasarım Ayarları (FAZA 12.5) ────────────────────────
// Tablo henüz oluşturulmamışsa (migration çalıştırılmamış) hata verme
$menuSettings = null;
try {
    $menuSettings = $db->fetch("SELECT * FROM `menu_settings` WHERE id = 1 LIMIT 1");
} catch (\Throwable $_e) {
    // Sessizce geç — varsayılan CSS değişkenleri kullanılır
}

// ── Dil Desteği ──────────────────────────────────────────────
$translator   = new Translator($pdo);
$activeLangs  = array_filter($translator->getLanguages(), fn($l) => (bool)$l['is_active']);
$activeLangs  = array_values($activeLangs);
$defaultLang  = $translator->getDefaultLanguage();

// Seçili dil: URL'den gelen kod geçerliyse onu kullan, yoksa varsayılan
$selectedLang = null;
$selectedLangCode = null;
if (!empty($langCode)) {
    foreach ($activeLangs as $lang) {
        if ($lang['code'] === $langCode && !$lang['is_default']) {
            $selectedLang     = $lang;
            $selectedLangCode = $lang['code'];
            break;
        }
    }
}
// Seçili dil ID'si: seçili dil varsa onun ID'si, yoksa default dilin ID'si
// (null kalırsa translator raw key döndürür)
$selectedLangId = $selectedLang
    ? (int)$selectedLang['id']
    : ($defaultLang ? (int)$defaultLang['id'] : null);

// UI sabit metinleri: seçili dil varsa onu kullan, yoksa Türkçe fallback
$ui = $allMenuTranslations[$selectedLangCode] ?? $allMenuTranslations['tr'];

// Şubeye ait aktif kategorileri getir — translations LEFT JOIN ile gerçek isim
if ($selectedLangId) {
    $categories = $db->fetchAll("
        SELECT c.*,
               COALESCE(t_name.translation_value, c.name_key)        AS display_name,
               COALESCE(t_desc.translation_value, c.description_key) AS display_description
        FROM categories c
        INNER JOIN category_branches cb ON c.id = cb.category_id
        LEFT JOIN translations t_name ON t_name.translation_key = c.name_key        AND t_name.language_id = {$selectedLangId}
        LEFT JOIN translations t_desc ON t_desc.translation_key = c.description_key AND t_desc.language_id = {$selectedLangId}
        WHERE cb.branch_id = :branch_id
        AND cb.is_active = 1
        AND c.is_active = 1
        ORDER BY c.sort_order ASC
    ", ['branch_id' => $branchId]);
} else {
    $categories = $db->fetchAll("
        SELECT c.*, c.name_key AS display_name, c.description_key AS display_description
        FROM categories c
        INNER JOIN category_branches cb ON c.id = cb.category_id
        WHERE cb.branch_id = :branch_id
        AND cb.is_active = 1
        AND c.is_active = 1
        ORDER BY c.sort_order ASC
    ", ['branch_id' => $branchId]);
}

// Aktif kampanyaları çek
$campaigns = [];
try {
    $campaigns = $db->fetchAll("
        SELECT * FROM campaigns
        WHERE branch_id = :branch_id AND is_active = 1
        ORDER BY sort_order ASC, id DESC
    ", ['branch_id' => $branchId]);

    // Çeviri uygula
    foreach ($campaigns as &$camp) {
        $trans = json_decode($camp['translations'] ?? '{}', true) ?: [];
        if ($selectedLangCode && isset($trans[$selectedLangCode])) {
            $t = $trans[$selectedLangCode];
            if (!empty($t['title']))       $camp['title']       = $t['title'];
            if (!empty($t['description'])) $camp['description'] = $t['description'];
            if (!empty($t['button_text'])) $camp['button_text'] = $t['button_text'];
        }
    }
    unset($camp);
} catch (\Throwable $e) {
    $campaigns = [];
}

$popupCampaign  = null;
$sliderCampaigns = [];
foreach ($campaigns as $camp) {
    if ($camp['is_popup'] && !$popupCampaign) $popupCampaign = $camp;
    else $sliderCampaigns[] = $camp;
}

// Sayfa başlığı
$pageTitle = htmlspecialchars($branch['name']) . ' - ' . $ui['menu_title'];
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($selectedLangCode ?? ($defaultLang['code'] ?? 'tr')); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="<?= SITE_URL ?>/menu/assets/css/menu.css">
    <?php if (!empty($menuSettings)): ?>
    <style>
    :root {
        <?php if (!empty($menuSettings['primary_color'])):    ?>--primary-color:      <?= htmlspecialchars($menuSettings['primary_color'])    ?>; <?php endif; ?>
        <?php if (!empty($menuSettings['secondary_color'])): ?>--secondary-color:    <?= htmlspecialchars($menuSettings['secondary_color'])  ?>; <?php endif; ?>
        <?php if (!empty($menuSettings['text_color'])):      ?>--text-color:         <?= htmlspecialchars($menuSettings['text_color'])       ?>; <?php endif; ?>
        <?php if (!empty($menuSettings['background_color'])): ?>--bg-color:          <?= htmlspecialchars($menuSettings['background_color']) ?>; <?php endif; ?>
        <?php if (isset($menuSettings['border_radius'])):    ?>--menu-border-radius: <?= (int)$menuSettings['border_radius'] ?>px; <?php endif; ?>
        <?php if (isset($menuSettings['logo_radius'])):      ?>--menu-logo-radius:   <?= (int)$menuSettings['logo_radius']   ?>px; <?php endif; ?>
    }
    <?php if (!empty($menuSettings['font_family'])): ?>
    body { font-family: <?= htmlspecialchars($menuSettings['font_family']) ?> !important; }
    <?php endif; ?>
    <?php if (!empty($menuSettings['logo_position']) && $menuSettings['logo_position'] !== 'center'): ?>
    <?php if ($menuSettings['logo_position'] === 'left'): ?>
    .branch-hero-content { text-align: left !important; }
    .branch-hero-logo, .branch-hero-icon { margin-left: 0 !important; margin-right: auto !important; }
    <?php elseif ($menuSettings['logo_position'] === 'right'): ?>
    .branch-hero-content { text-align: right !important; }
    .branch-hero-logo, .branch-hero-icon { margin-left: auto !important; margin-right: 0 !important; }
    <?php endif; ?>
    <?php endif; ?>
    </style>
    <?php endif; ?>
</head>
<body>
    <!-- Header Component (Dil Seçici) -->
    <?php include 'components/header.php'; ?>

    <!-- Ana İçerik -->
    <div class="container-fluid px-0">

        <!-- Şube Hero Banner -->
        <?php
            $heroBg = '';
            if (!empty($branch['banner_path'])) {
                $heroBg = "style=\"--hero-bg: url('/". htmlspecialchars($branch['banner_path']) ."')\"";
            } elseif (!empty($branch['logo_path'])) {
                $heroBg = "style=\"--hero-bg: url('/". htmlspecialchars($branch['logo_path']) ."')\"";
            }
        ?>
        <div class="branch-hero" <?php echo $heroBg; ?>>
            <div class="branch-hero-overlay"></div>
            <div class="branch-hero-content">
                <?php if (!empty($branch['logo_path'])): ?>
                    <img src="<?= SITE_URL ?>/<?php echo htmlspecialchars($branch['logo_path']); ?>"
                         alt="<?php echo htmlspecialchars($branch['name']); ?>"
                         loading="lazy"
                         decoding="async"
                         class="branch-hero-logo">
                <?php else: ?>
                    <div class="branch-hero-icon">
                        <i class="fas fa-store"></i>
                    </div>
                <?php endif; ?>
                <h1 class="branch-hero-name"><?php echo htmlspecialchars($branch['name']); ?></h1>
                <?php if ($branch['address']): ?>
                    <p class="branch-hero-address">
                        <i class="fas fa-map-marker-alt me-1"></i>
                        <?php echo htmlspecialchars($branch['address']); ?>
                    </p>
                <?php endif; ?>
            </div>
        </div>

        <!-- Kampanya Slider -->
        <?php if (!empty($sliderCampaigns)): ?>
        <div class="campaign-slider-wrap container py-3">
            <div class="campaign-slider" id="campSlider">
                <?php foreach ($sliderCampaigns as $i => $camp):
                    $trans = [];
                    try { $trans = json_decode($camp['translations'] ?? '{}', true) ?: []; } catch(Exception $e) {}
                    $campTitle = ($selectedLangCode && isset($trans[$selectedLangCode]['title']) && $trans[$selectedLangCode]['title'])
                        ? $trans[$selectedLangCode]['title'] : $camp['title'];
                    $campDesc  = ($selectedLangCode && isset($trans[$selectedLangCode]['description']) && $trans[$selectedLangCode]['description'])
                        ? $trans[$selectedLangCode]['description'] : ($camp['description'] ?? '');
                    $campBtn   = ($selectedLangCode && isset($trans[$selectedLangCode]['button_text']) && $trans[$selectedLangCode]['button_text'])
                        ? $trans[$selectedLangCode]['button_text'] : ($camp['button_text'] ?? '');

                    $campHref = '#';
                    if ($camp['link_type'] === 'product' && $camp['link_id']) {
                        $campHref = SITE_URL . '/menu/' . $branchId . '/product/' . $camp['link_id'] . '/';
                    } elseif ($camp['link_type'] === 'category' && $camp['link_id']) {
                        $campHref = SITE_URL . '/menu/' . $branchId . '/products/' . $camp['link_id'] . '/';
                    }
                ?>
                <div class="campaign-slide <?= $i===0?'active':'' ?>" data-index="<?= $i ?>">
                    <?php if ($camp['image_path']): ?>
                        <div class="campaign-slide-img" style="background-image:url('<?= SITE_URL ?>/<?= htmlspecialchars($camp['image_path']) ?>')"></div>
                    <?php endif; ?>
                    <div class="campaign-slide-body">
                        <div class="campaign-slide-info">
                            <h3 class="campaign-slide-title"><?= htmlspecialchars($campTitle) ?></h3>
                            <?php if ($campDesc): ?>
                            <p class="campaign-slide-desc"><?= htmlspecialchars($campDesc) ?></p>
                            <?php endif; ?>
                            <?php if ($camp['price']): ?>
                            <span class="campaign-slide-price"><?= number_format($camp['price'],2) ?> ₺</span>
                            <?php endif; ?>
                        </div>
                        <?php if ($campHref !== '#' && $campBtn): ?>
                        <a href="<?= htmlspecialchars($campHref) ?>" class="campaign-slide-btn">
                            <?= htmlspecialchars($campBtn) ?> <i class="fas fa-arrow-right ms-1"></i>
                        </a>
                        <?php endif; ?>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php if (count($sliderCampaigns) > 1): ?>
            <div class="campaign-slider-dots">
                <?php foreach ($sliderCampaigns as $i => $camp): ?>
                <button class="camp-dot <?= $i===0?'active':'' ?>" onclick="goSlide(<?= $i ?>)"></button>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        
        <?php if ($popupCampaign): ?>
        <!-- Popup Kampanya -->
        <div class="campaign-popup-overlay" id="campaignPopupOverlay">
            <div class="campaign-popup">
                <button class="campaign-popup-close" onclick="closeCampaignPopup()"><i class="fas fa-times"></i></button>
                <?php
                    $pImgUrl = !empty($popupCampaign['image_path']) ? SITE_URL . '/' . htmlspecialchars($popupCampaign['image_path']) : null;
                    $pLink = '#';
                    if ($popupCampaign['link_type'] === 'product' && $popupCampaign['link_id'])
                        $pLink = SITE_URL . '/menu/' . $branchId . '/product/' . $popupCampaign['link_id'] . '/';
                    elseif ($popupCampaign['link_type'] === 'category' && $popupCampaign['link_id'])
                        $pLink = SITE_URL . '/menu/' . $branchId . '/products/' . $popupCampaign['link_id'] . '/';
                ?>
                <?php if ($pImgUrl): ?>
                <img src="<?= $pImgUrl ?>" alt="<?= htmlspecialchars($popupCampaign['title']) ?>" class="campaign-popup-img">
                <?php endif; ?>
                <div class="campaign-popup-body">
                    <?php if (!empty($popupCampaign['title'])): ?>
                    <h2 class="campaign-popup-title"><?= htmlspecialchars($popupCampaign['title']) ?></h2>
                    <?php endif; ?>
                    <?php if (!empty($popupCampaign['description'])): ?>
                    <p class="campaign-popup-desc"><?= htmlspecialchars($popupCampaign['description']) ?></p>
                    <?php endif; ?>
                    <?php if (!empty($popupCampaign['price'])): ?>
                    <div class="campaign-popup-price"><?= number_format($popupCampaign['price'], 2, ',', '.') ?> ₺</div>
                    <?php endif; ?>
                    <?php if ($pLink !== '#' && !empty($popupCampaign['button_text'])): ?>
                    <a href="<?= $pLink ?>" class="campaign-popup-btn"><?= htmlspecialchars($popupCampaign['button_text']) ?></a>
                    <?php elseif ($pLink !== '#'): ?>
                    <a href="<?= $pLink ?>" class="campaign-popup-btn">İncele</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <?php if (!empty($sliderCampaigns)): ?>
        <!-- Kampanya Slider -->
        <div class="campaign-slider-section">
            <div class="campaign-slider" id="campaignSlider">
                <?php foreach ($sliderCampaigns as $camp):
                    $linkUrl = '#';
                    if ($camp['link_type'] === 'product' && $camp['link_id']) {
                        $linkUrl = SITE_URL . '/menu/' . $branchId . '/product/' . $camp['link_id'] . '/';
                    } elseif ($camp['link_type'] === 'category' && $camp['link_id']) {
                        $linkUrl = SITE_URL . '/menu/' . $branchId . '/products/' . $camp['link_id'] . '/';
                    }
                ?>
                <div class="campaign-slide">
                    <a href="<?= htmlspecialchars($linkUrl) ?>" class="campaign-slide-inner text-decoration-none">
                        <?php if ($camp['image_path']): ?>
                        <img src="<?= SITE_URL ?>/<?= htmlspecialchars($camp['image_path']) ?>"
                             alt="<?= htmlspecialchars($camp['title']) ?>" class="campaign-slide-img">
                        <?php endif; ?>
                        <div class="campaign-slide-overlay">
                            <div class="campaign-slide-body">
                                <h3 class="campaign-slide-title"><?= htmlspecialchars($camp['title']) ?></h3>
                                <?php if ($camp['description']): ?>
                                <p class="campaign-slide-desc"><?= htmlspecialchars($camp['description']) ?></p>
                                <?php endif; ?>
                                <div class="campaign-slide-footer">
                                    <?php if ($camp['price']): ?>
                                    <span class="campaign-slide-price"><?= number_format($camp['price'], 2, ',', '.') ?> ₺</span>
                                    <?php endif; ?>
                                    <?php if ($camp['button_text'] && $linkUrl !== '#'): ?>
                                    <span class="campaign-slide-btn"><?= htmlspecialchars($camp['button_text']) ?></span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
                <?php endforeach; ?>
            </div>
            <?php if (count($sliderCampaigns) > 1): ?>
            <button class="campaign-slider-prev" id="sliderPrev"><i class="fas fa-chevron-left"></i></button>
            <button class="campaign-slider-next" id="sliderNext"><i class="fas fa-chevron-right"></i></button>
            <div class="campaign-slider-dots" id="sliderDots">
                <?php foreach ($sliderCampaigns as $i => $c): ?>
                <button class="campaign-slider-dot <?= $i === 0 ? 'active' : '' ?>" data-index="<?= $i ?>"></button>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        <!-- Popup Kampanya -->
        <?php if ($popupCampaign):
            $popupLink = '#';
            if ($popupCampaign['link_type'] === 'product' && $popupCampaign['link_id']) {
                $popupLink = SITE_URL . '/menu/' . $branchId . '/product/' . $popupCampaign['link_id'] . '/';
            } elseif ($popupCampaign['link_type'] === 'category' && $popupCampaign['link_id']) {
                $popupLink = SITE_URL . '/menu/' . $branchId . '/products/' . $popupCampaign['link_id'] . '/';
            }
        ?>
        <div class="campaign-popup-overlay" id="campaignPopupOverlay">
            <div class="campaign-popup">
                <button class="campaign-popup-close" id="campaignPopupClose"><i class="fas fa-times"></i></button>
                <a href="<?= htmlspecialchars($popupLink) ?>" class="text-decoration-none">
                    <?php if ($popupCampaign['image_path']): ?>
                    <img src="<?= SITE_URL ?>/<?= htmlspecialchars($popupCampaign['image_path']) ?>"
                         alt="<?= htmlspecialchars($popupCampaign['title']) ?>" class="campaign-popup-img">
                    <?php endif; ?>
                    <div class="campaign-popup-body">
                        <h3 class="campaign-popup-title"><?= htmlspecialchars($popupCampaign['title']) ?></h3>
                        <?php if ($popupCampaign['description']): ?>
                        <p class="campaign-popup-desc"><?= htmlspecialchars($popupCampaign['description']) ?></p>
                        <?php endif; ?>
                        <div class="campaign-popup-footer">
                            <?php if ($popupCampaign['price']): ?>
                            <span class="campaign-popup-price"><?= number_format($popupCampaign['price'], 2, ',', '.') ?> ₺</span>
                            <?php endif; ?>
                            <?php if ($popupCampaign['button_text'] && $popupLink !== '#'): ?>
                            <span class="campaign-popup-btn"><?= htmlspecialchars($popupCampaign['button_text']) ?></span>
                            <?php endif; ?>
                        </div>
                    </div>
                </a>
            </div>
        </div>
        <?php endif; ?>

        <!-- Kampanya Slider -->
        <?php if (!empty($sliderCampaigns)): ?>
        <div class="campaign-slider-wrap">
            <div class="campaign-slider" id="campaignSlider">
                <?php foreach ($sliderCampaigns as $i => $camp):
                    $campUrl = '#';
                    if ($camp['link_type'] === 'product' && $camp['link_id']) {
                        $campUrl = SITE_URL . '/menu/' . $branchId . '/product/' . $camp['link_id'] . '/';
                    } elseif ($camp['link_type'] === 'category' && $camp['link_id']) {
                        $campUrl = SITE_URL . '/menu/' . $branchId . '/products/' . $camp['link_id'] . '/';
                    }
                ?>
                <div class="campaign-slide <?= $i === 0 ? 'active' : '' ?>">
                    <a href="<?= htmlspecialchars($campUrl) ?>" <?= $campUrl === '#' ? 'onclick="return false"' : '' ?>>
                        <?php if ($camp['image_path']): ?>
                            <img src="<?= SITE_URL ?>/<?= htmlspecialchars($camp['image_path']) ?>" alt="<?= htmlspecialchars($camp['title']) ?>">
                        <?php endif; ?>
                        <div class="campaign-slide-info">
                            <h3><?= htmlspecialchars($camp['title']) ?></h3>
                            <?php if ($camp['description']): ?>
                                <p><?= htmlspecialchars($camp['description']) ?></p>
                            <?php endif; ?>
                            <?php if ($camp['price']): ?>
                                <span class="campaign-price"><?= number_format($camp['price'], 2, ',', '.') ?> ₺</span>
                            <?php endif; ?>
                            <?php if ($camp['button_text']): ?>
                                <span class="campaign-btn"><?= htmlspecialchars($camp['button_text']) ?></span>
                            <?php endif; ?>
                        </div>
                    </a>
                </div>
                <?php endforeach; ?>
            </div>
            <?php if (count($sliderCampaigns) > 1): ?>
            <div class="campaign-dots">
                <?php foreach ($sliderCampaigns as $i => $camp): ?>
                <span class="campaign-dot <?= $i === 0 ? 'active' : '' ?>" data-index="<?= $i ?>"></span>
                <?php endforeach; ?>
            </div>
            <button class="campaign-arrow campaign-prev" id="campPrev"><i class="fas fa-chevron-left"></i></button>
            <button class="campaign-arrow campaign-next" id="campNext"><i class="fas fa-chevron-right"></i></button>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        <!-- Kampanya Popup -->
        <?php if ($popupCampaign):
            $popUrl = '#';
            if ($popupCampaign['link_type'] === 'product' && $popupCampaign['link_id']) {
                $popUrl = SITE_URL . '/menu/' . $branchId . '/product/' . $popupCampaign['link_id'] . '/';
            } elseif ($popupCampaign['link_type'] === 'category' && $popupCampaign['link_id']) {
                $popUrl = SITE_URL . '/menu/' . $branchId . '/products/' . $popupCampaign['link_id'] . '/';
            }
        ?>
        <div class="campaign-popup-overlay" id="campaignPopup">
            <div class="campaign-popup-box">
                <button class="campaign-popup-close" id="campaignPopupClose"><i class="fas fa-times"></i></button>
                <?php if ($popupCampaign['image_path']): ?>
                    <img src="<?= SITE_URL ?>/<?= htmlspecialchars($popupCampaign['image_path']) ?>" alt="<?= htmlspecialchars($popupCampaign['title']) ?>">
                <?php endif; ?>
                <div class="campaign-popup-body">
                    <h3><?= htmlspecialchars($popupCampaign['title']) ?></h3>
                    <?php if ($popupCampaign['description']): ?>
                        <p><?= htmlspecialchars($popupCampaign['description']) ?></p>
                    <?php endif; ?>
                    <?php if ($popupCampaign['price']): ?>
                        <div class="campaign-price"><?= number_format($popupCampaign['price'], 2, ',', '.') ?> ₺</div>
                    <?php endif; ?>
                    <?php if ($popUrl !== '#'): ?>
                        <a href="<?= htmlspecialchars($popUrl) ?>" class="campaign-popup-btn">
                            <?= htmlspecialchars($popupCampaign['button_text'] ?: 'İncele') ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php endif; ?>

        <!-- Kampanya Slider -->
        <?php if (!empty($sliderCampaigns)): ?>
        <div class="campaign-slider-wrap">
            <div class="campaign-slider" id="campaignSlider">
                <?php foreach ($sliderCampaigns as $camp):
                    $campUrl = '#';
                    if ($camp['link_type'] === 'product' && $camp['link_id']) {
                        $campUrl = SITE_URL . '/menu/' . $branchId . '/product/' . $camp['link_id'] . '/';
                    } elseif ($camp['link_type'] === 'category' && $camp['link_id']) {
                        $campUrl = SITE_URL . '/menu/' . $branchId . '/products/' . $camp['link_id'] . '/';
                    }
                ?>
                <div class="campaign-slide">
                    <a href="<?= htmlspecialchars($campUrl) ?>" class="campaign-slide-inner <?= $campUrl === '#' ? 'no-link' : '' ?>">
                        <?php if ($camp['image_path']): ?>
                        <img src="<?= SITE_URL ?>/<?= htmlspecialchars($camp['image_path']) ?>"
                             alt="<?= htmlspecialchars($camp['title']) ?>" loading="lazy">
                        <?php endif; ?>
                        <div class="campaign-slide-body">
                            <h3><?= htmlspecialchars($camp['title']) ?></h3>
                            <?php if ($camp['description']): ?>
                            <p><?= htmlspecialchars($camp['description']) ?></p>
                            <?php endif; ?>
                            <div class="campaign-slide-meta">
                                <?php if ($camp['price']): ?>
                                <span class="campaign-price"><?= number_format($camp['price'], 2, ',', '.') ?> ₺</span>
                                <?php endif; ?>
                                <?php if ($camp['button_text'] && $campUrl !== '#'): ?>
                                <span class="campaign-btn"><?= htmlspecialchars($camp['button_text']) ?></span>
                                <?php endif; ?>
                            </div>
                        </div>
                    </a>
                </div>
                <?php endforeach; ?>
            </div>
            <?php if (count($sliderCampaigns) > 1): ?>
            <button class="campaign-prev" onclick="slideCampaign(-1)"><i class="fas fa-chevron-left"></i></button>
            <button class="campaign-next" onclick="slideCampaign(1)"><i class="fas fa-chevron-right"></i></button>
            <div class="campaign-dots">
                <?php foreach ($sliderCampaigns as $i => $c): ?>
                <span class="campaign-dot <?= $i === 0 ? 'active' : '' ?>" onclick="goSlide(<?= $i ?>)"></span>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        <!-- Kampanya Slider -->
        <?php if (!empty($campaigns)): ?>
        <?php
            $popupCamp  = null;
            $sliderCamps = [];
            foreach ($campaigns as $camp) {
                if ($camp['is_popup'] && !$popupCamp) $popupCamp = $camp;
                $sliderCamps[] = $camp;
            }
            $selectedLangCodeForCamp = $selectedLangCode ?: 'tr';
        ?>
        <div class="container py-3">
            <div id="campaignSlider" class="campaign-slider">
                <div class="campaign-track" id="campaignTrack">
                <?php foreach ($sliderCamps as $camp):
                    $trans = $camp['translations'] ? json_decode($camp['translations'], true) : [];
                    $t = $trans[$selectedLangCodeForCamp] ?? [];
                    $campTitle = ($t['title'] ?? '') ?: $camp['title'];
                    $campDesc  = ($t['description'] ?? '') ?: ($camp['description'] ?? '');
                    $campBtn   = ($t['button_text'] ?? '') ?: ($camp['button_text'] ?? 'İncele');

                    // Yönlendirme URL'i
                    $campUrl = '';
                    if ($camp['link_type'] === 'product' && $camp['link_id']) {
                        $campUrl = SITE_URL . '/menu/' . $branchId . '/product/' . $camp['link_id'] . '/';
                    } elseif ($camp['link_type'] === 'category' && $camp['link_id']) {
                        $campUrl = SITE_URL . '/menu/' . $branchId . '/products/' . $camp['link_id'] . '/';
                    }
                ?>
                <div class="campaign-slide">
                    <?php if ($camp['image_path']): ?>
                    <div class="campaign-slide-inner" style="background-image:url('<?= SITE_URL ?>/<?= htmlspecialchars($camp['image_path']) ?>')">
                    <?php else: ?>
                    <div class="campaign-slide-inner campaign-no-img">
                    <?php endif; ?>
                        <div class="campaign-overlay">
                            <div class="campaign-content">
                                <h3 class="camp-title"><?= htmlspecialchars($campTitle) ?></h3>
                                <?php if ($campDesc): ?>
                                <p class="camp-desc"><?= htmlspecialchars($campDesc) ?></p>
                                <?php endif; ?>
                                <div class="camp-meta">
                                    <?php if ($camp['price']): ?>
                                    <span class="camp-price"><?= number_format($camp['price'], 2, ',', '.') ?> ₺</span>
                                    <?php endif; ?>
                                    <?php if ($campUrl): ?>
                                    <a href="<?= htmlspecialchars($campUrl) ?>" class="camp-btn"><?= htmlspecialchars($campBtn) ?></a>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
                </div>
                <?php if (count($sliderCamps) > 1): ?>
                <button class="camp-prev" onclick="campaignSlide(-1)"><i class="fas fa-chevron-left"></i></button>
                <button class="camp-next" onclick="campaignSlide(1)"><i class="fas fa-chevron-right"></i></button>
                <div class="camp-dots" id="campDots">
                    <?php foreach ($sliderCamps as $i => $_): ?>
                    <span class="camp-dot <?= $i===0?'active':'' ?>" onclick="campaignGoTo(<?= $i ?>)"></span>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Popup Kampanya -->
        <?php if ($popupCamp):
            $pt = $popupCamp['translations'] ? json_decode($popupCamp['translations'], true) : [];
            $pt = $pt[$selectedLangCodeForCamp] ?? [];
            $popTitle = ($pt['title'] ?? '') ?: $popupCamp['title'];
            $popDesc  = ($pt['description'] ?? '') ?: ($popupCamp['description'] ?? '');
            $popBtn   = ($pt['button_text'] ?? '') ?: ($popupCamp['button_text'] ?? 'İncele');
            $popUrl = '';
            if ($popupCamp['link_type'] === 'product' && $popupCamp['link_id'])
                $popUrl = SITE_URL . '/menu/' . $branchId . '/product/' . $popupCamp['link_id'] . '/';
            elseif ($popupCamp['link_type'] === 'category' && $popupCamp['link_id'])
                $popUrl = SITE_URL . '/menu/' . $branchId . '/products/' . $popupCamp['link_id'] . '/';
        ?>
        <div id="campPopup" class="camp-popup-overlay">
            <div class="camp-popup-box">
                <button class="camp-popup-close" onclick="closeCampPopup()"><i class="fas fa-times"></i></button>
                <?php if ($popupCamp['image_path']): ?>
                <img src="<?= SITE_URL ?>/<?= htmlspecialchars($popupCamp['image_path']) ?>" class="camp-popup-img" alt="">
                <?php endif; ?>
                <div class="camp-popup-body">
                    <h3><?= htmlspecialchars($popTitle) ?></h3>
                    <?php if ($popDesc): ?><p><?= htmlspecialchars($popDesc) ?></p><?php endif; ?>
                    <div class="d-flex align-items-center gap-3">
                        <?php if ($popupCamp['price']): ?>
                        <span class="camp-popup-price"><?= number_format($popupCamp['price'], 2, ',', '.') ?> ₺</span>
                        <?php endif; ?>
                        <?php if ($popUrl): ?>
                        <a href="<?= htmlspecialchars($popUrl) ?>" class="camp-btn"><?= htmlspecialchars($popBtn) ?></a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        <?php endif; ?>
        <?php endif; ?>

        <!-- Kampanya Slider -->
        <?php if (!empty($sliderCampaigns)): ?>
        <div class="campaign-slider-wrap">
            <div class="campaign-slider" id="campaignSlider">
                <?php foreach ($sliderCampaigns as $i => $camp):
                    $campUrl = '#';
                    if ($camp['link_type'] === 'product' && $camp['link_id']) {
                        $campUrl = SITE_URL . '/menu/' . $branchId . '/product/' . $camp['link_id'] . '/';
                    } elseif ($camp['link_type'] === 'category' && $camp['link_id']) {
                        $campUrl = SITE_URL . '/menu/' . $branchId . '/products/' . $camp['link_id'] . '/';
                    }
                ?>
                <div class="campaign-slide<?= $i === 0 ? ' active' : '' ?>" data-index="<?= $i ?>">
                    <?php if ($camp['image_path']): ?>
                        <img src="<?= SITE_URL ?>/<?= htmlspecialchars($camp['image_path']) ?>" alt="<?= htmlspecialchars($camp['title']) ?>" class="campaign-slide-img">
                    <?php endif; ?>
                    <div class="campaign-slide-overlay">
                        <div class="campaign-slide-content">
                            <?php if ($camp['title']): ?><h3><?= htmlspecialchars($camp['title']) ?></h3><?php endif; ?>
                            <?php if ($camp['description']): ?><p><?= htmlspecialchars($camp['description']) ?></p><?php endif; ?>
                            <div class="campaign-slide-meta">
                                <?php if ($camp['price']): ?><span class="campaign-price"><?= number_format($camp['price'], 2, ',', '.') ?> ₺</span><?php endif; ?>
                                <?php if ($campUrl !== '#'): ?>
                                <a href="<?= $campUrl ?>" class="campaign-btn"><?= htmlspecialchars($camp['button_text'] ?: $ui['campaign_view'] ?? 'İncele') ?></a>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php if (count($sliderCampaigns) > 1): ?>
            <button class="campaign-slider-prev" onclick="campaignSlide(-1)"><i class="fas fa-chevron-left"></i></button>
            <button class="campaign-slider-next" onclick="campaignSlide(1)"><i class="fas fa-chevron-right"></i></button>
            <div class="campaign-slider-dots">
                <?php foreach ($sliderCampaigns as $i => $camp): ?>
                <span class="campaign-dot<?= $i === 0 ? ' active' : '' ?>" onclick="campaignGoTo(<?= $i ?>)"></span>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        <!-- Kategoriler -->
        <div class="container py-4">
            <h2 class="section-title mb-4">
                <i class="fas fa-utensils me-2"></i><?php echo htmlspecialchars($ui['categories']); ?>
            </h2>

            <?php if (empty($categories)): ?>
                <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    <?php echo htmlspecialchars($ui['menu_empty']); ?>
                </div>
            <?php else: ?>
                <!-- CSS Grid layout: grid_span değerine göre kart boyutu değişir -->
                <div class="categories-grid">
                    <?php foreach ($categories as $category):
                        $gridSpan    = htmlspecialchars($category['grid_span'] ?? 'normal');
                        // display_name SQL'den COALESCE ile gelir — çeviri varsa çevrilmiş, yoksa name_key
                        $displayName = $category['display_name'];
                        // Ürünler sayfasına lang parametresini de ilet
                        $productUrl  = SITE_URL . '/menu/' . $branchId . '/products/' . $category['id'] . '/';
                        if ($selectedLangCode) $productUrl .= '&lang=' . urlencode($selectedLangCode);
                    ?>
                        <div class="category-grid-item grid-span-<?php echo $gridSpan; ?>">
                            <a href="<?php echo $productUrl; ?>"
                               class="category-card text-decoration-none">
                                <div class="category-image">
                                    <?php if ($category['image_path']): ?>
                                        <img src="<?= SITE_URL ?>/<?php echo htmlspecialchars($category['image_path']); ?>"
                                             alt="<?php echo htmlspecialchars($displayName); ?>"
                                             loading="lazy"
                                             decoding="async"
                                             loading="lazy">
                                    <?php else: ?>
                                        <div class="no-image">
                                            <i class="fas fa-utensils"></i>
                                        </div>
                                    <?php endif; ?>
                                </div>
                                <div class="category-name">
                                    <?php echo htmlspecialchars($displayName); ?>
                                </div>
                            </a>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <!-- Footer Component -->
    <?php include 'components/footer.php'; ?>

    <!-- Kampanya Popup -->
    <?php if ($popupCampaign):
        $popupLink = '#';
        if ($popupCampaign['link_type'] === 'product' && $popupCampaign['link_id']) {
            $popupLink = SITE_URL . '/menu/' . $branchId . '/product/' . $popupCampaign['link_id'] . '/';
        } elseif ($popupCampaign['link_type'] === 'category' && $popupCampaign['link_id']) {
            $popupLink = SITE_URL . '/menu/' . $branchId . '/products/' . $popupCampaign['link_id'] . '/';
        }
    ?>
    <div class="campaign-popup-overlay" id="campaignPopupOverlay" onclick="closeCampaignPopup()">
        <div class="campaign-popup" onclick="event.stopPropagation()">
            <button class="campaign-popup-close" onclick="closeCampaignPopup()"><i class="fas fa-times"></i></button>
            <?php if ($popupCampaign['image_path']): ?>
            <div class="campaign-popup-img">
                <img src="<?= SITE_URL ?>/<?= htmlspecialchars($popupCampaign['image_path']) ?>" alt="<?= htmlspecialchars($popupCampaign['title']) ?>">
            </div>
            <?php endif; ?>
            <div class="campaign-popup-body">
                <h3 class="campaign-popup-title"><?= htmlspecialchars($popupCampaign['title']) ?></h3>
                <?php if ($popupCampaign['description']): ?>
                <p class="campaign-popup-desc"><?= htmlspecialchars($popupCampaign['description']) ?></p>
                <?php endif; ?>
                <?php if ($popupCampaign['price']): ?>
                <div class="campaign-popup-price"><?= number_format($popupCampaign['price'],2,',','.') ?> ₺</div>
                <?php endif; ?>
                <?php if ($popupCampaign['button_text'] && $popupLink !== '#'): ?>
                <a href="<?= htmlspecialchars($popupLink) ?>" class="campaign-popup-btn"><?= htmlspecialchars($popupCampaign['button_text']) ?></a>
                <?php elseif ($popupLink !== '#'): ?>
                <a href="<?= htmlspecialchars($popupLink) ?>" class="campaign-popup-btn">İncele</a>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <script>
    window.addEventListener('load', function() {
        var key = 'popup_seen_<?= $branchId ?>_<?= $popupCampaign['id'] ?>';
        if (!sessionStorage.getItem(key)) {
            setTimeout(function() {
                document.getElementById('campaignPopupOverlay').classList.add('active');
            }, 600);
        }
    });
    function closeCampaignPopup() {
        var el = document.getElementById('campaignPopupOverlay');
        el.classList.remove('active');
        sessionStorage.setItem('popup_seen_<?= $branchId ?>_<?= $popupCampaign['id'] ?>', '1');
    }
    </script>
    <?php endif; ?>

    <!-- Kampanya Popup -->
    <?php if ($popupCampaign):
        $trans = [];
        try { $trans = json_decode($popupCampaign['translations'] ?? '{}', true) ?: []; } catch(Exception $e) {}
        $popTitle = ($selectedLangCode && isset($trans[$selectedLangCode]['title']) && $trans[$selectedLangCode]['title'])
            ? $trans[$selectedLangCode]['title'] : $popupCampaign['title'];
        $popDesc  = ($selectedLangCode && isset($trans[$selectedLangCode]['description']) && $trans[$selectedLangCode]['description'])
            ? $trans[$selectedLangCode]['description'] : ($popupCampaign['description'] ?? '');
        $popBtn   = ($selectedLangCode && isset($trans[$selectedLangCode]['button_text']) && $trans[$selectedLangCode]['button_text'])
            ? $trans[$selectedLangCode]['button_text'] : ($popupCampaign['button_text'] ?? '');
        $popHref = '#';
        if ($popupCampaign['link_type'] === 'product' && $popupCampaign['link_id'])
            $popHref = SITE_URL . '/menu/' . $branchId . '/product/' . $popupCampaign['link_id'] . '/';
        elseif ($popupCampaign['link_type'] === 'category' && $popupCampaign['link_id'])
            $popHref = SITE_URL . '/menu/' . $branchId . '/products/' . $popupCampaign['link_id'] . '/';
    ?>
    <div class="campaign-popup-overlay" id="campPopupOverlay" onclick="closeCampPopup()"></div>
    <div class="campaign-popup" id="campPopup">
        <button class="campaign-popup-close" onclick="closeCampPopup()"><i class="fas fa-times"></i></button>
        <?php if ($popupCampaign['image_path']): ?>
        <div class="campaign-popup-img">
            <img src="<?= SITE_URL ?>/<?= htmlspecialchars($popupCampaign['image_path']) ?>" alt="<?= htmlspecialchars($popTitle) ?>">
        </div>
        <?php endif; ?>
        <div class="campaign-popup-body">
            <h3><?= htmlspecialchars($popTitle) ?></h3>
            <?php if ($popDesc): ?><p><?= nl2br(htmlspecialchars($popDesc)) ?></p><?php endif; ?>
            <?php if ($popupCampaign['price']): ?>
            <div class="campaign-popup-price"><?= number_format($popupCampaign['price'],2) ?> ₺</div>
            <?php endif; ?>
            <?php if ($popHref !== '#' && $popBtn): ?>
            <a href="<?= htmlspecialchars($popHref) ?>" class="campaign-popup-btn"><?= htmlspecialchars($popBtn) ?></a>
            <?php endif; ?>
        </div>
    </div>
    <script>
    window.addEventListener('load', function() {
        var shown = sessionStorage.getItem('campPopup_<?= $popupCampaign['id'] ?>');
        if (!shown) {
            setTimeout(function() {
                document.getElementById('campPopup').classList.add('show');
                document.getElementById('campPopupOverlay').classList.add('show');
            }, 600);
            sessionStorage.setItem('campPopup_<?= $popupCampaign['id'] ?>', '1');
        }
    });
    function closeCampPopup() {
        document.getElementById('campPopup').classList.remove('show');
        document.getElementById('campPopupOverlay').classList.remove('show');
    }
    </script>
    <?php endif; ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="<?= SITE_URL ?>/menu/assets/js/menu.js"></script>
    <?php if (!empty($sliderCampaigns) && count($sliderCampaigns) > 1): ?>
    <script>
    var _slide = 0, _total = <?= count($sliderCampaigns) ?>, _timer;
    function goSlide(n) {
        document.querySelectorAll('.campaign-slide').forEach(function(s,i){ s.classList.toggle('active', i===n); });
        document.querySelectorAll('.camp-dot').forEach(function(d,i){ d.classList.toggle('active', i===n); });
        _slide = n;
    }
    function nextSlide() { goSlide((_slide+1) % _total); }
    _timer = setInterval(nextSlide, 4000);
    document.getElementById('campSlider').addEventListener('mouseenter', function(){ clearInterval(_timer); });
    document.getElementById('campSlider').addEventListener('mouseleave', function(){ _timer = setInterval(nextSlide, 4000); });
    </script>
    <?php endif; ?>
</body>
</html>