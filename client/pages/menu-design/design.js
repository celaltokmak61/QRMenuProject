/**
 * client/pages/menu-design/design.js
 * FAZA 12.5 — Menü Tasarımı: Renk seçici senkronizasyonu, canlı önizleme, AJAX kayıt
 */
(function () {
    'use strict';

    const cfg    = window.menuDesign || {};
    const ACTION = cfg.actionUrl || '/client/pages/menu-design/actions.php';
    const i18n   = cfg.i18n    || {};
    const DEFS   = cfg.defaults || {};

    /* ── Renk çiftleri: [color-input, hex-input] ─────────────────── */
    const colorPairs = [
        { picker: document.getElementById('primaryColor'),    hex: document.getElementById('primaryColorHex'),    cssVar: '--primary-color'    },
        { picker: document.getElementById('secondaryColor'),  hex: document.getElementById('secondaryColorHex'),  cssVar: '--secondary-color'  },
        { picker: document.getElementById('bgColor'),         hex: document.getElementById('bgColorHex'),         cssVar: '--bg-color'         },
        { picker: document.getElementById('textColor'),       hex: document.getElementById('textColorHex'),       cssVar: '--text-color'       },
    ];

    /* ── Diğer elemanlar ─────────────────────────────────────────── */
    const fontSelect   = document.getElementById('fontFamily');
    const fontPreview  = document.getElementById('fontPreviewText');
    const btnSave      = document.getElementById('btnSave');
    const btnReset     = document.getElementById('btnReset');
    const alertBox     = document.getElementById('alertBox');
    const previewFrame = document.getElementById('previewFrame');

    /* ── Hex doğrulama regex ─────────────────────────────────────── */
    const hexRe = /^#[0-9A-Fa-f]{6}$/;

    /* ── Önizleme iframe'ine CSS değişkeni gönder ────────────────── */
    function updatePreviewVar(cssVar, value) {
        if (!previewFrame) return;
        try {
            previewFrame.contentWindow.postMessage(
                { type: 'menuDesignUpdate', var: cssVar, value: value },
                '*'
            );
        } catch (_) { /* cross-origin — yeniden yükle */ }
    }

    /* ── Önizleme iframe'ine özel aksiyon gönder (font, logoPos …) ── */
    function updatePreviewAction(action, value) {
        if (!previewFrame) return;
        try {
            previewFrame.contentWindow.postMessage(
                { type: 'menuDesignUpdate', action: action, value: value },
                '*'
            );
        } catch (_) {}
    }

    function reloadPreview() {
        if (!previewFrame) return;
        const src = previewFrame.src;
        previewFrame.src = '';
        previewFrame.src = src;
    }

    /* ── Renk çifti senkronizasyonu ──────────────────────────────── */
    colorPairs.forEach(function (pair) {
        if (!pair.picker || !pair.hex) return;

        /* Renk kutusu → hex input */
        pair.picker.addEventListener('input', function () {
            pair.hex.value = pair.picker.value.toUpperCase();
            pair.hex.classList.remove('is-invalid');
            updatePreviewVar(pair.cssVar, pair.picker.value);
        });

        /* Hex input → renk kutusu */
        pair.hex.addEventListener('input', function () {
            const v = pair.hex.value.trim();
            if (hexRe.test(v)) {
                pair.picker.value = v;
                pair.hex.classList.remove('is-invalid');
                updatePreviewVar(pair.cssVar, v);
            } else {
                pair.hex.classList.add('is-invalid');
            }
        });

        /* Odak çıkışında büyük harf ve # prefix garantisi */
        pair.hex.addEventListener('blur', function () {
            let v = pair.hex.value.trim();
            if (v && !v.startsWith('#')) v = '#' + v;
            v = v.toUpperCase();
            pair.hex.value = v;
            if (hexRe.test(v)) {
                pair.picker.value = v;
                pair.hex.classList.remove('is-invalid');
            } else {
                pair.hex.classList.add('is-invalid');
            }
        });
    });

    /* ── Font seçici ─────────────────────────────────────────────── */
    if (fontSelect && fontPreview) {
        fontSelect.addEventListener('change', function () {
            fontPreview.style.fontFamily = fontSelect.value;
            updatePreviewAction('font', fontSelect.value);
        });
        /* İlk yükleme */
        fontPreview.style.fontFamily = fontSelect.value;
    }

    /* ── Kenar yuvarlama (border_radius) slider ──────────────────── */
    const borderRadiusSlider = document.getElementById('borderRadius');
    const borderRadiusVal    = document.getElementById('borderRadiusVal');
    const radiusPreviewBtn   = document.getElementById('radiusPreviewBtn');
    const radiusPreviewCard  = document.getElementById('radiusPreviewCard');

    function applyBorderRadius(val) {
        const px = val + 'px';
        if (borderRadiusVal)  borderRadiusVal.textContent = px;
        if (radiusPreviewBtn)  radiusPreviewBtn.style.borderRadius = px;
        if (radiusPreviewCard) radiusPreviewCard.style.borderRadius = px;
        updatePreviewVar('--menu-border-radius', px);
    }

    if (borderRadiusSlider) {
        applyBorderRadius(borderRadiusSlider.value);
        borderRadiusSlider.addEventListener('input', function () {
            applyBorderRadius(this.value);
        });
    }

    /* ── Logo yuvarlama (logo_radius) slider ──────────────────────── */
    const logoRadiusSlider  = document.getElementById('logoRadius');
    const logoRadiusVal     = document.getElementById('logoRadiusVal');
    const logoRadiusPreview = document.getElementById('logoRadiusPreview');

    function applyLogoRadius(val) {
        const px = val + 'px';
        if (logoRadiusVal)     logoRadiusVal.textContent = px;
        if (logoRadiusPreview) logoRadiusPreview.style.borderRadius = px;
        updatePreviewVar('--menu-logo-radius', px);
    }

    if (logoRadiusSlider) {
        applyLogoRadius(logoRadiusSlider.value);
        logoRadiusSlider.addEventListener('input', function () {
            applyLogoRadius(this.value);
        });
    }

    /* ── Logo konumu seçimi ──────────────────────────────────────── */
    document.querySelectorAll('.logo-pos-option').forEach(function (label) {
        label.addEventListener('click', function () {
            document.querySelectorAll('.logo-pos-option').forEach(function (l) {
                l.classList.remove('active');
            });
            label.classList.add('active');
            const radio = label.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                updatePreviewAction('logoPosition', radio.value);
            }
        });
    });

    /* ── Alert göster ────────────────────────────────────────────── */
    function showAlert(type, msg) {
        alertBox.className = 'alert alert-' + type + ' mb-4';
        alertBox.textContent = msg;
        alertBox.classList.remove('d-none');
        clearTimeout(alertBox._timer);
        alertBox._timer = setTimeout(function () {
            alertBox.classList.add('d-none');
        }, 5000);
    }

    /* ── Mevcut değerleri topla ──────────────────────────────────── */
    function collectValues() {
        const data = {};

        colorPairs.forEach(function (pair) {
            if (!pair.picker) return;
            const fieldName = pair.picker.getAttribute('name');
            if (!fieldName) return;
            const v = pair.hex ? pair.hex.value.trim() : pair.picker.value;
            data[fieldName] = hexRe.test(v) ? v : pair.picker.value;
        });

        if (fontSelect) data['font_family'] = fontSelect.value;

        if (borderRadiusSlider) data['border_radius'] = borderRadiusSlider.value;
        if (logoRadiusSlider)   data['logo_radius']   = logoRadiusSlider.value;

        const lpChecked = document.querySelector('input[name="logo_position"]:checked');
        if (lpChecked) data['logo_position'] = lpChecked.value;

        return data;
    }

    /* ── Kaydet ──────────────────────────────────────────────────── */
    if (btnSave) {
        btnSave.addEventListener('click', function () {
            /* Geçersiz hex var mı? */
            let hasInvalid = false;
            document.querySelectorAll('.color-hex.is-invalid').forEach(function () {
                hasInvalid = true;
            });
            if (hasInvalid) {
                showAlert('danger', i18n.saveError || 'Lütfen geçerli renk değerleri girin.');
                return;
            }

            const data = collectValues();
            data.action = 'saveSettings';

            /* Buton loading durumu */
            btnSave.disabled = true;
            btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>' +
                                (i18n.saving || 'Kaydediliyor...');

            fetch(ACTION, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(data).toString(),
            })
            .then(function (res) { return res.json(); })
            .then(function (json) {
                if (json.success) {
                    showAlert('success', i18n.saved || 'Ayarlar kaydedildi.');
                    reloadPreview();
                } else {
                    showAlert('danger', json.message || (i18n.saveError || 'Kayıt sırasında hata oluştu.'));
                }
            })
            .catch(function () {
                showAlert('danger', i18n.saveError || 'Sunucu hatası.');
            })
            .finally(function () {
                btnSave.disabled = false;
                btnSave.innerHTML = '<i class="fas fa-save me-1"></i>' +
                                    (window.menuDesign._saveLabel || 'Kaydet');
            });
        });

        /* Orijinal etiket sakla */
        window.menuDesign._saveLabel = btnSave.textContent.trim();
    }

    /* ── Sıfırla ─────────────────────────────────────────────────── */
    if (btnReset) {
        btnReset.addEventListener('click', function () {
            if (!confirm(i18n.resetConfirm || 'Varsayılan ayarlara sıfırlanacak. Emin misiniz?')) return;

            /* Renkleri sıfırla */
            const defMap = {
                primary_color:    DEFS.primary_color    || '#007bff',
                secondary_color:  DEFS.secondary_color  || '#6c757d',
                text_color:       DEFS.text_color       || '#212529',
                background_color: DEFS.background_color || '#ffffff',
            };

            colorPairs.forEach(function (pair) {
                if (!pair.picker) return;
                const name = pair.picker.getAttribute('name');
                const defVal = defMap[name];
                if (!defVal) return;
                pair.picker.value = defVal;
                if (pair.hex) pair.hex.value = defVal.toUpperCase();
                pair.hex && pair.hex.classList.remove('is-invalid');
                updatePreviewVar(pair.cssVar, defVal);
            });

            /* Font sıfırla */
            if (fontSelect) {
                fontSelect.value = DEFS.font_family || 'Arial, sans-serif';
                if (fontPreview) fontPreview.style.fontFamily = fontSelect.value;
                updatePreviewAction('font', fontSelect.value);
            }

            /* Kenar yuvarlama sıfırla */
            const defBr = DEFS.border_radius !== undefined ? DEFS.border_radius : 8;
            if (borderRadiusSlider) {
                borderRadiusSlider.value = defBr;
                applyBorderRadius(defBr);
            }

            /* Logo yuvarlama sıfırla */
            const defLr = DEFS.logo_radius !== undefined ? DEFS.logo_radius : 50;
            if (logoRadiusSlider) {
                logoRadiusSlider.value = defLr;
                applyLogoRadius(defLr);
            }

            /* Logo konumu sıfırla */
            const defLp = DEFS.logo_position || 'center';
            document.querySelectorAll('.logo-pos-option').forEach(function (lbl) {
                const active = lbl.dataset.value === defLp;
                lbl.classList.toggle('active', active);
                const r = lbl.querySelector('input[type="radio"]');
                if (r) r.checked = active;
            });
            updatePreviewAction('logoPosition', defLp);
        });
    }

    /* ── Önizleme iframe: postMessage alıcısı (menu sayfasında) ──── */
    /* Bu blok menu/ sayfalarında çalışır, panel sayfasında yoksayılır */
    if (window.self !== window.top) {
        window.addEventListener('message', function (e) {
            if (!e.data || e.data.type !== 'menuDesignUpdate') return;
            document.documentElement.style.setProperty(e.data.var, e.data.value);
        });
    }

})();