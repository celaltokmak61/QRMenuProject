/**
 * Dil Yönetimi - JavaScript
 * AJAX ile dil ekleme, silme, varsayılan değiştirme, istatistik yükleme
 */

document.addEventListener('DOMContentLoaded', function () {

    // ─── Modal örnekleri ───────────────────────────────────────────────────
    const addLangModal       = new bootstrap.Modal(document.getElementById('addLanguageModal'));
    const progressModal      = new bootstrap.Modal(document.getElementById('translateProgressModal'));

    // ─── Dil Ekleme Butonları ──────────────────────────────────────────────
    const addLangBtn      = document.getElementById('addLanguageBtn');
    const addFirstLangBtn = document.getElementById('addFirstLangBtn');

    if (addLangBtn)      addLangBtn.addEventListener('click', () => addLangModal.show());
    if (addFirstLangBtn) addFirstLangBtn.addEventListener('click', () => addLangModal.show());

    // ─── Hızlı Dil Seçim Butonları ────────────────────────────────────────
    document.querySelectorAll('.quick-lang-btn:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', function () {
            document.getElementById('langCode').value = this.dataset.code;
            document.getElementById('langName').value = this.dataset.name;
            document.getElementById('langFlag').value = this.dataset.flag;

            // Aktif sınıfını güncelle
            document.querySelectorAll('.quick-lang-btn').forEach(b => b.classList.remove('btn-primary'));
            this.classList.remove('btn-outline-secondary');
            this.classList.add('btn-primary');
        });
    });

    // ─── Dil Kaydet ───────────────────────────────────────────────────────
    document.getElementById('saveLangBtn').addEventListener('click', function () {
        const code = document.getElementById('langCode').value.trim();
        const name = document.getElementById('langName').value.trim();
        const flag = document.getElementById('langFlag').value.trim();

        if (!code || !name) {
            showResult('addLangResult', 'danger', 'Dil kodu ve adı zorunludur!');
            return;
        }

        if (!/^[a-z]{2,5}$/.test(code)) {
            showResult('addLangResult', 'danger', 'Dil kodu 2-5 küçük harf olmalıdır (örn: en, de)');
            return;
        }

        const btn = this;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Ekleniyor...';

        fetch('actions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ action: 'addLanguage', code, name, flag })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showResult('addLangResult', 'success', data.message);
                setTimeout(() => location.reload(), 1000);
            } else {
                showResult('addLangResult', 'danger', data.message);
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-save me-2"></i>Dil Ekle';
            }
        })
        .catch(() => {
            showResult('addLangResult', 'danger', 'Sunucu ile bağlantı kurulamadı.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save me-2"></i>Dil Ekle';
        });
    });

    // ─── Aktif / Pasif Toggle ─────────────────────────────────────────────
    document.querySelectorAll('.status-toggle').forEach(toggle => {
        toggle.addEventListener('change', function () {
            const langId   = this.dataset.langId;
            const isActive = this.checked ? 1 : 0;
            const self     = this;

            fetch('actions.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ action: 'toggleActive', language_id: langId, is_active: isActive })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    // Kart görünümünü güncelle
                    const card = document.getElementById('lang-card-' + langId);
                    if (card) {
                        const langCard = card.querySelector('.language-card');
                        if (isActive) {
                            langCard.classList.remove('inactive');
                        } else {
                            langCard.classList.add('inactive');
                        }
                    }
                } else {
                    showToast(data.message, 'danger');
                    self.checked = !self.checked; // Geri al
                }
            })
            .catch(() => {
                showToast('Sunucu ile bağlantı kurulamadı.', 'danger');
                self.checked = !self.checked;
            });
        });
    });

    // ─── Varsayılan Dil Yap ───────────────────────────────────────────────
    document.querySelectorAll('.set-default-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const langId   = this.dataset.langId;
            const langName = this.dataset.langName;

            if (!confirm(`"${langName}" dilini varsayılan dil yapmak istediğinizden emin misiniz?`)) return;

            fetch('actions.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ action: 'setDefault', language_id: langId })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    setTimeout(() => location.reload(), 800);
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(() => showToast('Sunucu ile bağlantı kurulamadı.', 'danger'));
        });
    });

    // ─── Dil Sil ─────────────────────────────────────────────────────────
    document.querySelectorAll('.delete-lang-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const langId   = this.dataset.langId;
            const langName = this.dataset.langName;

            if (!confirm(`"${langName}" dilini ve TÜM çevirilerini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) return;

            fetch('actions.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ action: 'deleteLanguage', language_id: langId })
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    showToast(data.message, 'success');
                    // Kartı sayfadan kaldır
                    const card = document.getElementById('lang-card-' + langId);
                    if (card) {
                        card.style.transition = 'opacity 0.3s ease';
                        card.style.opacity = '0';
                        setTimeout(() => card.remove(), 300);
                    }
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(() => showToast('Sunucu ile bağlantı kurulamadı.', 'danger'));
        });
    });

    // ─── Otomatik Çeviri ──────────────────────────────────────────────────
    document.querySelectorAll('.auto-translate-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const langId   = this.dataset.langId;
            const langCode = this.dataset.langCode;
            const langName = this.dataset.langName;

            if (!confirm(`"${langName}" dili için Azure Translator ile otomatik çeviri başlatılsın mı?\n\nMevcut otomatik çeviriler güncellenecek, manuel çeviriler korunacak.`)) return;

            // Progress modal göster
            document.getElementById('translateLangName').textContent = langName;
            document.getElementById('translateStatus').textContent   = 'Azure API isteği gönderiliyor...';
            progressModal.show();

            fetch('actions.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ action: 'autoTranslate', language_id: langId, target_code: langCode })
            })
            .then(r => r.json())
            .then(data => {
                progressModal.hide();
                if (data.success) {
                    showToast(data.message, 'success');
                    // İstatistikleri yenile
                    loadStats(langId);
                } else {
                    showToast(data.message, 'danger');
                }
            })
            .catch(() => {
                progressModal.hide();
                showToast('Sunucu ile bağlantı kurulamadı.', 'danger');
            });
        });
    });

    // ─── Sayfa yüklenince dil istatistiklerini çek ────────────────────────
    document.querySelectorAll('[id^="stats-"]').forEach(statsDiv => {
        const langId = statsDiv.id.replace('stats-', '');
        loadStats(langId);
    });

    /**
     * Belirli bir dil için istatistikleri yükler ve gösterir
     * @param {string} langId - Dil ID
     */
    function loadStats(langId) {
        const statsDiv = document.getElementById('stats-' + langId);
        if (!statsDiv) return;

        // BUG 19 Fix: PHP'den gelen çevirilerden al, yoksa fallback (TR)
        const ls = window.langStrings || {};
        const lblCompletion = ls.stat_completion || 'Çeviri Tamamlanma';
        const lblTranslated = ls.stat_translated || 'Çevrilen';
        const lblAuto       = ls.stat_auto       || 'Otomatik';
        const lblManual     = ls.stat_manual      || 'Manuel';
        const lblError      = ls.stat_error       || 'İstatistik yüklenemedi.';

        fetch(`actions.php?action=getStats&language_id=${langId}`)
        .then(r => r.json())
        .then(data => {
            if (!data.success) {
                statsDiv.innerHTML = `<small class="text-muted">${lblError}</small>`;
                return;
            }

            const pct = data.percentage;
            const barColor = pct >= 80 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-danger';

            statsDiv.innerHTML = `
                <div class="progress-label">
                    <span>${lblCompletion}</span>
                    <strong>${pct}%</strong>
                </div>
                <div class="translation-progress">
                    <div class="progress">
                        <div class="progress-bar ${barColor}" style="width: ${pct}%"></div>
                    </div>
                </div>
                <div class="stats-row mt-2">
                    <span class="stats-label"><i class="fas fa-key me-1"></i>${lblTranslated}</span>
                    <span class="stats-value">${data.translated_keys} / ${data.total_keys}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label"><i class="fas fa-robot me-1"></i>${lblAuto}</span>
                    <span class="stats-value text-info">${data.auto_count}</span>
                </div>
                <div class="stats-row">
                    <span class="stats-label"><i class="fas fa-pen me-1"></i>${lblManual}</span>
                    <span class="stats-value text-success">${data.manual_count}</span>
                </div>
            `;
        })
        .catch(() => {
            if (statsDiv) {
                statsDiv.innerHTML = `<small class="text-muted">${lblError}</small>`;
            }
        });
    }

    /**
     * Sonuç mesajı göster (modal içinde)
     * @param {string} elementId
     * @param {string} type - 'success' | 'danger' | 'warning'
     * @param {string} message
     */
    function showResult(elementId, type, message) {
        const el = document.getElementById(elementId);
        if (!el) return;
        el.style.display = 'block';
        el.className = `alert alert-${type}`;
        el.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'} me-2"></i>${message}`;
    }

    /**
     * Toast bildirim göster
     * @param {string} message
     * @param {string} type - 'success' | 'danger' | 'warning'
     */
    function showToast(message, type) {
        // Mevcut toast varsa kaldır
        const existing = document.getElementById('globalToast');
        if (existing) existing.remove();

        const iconMap = { success: 'check-circle', danger: 'exclamation-circle', warning: 'exclamation-triangle' };
        const toast   = document.createElement('div');
        toast.id      = 'globalToast';
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-size: 0.95rem;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease;
            background: ${type === 'success' ? 'linear-gradient(135deg,#28a745,#20c997)'
                       : type === 'danger'  ? 'linear-gradient(135deg,#dc3545,#c0392b)'
                       : 'linear-gradient(135deg,#ffc107,#fd7e14)'};
        `;
        toast.innerHTML = `<i class="fas fa-${iconMap[type] || 'info-circle'} me-2"></i>${message}`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

});