/**
 * ==============================================
 * CLIENT NAVBAR COMPONENT JAVASCRIPT
 * ==============================================
 * - Floating bayraklı dil seçici (FAZA 12)
 *   admin/components/navbar/navbar.js'den adapt
 *   Fark: AJAX → client/pages/profile/actions (panel_lang güncelleme)
 * ==============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Client Navbar component loaded');
    setupClientLangSwitcher();
});

// ==============================================
// DİL KODU → ÜLKE KODU → BAYRAK UTILITY
// ==============================================

function clientEmojiFlagToCC(str) {
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

function clientGetLangCC(lang) {
    const flag = (lang.flag || '').trim();
    const code = (lang.code  || '').trim().toLowerCase();

    if (flag) {
        const fromEmoji = clientEmojiFlagToCC(flag);
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

function clientGetFlagImg(lang, cls) {
    const cc      = clientGetLangCC(lang);
    const classes = 'client-lang-flag-img' + (cls ? ' ' + cls : '');
    const alt     = (lang.name || '').replace(/"/g, '&quot;');
    const siteUrl = (typeof SITE_URL !== 'undefined') ? SITE_URL : '';
    const local   = siteUrl + '/menu/assets/flags/' + cc + '.svg';
    const proxy   = siteUrl + '/menu/flag.php?cc=' + encodeURIComponent(cc);
    return '<img class="' + classes + '" src="' + local + '" alt="' + alt + '" loading="eager"'
         + ' onerror="if(this.src.indexOf(\'flag.php\')<0){this.src=\'' + proxy + '\'}else{this.style.visibility=\'hidden\'}">';
}

// ==============================================
// CLIENT FLOATING DİL SEÇİCİ
// ==============================================
function setupClientLangSwitcher() {
    const dataEl = document.getElementById('client-lang-switcher-data');
    if (!dataEl) return;

    let langs;
    try {
        langs = JSON.parse(dataEl.textContent);
    } catch (e) {
        return;
    }
    if (!langs || langs.length < 2) return;

    const container = document.getElementById('clientFloatingLang');
    if (!container) return;

    const currentLang = langs.find(l => l.is_current) || langs[0];

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'client-lang-backdrop';
    document.body.appendChild(backdrop);

    // Floating buton
    const floatBtn = document.createElement('button');
    floatBtn.className = 'client-lang-float-btn';
    floatBtn.setAttribute('aria-label', 'Dil seç');
    floatBtn.setAttribute('aria-expanded', 'false');
    floatBtn.innerHTML = clientGetFlagImg(currentLang, 'client-lang-btn-flag');
    container.appendChild(floatBtn);

    // Panel
    const panel = document.createElement('div');
    panel.className = 'client-lang-float-panel';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-label', 'Panel dili seçenekleri');

    const header = document.createElement('div');
    header.className = 'client-lang-panel-header';
    header.textContent = 'Panel Dili';
    panel.appendChild(header);

    langs.forEach(function(lang) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'client-lang-panel-item' + (lang.is_current ? ' active' : '');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', lang.is_current ? 'true' : 'false');
        item.setAttribute('data-code', lang.code);
        item.title = lang.name;

        item.innerHTML =
            clientGetFlagImg(lang, 'client-lang-panel-flag') +
            '<span class="client-lang-panel-info">' +
                '<span class="client-lang-panel-name">' + escClientHtml(lang.name) + '</span>' +
                '<span class="client-lang-panel-code">' + escClientHtml(lang.code.toUpperCase()) + '</span>' +
            '</span>';

        item.addEventListener('click', function() {
            if (lang.is_current) {
                closePanel();
                return;
            }
            setClientLang(lang.code, floatBtn, langs);
            closePanel();
        });

        panel.appendChild(item);
    });

    container.appendChild(panel);

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
 * AJAX: Client panel dilini profile actions ile güncelle → sayfayı yenile
 * profile.php'deki update_lang action'ını kullanır
 */
function setClientLang(code, floatBtn, langs) {
    const formData = new FormData();
    formData.append('action', 'update_lang');
    formData.append('panel_lang', code);   // profile.php $_POST['panel_lang'] okuyor

    fetch('/client/pages/profile/profile.php', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'  // AJAX tespiti için (profile.php JSON döndürür)
        },
        body: formData,
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.success) {
            // Bayrak butonunu güncelle
            const newLang = langs.find(l => l.code === code);
            if (newLang && floatBtn) {
                floatBtn.innerHTML = clientGetFlagImg(newLang, 'client-lang-btn-flag');
            }
            // Active class'ları güncelle
            document.querySelectorAll('.client-lang-panel-item').forEach(function(el) {
                const isNew = el.dataset.code === code;
                el.classList.toggle('active', isNew);
                el.setAttribute('aria-selected', isNew ? 'true' : 'false');
            });
            // Sayfayı yenile
            location.reload();
        } else {
            console.warn('Client dil değiştirme başarısız:', data.message);
        }
    })
    .catch(function(err) {
        console.error('setClientLang hatası:', err);
    });
}

function escClientHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}