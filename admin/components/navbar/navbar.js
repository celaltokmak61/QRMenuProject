/**
 * ==============================================
 * NAVBAR COMPONENT JAVASCRIPT
 * ==============================================
 * - Dropdown animasyonları
 * - Mobil menü işlemleri
 * - Floating bayraklı dil seçici (FAZA 12)
 *   menu/assets/js/menu.js pattern'inden adapt
 * ==============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Navbar component loaded');

    // Floating dil seçiciyi başlat
    setupAdminLangSwitcher();
});

// ==============================================
// DİL KODU → ÜLKE KODU → BAYRAK UTILITY
// ==============================================

/**
 * Bayrak emojisini (🇹🇷 → "tr") ülke koduna çevirir.
 * Unicode Regional Indicator aritmetiği.
 */
function adminEmojiFlagToCC(str) {
    const chars = [...str];
    if (chars.length < 2) return null;
    const cp0 = chars[0].codePointAt(0);
    const cp1 = chars[1].codePointAt(0);
    if (cp0 >= 0x1F1E6 && cp0 <= 0x1F1FF &&
        cp1 >= 0x1F1E6 && cp1 <= 0x1F1FF) {
        return String.fromCharCode(cp0 - 0x1F1A5) + String.fromCharCode(cp1 - 0x1F1A5);
    }
    return null;
}

/**
 * Dil/ülke kodunu küçük harfli 2-karakterli ülke koduna çevirir.
 * 3 aşamalı çözümleme: emoji → ASCII CC → langMap
 */
function adminGetLangCC(lang) {
    const flag = (lang.flag || '').trim();
    const code = (lang.code  || '').trim().toLowerCase();

    if (flag) {
        const fromEmoji = adminEmojiFlagToCC(flag);
        if (fromEmoji) return fromEmoji.toLowerCase();
    }

    const langMap = {
        'en': 'gb', 'ja': 'jp', 'ko': 'kr', 'zh': 'cn',
        'cs': 'cz', 'el': 'gr', 'uk': 'ua', 'he': 'il',
        'fa': 'ir', 'vi': 'vn', 'ka': 'ge', 'hy': 'am',
        'ms': 'my', 'hi': 'in', 'bn': 'bd', 'af': 'za',
        'sq': 'al', 'az': 'az', 'be': 'by', 'bs': 'ba',
        'sw': 'ke', 'sl': 'si', 'sk': 'sk', 'sr': 'rs',
    };

    const flagLower = flag.toLowerCase();
    if (flagLower && /^[a-z]{2}(-[a-z]{2})?$/.test(flagLower)) {
        const parts = flagLower.split('-');
        return parts.length > 1 ? parts[parts.length - 1] : (langMap[parts[0]] || parts[0]);
    }

    if (!code) return 'un';
    const parts = code.split('-');
    if (parts.length > 1) return parts[parts.length - 1];
    return langMap[parts[0]] || parts[0];
}

/**
 * Bayrak <img> HTML'i döner — yerel SVG önce, proxy fallback.
 * @param {Object} lang  — {code, name, flag}
 * @param {string} cls   — ek CSS sınıfı
 */
function adminGetFlagImg(lang, cls) {
    const cc      = adminGetLangCC(lang);
    const classes = 'admin-lang-flag-img' + (cls ? ' ' + cls : '');
    const alt     = (lang.name || '').replace(/"/g, '&quot;');
    const local   = (window.SITE_URL || '') + '/menu/assets/flags/' + cc + '.svg';
    const proxy   = '/menu/flag.php?cc=' + encodeURIComponent(cc);
    return '<img class="' + classes + '" src="' + local + '" alt="' + alt + '" loading="eager"'
         + ' onerror="if(this.src.indexOf(\'flag.php\')<0){this.src=\'' + proxy + '\'}else{this.style.visibility=\'hidden\'}">';
}

// ==============================================
// ADMIN FLOATING DİL SEÇİCİ
// ==============================================
function setupAdminLangSwitcher() {
    // PHP'den gömülen JSON verisini oku
    const dataEl = document.getElementById('admin-lang-switcher-data');
    if (!dataEl) return;

    let langs;
    try {
        langs = JSON.parse(dataEl.textContent);
    } catch (e) {
        return;
    }
    if (!langs || langs.length < 2) return;

    // Kapsayıcı div
    const container = document.getElementById('adminFloatingLang');
    if (!container) return;

    // Aktif dil
    const currentLang = langs.find(l => l.is_current) || langs[0];

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'admin-lang-backdrop';
    document.body.appendChild(backdrop);

    // Floating buton
    const floatBtn = document.createElement('button');
    floatBtn.className = 'admin-lang-float-btn';
    floatBtn.setAttribute('aria-label', 'Dil seç');
    floatBtn.setAttribute('aria-expanded', 'false');
    floatBtn.innerHTML = adminGetFlagImg(currentLang, 'admin-lang-btn-flag');
    container.appendChild(floatBtn);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'admin-lang-float-panel';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-label', 'Panel dili seçenekleri');

    // Panel başlık
    const header = document.createElement('div');
    header.className = 'admin-lang-panel-header';
    header.textContent = 'Panel Dili';
    panel.appendChild(header);

    // Dil satırları
    langs.forEach(function(lang) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'admin-lang-panel-item' + (lang.is_current ? ' active' : '');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', lang.is_current ? 'true' : 'false');
        item.setAttribute('data-code', lang.code);
        item.title = lang.name;

        item.innerHTML =
            adminGetFlagImg(lang, 'admin-lang-panel-flag') +
            '<span class="admin-lang-panel-info">' +
                '<span class="admin-lang-panel-name">' + escAdminHtml(lang.name) + '</span>' +
                '<span class="admin-lang-panel-code">' + escAdminHtml(lang.code.toUpperCase()) + '</span>' +
            '</span>';

        item.addEventListener('click', function() {
            if (lang.is_current) {
                closePanel();
                return;
            }
            setAdminLang(lang.code, item, floatBtn, langs);
            closePanel();
        });

        panel.appendChild(item);
    });

    container.appendChild(panel);

    // --- Aç/Kapat ---
    function openPanel() {
        panel.classList.add('open');
        backdrop.classList.add('open');
        floatBtn.setAttribute('aria-expanded', 'true');
    }

    function closePanel() {
        panel.classList.remove('open');
        backdrop.classList.remove('open');
        floatBtn.setAttribute('aria-expanded', 'false');
    }

    floatBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        panel.classList.contains('open') ? closePanel() : openPanel();
    });

    backdrop.addEventListener('click', closePanel);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closePanel();
    });
}

/**
 * AJAX: Admin panel dilini session'a kaydet → sayfayı yenile
 */
function setAdminLang(code, clickedItem, floatBtn, langs) {
    const formData = new FormData();
    formData.append('action', 'setAdminLang');
    formData.append('code',   code);

    fetch((window.ADMIN_URL || '/LokmaQR/admin') + '/pages/ui-translations/actions.php', {
        method: 'POST',
        body:   formData,
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            // Bayrak butonunu güncelle (anlık görsel geri bildirim)
            const newLang = langs.find(l => l.code === code);
            if (newLang && floatBtn) {
                floatBtn.innerHTML = adminGetFlagImg(newLang, 'admin-lang-btn-flag');
            }
            // Active class'ları güncelle
            document.querySelectorAll('.admin-lang-panel-item').forEach(function(el) {
                const isNew = el.dataset.code === code;
                el.classList.toggle('active', isNew);
                el.setAttribute('aria-selected', isNew ? 'true' : 'false');
            });
            // Sayfayı yenile (yeni dil yüklensin)
            location.reload();
        } else {
            console.warn('Admin dil değiştirme başarısız:', data.message);
        }
    })
    .catch(function(err) {
        console.error('setAdminLang hatası:', err);
    });
}

/**
 * XSS güvenliği için HTML escape
 */
function escAdminHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}