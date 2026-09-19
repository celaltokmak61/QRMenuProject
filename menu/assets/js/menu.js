/**
 * QR Menü Sistemi - JavaScript
 * Smooth scroll, lazy loading, floating dil seçici ve etkileşimler
 */

// ==============================================
// SAYFA YÜKLENDİĞİNDE
// ==============================================
document.addEventListener('DOMContentLoaded', function() {
    // Lazy loading için resim yükleme
    setupLazyLoading();
    
    // Smooth scroll animasyonları
    setupSmoothScroll();
    
    // Touch gestures (mobil için)
    setupTouchGestures();
    
    // Image error handling
    setupImageErrorHandling();
    
    // Floating aksiyon grubu: yukarı çık + dil seçici
    setupFloatingActions();
    
    // Kategori listesinde scroll pozisyonunu kaydet / restore et
    setupScrollPositionMemory();
    
    console.log('QR Menü sistemi yüklendi');
});

// ==============================================
// LAZY LOADING - Resim Optimizasyonu
// ==============================================
function setupLazyLoading() {
    // Intersection Observer API destekliyorsa kullan
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // data-src varsa yükle
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Loading class'ını kaldır
                    img.classList.remove('loading');
                    
                    // Observer'dan çıkar
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px' // 50px önceden yüklemeye başla
        });
        
        // Tüm lazy-load class'ı olan resimleri gözlemle
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback: Tüm resimleri direkt yükle
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ==============================================
// SMOOTH SCROLL
// ==============================================
function setupSmoothScroll() {
    // Tüm anchor linklere smooth scroll ekle
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // # varsa scroll yap
            if (href !== '#' && href !== '#!') {
                e.preventDefault();
                
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ==============================================
// TOUCH GESTURES (Mobil için)
// ==============================================
function setupTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Swipe detection
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 50;
        
        // Sağa swipe (geri dön)
        if (touchEndX > touchStartX + swipeThreshold) {
            const backButton = document.querySelector('.back-button');
            if (backButton) {
                // Geri dön animasyonu
                backButton.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    backButton.style.transform = 'scale(1)';
                }, 200);
            }
        }
        
        // Sola swipe (ileri - şimdilik kullanılmıyor)
        if (touchEndX < touchStartX - swipeThreshold) {
            // İleride kullanılabilir
        }
    }
}

// ==============================================
// IMAGE ERROR HANDLING
// ==============================================
function setupImageErrorHandling() {
    // Resim yüklenemezse placeholder göster
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            // Eğer zaten placeholder değilse
            if (!this.classList.contains('placeholder-img')) {
                // Parent element'i bul
                const parent = this.closest('.product-image, .category-image, .product-detail-image');
                
                if (parent) {
                    // Resmi gizle
                    this.style.display = 'none';
                    
                    // No-image div oluştur
                    const noImage = document.createElement('div');
                    noImage.className = 'no-image';
                    noImage.innerHTML = '<i class="fas fa-utensils"></i>';
                    
                    parent.appendChild(noImage);
                }
            }
        });
    });
}

// ==============================================
// FLOATING AKSİYON GRUBU
// Sağ altta sabit konumda:
//   • Yukarı Çık butonu (scroll > 200px)
//   • Dil Seçici butonu + yukarı süzülen panel
// ==============================================
function setupFloatingActions() {
    // Ortak kapsayıcı grup
    const group = document.createElement('div');
    group.className = 'floating-actions';
    document.body.appendChild(group);

    // 1. Yukarı çık butonu
    setupScrollTopButton(group);

    // 2. Dil seçici floating buton + panel
    setupLangSwitcher(group);
}

// ==============================================
// YUKARI ÇIK BUTONU (Kayan / Floating)
// ==============================================
function setupScrollTopButton(container) {
    // Butonu floating-actions grubuna ekle
    const btn = document.createElement('button');
    btn.id = 'scrollTopBtn';
    btn.className = 'scroll-top-btn';
    btn.setAttribute('aria-label', 'Yukarı çık');
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';

    // floating-actions içinde, CSS column-reverse sayesinde altta görünür
    container.appendChild(btn);
    
    // 200px scroll edilince göster
    window.addEventListener('scroll', function() {
        if (window.scrollY > 200) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });
    
    // Tıklanınca smooth scroll ile en üste çık
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==============================================
// FLOATING DİL SEÇİCİ (FAZA 11)
// - Sağ altta bayraklı yuvarlak buton
// - Tıklandığında yukarı süzülen panel açılır
// - Dil seçilince scroll pozisyonu korunur
// - Arap müşteri ↔ Türk garson senaryosu:
//   dil değişince ekran aynı yerde kalır
// ==============================================
// ==============================================
// DİL KODU → ÜLKE KODU → BAYRAK
// jsDelivr CDN üzerinden flag-icons SVG dosyaları
// <img src="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/flags/4x3/tr.svg">
// Örnek: 'tr' → 'tr' | 'en' → 'gb' | 'en-gb' → 'gb'
// ==============================================

/**
 * Bayrak emojisini (🇹🇷 → "tr", 🇬🇧 → "gb") ülke koduna çevirir.
 * Unicode Regional Indicator sembol değerinden harfi geri hesaplar.
 */
function emojiFlagToCC(str) {
    const chars = [...str]; // Unicode code pointleri doğru split eder
    if (chars.length < 2) return null;
    const cp0 = chars[0].codePointAt(0);
    const cp1 = chars[1].codePointAt(0);
    // Regional Indicator: U+1F1E6 (A) … U+1F1FF (Z)
    if (cp0 >= 0x1F1E6 && cp0 <= 0x1F1FF && cp1 >= 0x1F1E6 && cp1 <= 0x1F1FF) {
        return String.fromCharCode(cp0 - 0x1F1A5) + String.fromCharCode(cp1 - 0x1F1A5);
    }
    return null;
}

/** Dil/ülke kodunu küçük harfli 2-karakterli ülke koduna çevir */
function getLangCC(lang) {
    const flag = (lang.flag || '').trim();
    const code = (lang.code  || '').trim().toLowerCase();

    // 1. flag alanı emoji içeriyorsa (🇹🇷, 🇬🇧 …) → CC'ye çevir
    if (flag) {
        const fromEmoji = emojiFlagToCC(flag);
        if (fromEmoji) return fromEmoji.toLowerCase();
    }

    // Dil kodu → ülke kodu haritası (ISO 639-1 → ISO 3166-1)
    const langMap = {
        'en': 'gb', 'ja': 'jp', 'ko': 'kr', 'zh': 'cn',
        'cs': 'cz', 'el': 'gr', 'uk': 'ua', 'he': 'il',
        'fa': 'ir', 'vi': 'vn', 'ka': 'ge', 'hy': 'am',
        'ms': 'my', 'hi': 'in', 'bn': 'bd', 'af': 'za',
        'sq': 'al', 'az': 'az', 'be': 'by', 'bs': 'ba',
        'sw': 'ke', 'sl': 'si', 'sk': 'sk', 'sr': 'rs',
    };

    // 2. flag düz ASCII kod ise: "tr", "gb", "en-gb" …
    const flagLower = flag.toLowerCase();
    if (flagLower && /^[a-z]{2}(-[a-z]{2})?$/.test(flagLower)) {
        const parts = flagLower.split('-');
        return parts.length > 1 ? parts[parts.length - 1] : (langMap[parts[0]] || parts[0]);
    }

    // 3. Dil kodunu kullan: "en" → "gb", "tr" → "tr"
    if (!code) return 'un';
    const parts = code.split('-');
    if (parts.length > 1) return parts[parts.length - 1];
    return langMap[parts[0]] || parts[0];
}

/**
 * flag-icons SVG bayrağı — jsDelivr CDN üzerinden direkt <img> olarak yükler
 * Örnek: <img class="flag-cdn-img flag-btn" src="https://cdn.jsdelivr.net/.../flags/4x3/tr.svg">
 */
function getFlagImg(lang, extraClass) {
    const cc  = getLangCC(lang);
    const cls = 'flag-cdn-img' + (extraClass ? ' ' + extraClass : '');
    const alt = (lang.name || '').replace(/"/g, '&quot;');
    // Önce yerel SVG dosyasını dene; yoksa PHP proxy (CDN indirip cache'ler)
    const _base    = (typeof QRMENU_SITE_URL !== 'undefined') ? QRMENU_SITE_URL : '';
    const localSrc = _base + '/menu/assets/flags/' + cc + '.svg';
    const proxySrc = _base + '/menu/flag.php?cc=' + encodeURIComponent(cc);
    return '<img class="' + cls + '" src="' + localSrc + '" alt="' + alt + '" loading="eager"'
         + ' onerror="if(this.src.indexOf(\'flag.php\')<0){this.src=\'' + proxySrc + '\'}else{this.style.visibility=\'hidden\'}">';
}

function setupLangSwitcher(container) {
    // JSON verisini oku (header.php tarafından gömülür)
    const dataEl = document.getElementById('lang-switcher-data');
    if (!dataEl) return; // dil verisi yoksa (tek dil) hiçbir şey yapma

    let langs;
    try {
        langs = JSON.parse(dataEl.textContent);
    } catch (e) {
        return;
    }
    if (!langs || langs.length < 2) return;

    // Aktif dil
    const activeLang = langs.find(l => l.is_active) || langs[0];

    // --- Sayfa yüklenince scroll pozisyonunu restore et ---
    const LANG_SCROLL_KEY = 'qrmenu_lang_scroll';
    const savedScroll = sessionStorage.getItem(LANG_SCROLL_KEY);
    if (savedScroll !== null) {
        requestAnimationFrame(function() {
            window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
        });
        sessionStorage.removeItem(LANG_SCROLL_KEY);
    }

    // --- Floating buton (bayrak ikonu) ---
    const floatBtn = document.createElement('button');
    floatBtn.className = 'lang-float-btn always-visible';
    floatBtn.setAttribute('aria-label', 'Dil seç');
    floatBtn.setAttribute('aria-expanded', 'false');
    floatBtn.innerHTML = getFlagImg(activeLang, 'lang-btn-flag-img');
    container.appendChild(floatBtn);

    // --- Backdrop (paneli kapatmak için) ---
    const backdrop = document.createElement('div');
    backdrop.className = 'lang-float-backdrop';
    document.body.appendChild(backdrop);

    // --- Panel ---
    const panel = document.createElement('div');
    panel.className = 'lang-float-panel';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-label', 'Dil seçenekleri');

    // Panel başlık satırı
    const header = document.createElement('div');
    header.className = 'lang-panel-header';
    header.textContent = 'Dil Seç';
    panel.appendChild(header);

    // Dil satırları
    langs.forEach(function(lang) {
        const item = document.createElement('a');
        item.href = lang.href;
        item.className = 'lang-panel-item' + (lang.is_active ? ' active' : '');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', lang.is_active ? 'true' : 'false');
        item.title = lang.name;

        item.innerHTML =
            getFlagImg(lang, 'lang-panel-flag-img') +
            '<span class="lang-panel-info">' +
                '<span class="lang-panel-name">' + lang.name + '</span>' +
                '<span class="lang-panel-code">' + lang.code.toUpperCase() + '</span>' +
            '</span>';

        // Dil seçilince scroll pozisyonunu kaydet → sayfa aynı yerde açılır
        item.addEventListener('click', function(e) {
            if (!lang.is_active) {
                // Mevcut scroll Y'yi kaydet
                sessionStorage.setItem(LANG_SCROLL_KEY, window.scrollY);
                // Normal link davranışı devam eder (href ile navigate)
            } else {
                // Zaten aktif dil — sadece paneli kapat
                e.preventDefault();
                closePanel();
            }
        });

        panel.appendChild(item);
    });

    // Paneli floating-actions grubuna ekle (CSS position:absolute ile üste çıkar)
    container.appendChild(panel);

    // --- Panel aç/kapat ---
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

    function togglePanel() {
        if (panel.classList.contains('open')) {
            closePanel();
        } else {
            openPanel();
        }
    }

    floatBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        togglePanel();
    });

    backdrop.addEventListener('click', closePanel);

    // ESC ile kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closePanel();
    });
}

// ==============================================
// KATEGORİ SCROLL POZİSYON HAFIZASI
// Kategori listesinden ürünlere girip geri dönünce
// listenin kaldığı yere scroll edilir.
// ==============================================
function setupScrollPositionMemory() {
    const STORAGE_KEY = 'qrmenu_category_scroll';
    
    // --- index.php (kategori listesi) üzerindeyiz ---
    // URL'de 'index.php' veya path '/' içeriyorsa bu sayfayı tanı
    const isIndexPage = window.location.pathname.includes('index.php') ||
                        window.location.pathname.endsWith('/menu/') ||
                        window.location.pathname.endsWith('/menu');
    
    if (isIndexPage) {
        // Kaydedilmiş scroll pozisyonu varsa restore et
        const savedPos = sessionStorage.getItem(STORAGE_KEY);
        if (savedPos !== null) {
            // Küçük gecikme: resimler yüklenmeden scroll yapmayı önle
            requestAnimationFrame(function() {
                window.scrollTo({ top: parseInt(savedPos, 10), behavior: 'instant' });
            });
            sessionStorage.removeItem(STORAGE_KEY);
        }
        
        // Kategori kartlarına tıklandığında mevcut scroll pozisyonunu kaydet
        document.querySelectorAll('.category-card').forEach(function(card) {
            card.addEventListener('click', function() {
                sessionStorage.setItem(STORAGE_KEY, window.scrollY);
            });
        });
    }
}

// ==============================================
// UTILITY FONKSİYONLARI
// ==============================================

/**
 * Scroll'u yumuşak şekilde en üste götür
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/**
 * Element görünür mü kontrol et
 */
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Loading spinner göster
 */
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading-spinner';
    loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    document.body.appendChild(loader);
}

/**
 * Loading spinner gizle
 */
function hideLoading() {
    const loader = document.querySelector('.loading-spinner');
    if (loader) {
        loader.remove();
    }
}

// ==============================================
// PERFORMANCE MONITORING (Development)
// ==============================================
if (window.location.hostname === 'localhost') {
    // Sayfa yüklenme süresini ölç
    window.addEventListener('load', function() {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        console.log('Sayfa yüklenme süresi:', (pageLoadTime / 1000).toFixed(2), 'saniye');
    });
}

// ==============================================
// EXPORT (İleride kullanılabilir)
// ==============================================
window.QRMenu = {
    scrollToTop,
    isElementInViewport,
    showLoading,
    hideLoading
};

// ==============================================
// PANEL ÖNİZLEME — postMessage ALICISI (FAZA 12.5)
// Panel sayfası (design.php) bu sayfayı iframe içinde açar ve
// renk/radius/font/logoKonumu değişikliklerini postMessage ile gönderir.
// Burada dinleyerek DOM/CSS'i anında güncelleriz.
// ==============================================
if (window.self !== window.top) {
    window.addEventListener('message', function (e) {
        if (!e.data || e.data.type !== 'menuDesignUpdate') return;

        // 1. CSS değişkeni güncellemesi (renkler, border-radius …)
        if (e.data.var) {
            document.documentElement.style.setProperty(e.data.var, e.data.value);
            return;
        }

        // 2. Özel aksiyonlar
        switch (e.data.action) {

            // Yazı tipi (font)
            case 'font':
                document.body.style.fontFamily = e.data.value;
                break;

            // Logo konumu (left / center / right)
            case 'logoPosition': {
                var pos = e.data.value;
                var heroContent = document.querySelector('.branch-hero-content');
                var heroLogo    = document.querySelector('.branch-hero-logo, .branch-hero-icon');
                if (heroContent) {
                    heroContent.style.textAlign = pos === 'center' ? '' : pos;
                }
                if (heroLogo) {
                    if (pos === 'left') {
                        heroLogo.style.marginLeft  = '0';
                        heroLogo.style.marginRight = 'auto';
                    } else if (pos === 'right') {
                        heroLogo.style.marginLeft  = 'auto';
                        heroLogo.style.marginRight = '0';
                    } else {
                        /* center */
                        heroLogo.style.marginLeft  = '';
                        heroLogo.style.marginRight = '';
                    }
                }
                break;
            }
        }
    });
}

// === KAMPANYA SLIDER ===
(function() {
    var slider = document.getElementById('campaignSlider');
    if (!slider) return;
    var slides = slider.querySelectorAll('.campaign-slide');
    if (slides.length <= 1) return;

    var current = 0;
    var dots = document.querySelectorAll('.campaign-slider-dot');

    function goTo(idx) {
        if (idx < 0) idx = slides.length - 1;
        if (idx >= slides.length) idx = 0;
        current = idx;
        slider.scrollTo({ left: slides[idx].offsetLeft - slider.offsetLeft, behavior: 'smooth' });
        dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
    }

    // Prev / Next butonları
    var btnPrev = document.getElementById('sliderPrev');
    var btnNext = document.getElementById('sliderNext');
    if (btnPrev) btnPrev.addEventListener('click', function() { clearInterval(auto); goTo(current - 1); });
    if (btnNext) btnNext.addEventListener('click', function() { clearInterval(auto); goTo(current + 1); });

    // Dot tıklama
    dots.forEach(function(d, i) {
        d.addEventListener('click', function() { clearInterval(auto); goTo(i); });
    });

    // Otomatik geçiş
    var auto = setInterval(function() { goTo(current + 1); }, 4500);
    slider.addEventListener('touchstart', function() { clearInterval(auto); }, { passive: true });

    // Scroll ile dot güncelle
    var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (e.isIntersecting) {
                var idx = Array.from(slides).indexOf(e.target);
                current = idx;
                dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
            }
        });
    }, { root: slider, threshold: 0.6 });
    slides.forEach(function(s) { io.observe(s); });
})();

// === KAMPANYA POPUP ===
(function() {
    var overlay = document.getElementById('campaignPopupOverlay');
    if (!overlay) return;

    // Daha önce gösterilmiş mi kontrol et (session bazlı)
    var key = 'camp_popup_' + window.location.pathname;
    if (sessionStorage.getItem(key)) return;

    // 800ms sonra göster
    setTimeout(function() {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 800);

    function closePopup() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        sessionStorage.setItem(key, '1');
    }

    var btnClose = document.getElementById('campaignPopupClose');
    if (btnClose) btnClose.addEventListener('click', function(e) { e.preventDefault(); closePopup(); });
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closePopup(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closePopup(); });
})();
