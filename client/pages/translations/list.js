/**
 * Çeviri Yönetimi - JavaScript
 * Pagination destekli, büyük veri (50+ kategori, 800+ ürün) için optimize edilmiş.
 * Sayfa başına 50 kayıt yükler, "Daha Fazla Yükle" butonu ile devam eder.
 */

// ── Global State ───────────────────────────────────────────────────────────
let allKeysMeta   = { total: 0, translated: 0, missing: 0, percentage: 0 };
let modifiedKeys  = {};       // { key: newValue } — kaydedilmemiş değişiklikler
let currentFilter = 'all';
let currentSearch = '';
let currentPage   = 1;
let totalPages    = 1;
let isLoading     = false;
let searchTimeout = null;
const PER_PAGE    = 50;       // Sayfa başına gösterilecek satır sayısı

// ── Sayfa Yüklenince ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    if (typeof LANG_ID !== 'undefined' && LANG_ID > 0) {
        loadTranslations(true);
    }
});

// ── Çevirileri Yükle ────────────────────────────────────────────────────────
/**
 * @param {boolean} reset  - true ise sayfa 1'den başlar ve listeyi temizler
 * @param {string}  search - Arama terimi
 * @param {string}  filter - all | translated | missing
 */
function loadTranslations(reset = false, search = currentSearch, filter = currentFilter) {
    if (isLoading) return;

    if (reset) {
        currentPage   = 1;
        currentSearch = search;
        currentFilter = filter;
        clearTranslationContainer();
    }

    isLoading = true;
    showLoadingIndicator(reset);

    const params = new URLSearchParams({
        action:      'getTranslationKeys',
        language_id: LANG_ID,
        filter:      currentFilter,
        search:      currentSearch,
        page:        currentPage,
        per_page:    PER_PAGE,
    });

    fetch(ACTIONS_URL + '?' + params.toString())
        .then(r => r.json())
        .then(data => {
            isLoading = false;
            hideLoadingIndicator();

            if (!data.success) {
                showContainerError(data.message);
                return;
            }

            // İstatistikleri güncelle (sadece reset veya ilk yüklemede)
            if (reset || currentPage === 1) {
                allKeysMeta = data.stats;
                updateStatsBar(data.stats);
                updateFilterCounts(data.stats);
            }

            const pagination = data.pagination || {};
            totalPages = pagination.total_pages || 1;

            // Satırları render et
            appendTranslationRows(data.keys || [], reset);

            // Sayfalama kontrolü
            renderPagination(pagination);
        })
        .catch(err => {
            isLoading = false;
            hideLoadingIndicator();
            showContainerError('Bağlantı hatası: ' + err.message);
        });
}

// ── Container Temizle ───────────────────────────────────────────────────────
function clearTranslationContainer() {
    const container = document.getElementById('translationsContainer');
    if (container) container.innerHTML = '';
    // Load More butonunu kaldır
    const loadMoreArea = document.getElementById('loadMoreArea');
    if (loadMoreArea) loadMoreArea.innerHTML = '';
}

// ── Loading Göster / Gizle ─────────────────────────────────────────────────
function showLoadingIndicator(isReset) {
    if (isReset) {
        const container = document.getElementById('translationsContainer');
        if (container) {
            container.innerHTML = `
                <div class="translation-loading">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="mt-2 text-muted mb-0">Çeviriler yükleniyor...</p>
                </div>`;
        }
    } else {
        const loadMoreArea = document.getElementById('loadMoreArea');
        if (loadMoreArea) {
            loadMoreArea.innerHTML = `
                <div class="text-center py-3">
                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <span class="ms-2 text-muted">Yükleniyor...</span>
                </div>`;
        }
    }
}

function hideLoadingIndicator() {
    // Loading içeriği appendTranslationRows ile üzerine yazılır veya temizlenir
}

// ── Grup Wrapper ID (benzersiz DOM id) ────────────────────────────────────
function groupWrapperId(groupName) {
    // Basit hash: grup adından güvenli DOM id üret
    let h = 0;
    for (let i = 0; i < groupName.length; i++) {
        h = ((h << 5) - h + groupName.charCodeAt(i)) | 0;
    }
    return 'grp' + Math.abs(h);
}

// ── Collapse Durumu (localStorage) ────────────────────────────────────────
function getCollapseState() {
    try { return JSON.parse(localStorage.getItem('tr_collapse_' + LANG_ID) || '{}'); }
    catch (e) { return {}; }
}
function saveCollapseState(state) {
    localStorage.setItem('tr_collapse_' + LANG_ID, JSON.stringify(state));
}

// ── Grup Aç / Kapa ─────────────────────────────────────────────────────────
function toggleGroup(groupName) {
    const wId     = groupWrapperId(groupName);
    const wrapper = document.getElementById(wId);
    if (!wrapper) return;

    const isNowCollapsed = wrapper.classList.toggle('collapsed');

    // Chevron animasyonu
    const chevron = wrapper.querySelector('.group-chevron');
    if (chevron) chevron.style.transform = isNowCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';

    // Durumu localStorage'a kaydet
    const state = getCollapseState();
    state[groupName] = isNowCollapsed;
    saveCollapseState(state);
}

// ── Tüm Grupları Kapat ─────────────────────────────────────────────────────
function collapseAllGroups() {
    const container = document.getElementById('translationsContainer');
    if (!container) return;
    container.querySelectorAll('.group-wrapper:not(.collapsed)').forEach(w => {
        toggleGroup(w.dataset.group);
    });
}

// ── Tüm Grupları Aç ────────────────────────────────────────────────────────
function expandAllGroups() {
    const container = document.getElementById('translationsContainer');
    if (!container) return;
    container.querySelectorAll('.group-wrapper.collapsed').forEach(w => {
        toggleGroup(w.dataset.group);
    });
}

// ── Grup Sayacını Güncelle ─────────────────────────────────────────────────
function updateGroupCounter(wrapper) {
    const countEl    = wrapper.querySelector(':scope > .group-header .group-item-count');
    if (!countEl) return;
    const total      = wrapper.querySelectorAll('.translation-row').length;
    const translated = wrapper.querySelectorAll('.translation-row.is-saved').length;
    countEl.textContent = translated + ' / ' + total;
    countEl.className = 'group-item-count ' +
        (translated >= total && total > 0 ? 'count-done' : 'count-partial');
}

// ── Alt-Öğe (Ürün/Kategori) Wrapper ID ────────────────────────────────────
function itemWrapperId(groupName, itemName) {
    const combined = groupName + '::' + itemName;
    let h = 0;
    for (let i = 0; i < combined.length; i++) {
        h = ((h << 5) - h + combined.charCodeAt(i)) | 0;
    }
    return 'itm' + Math.abs(h);
}

// ── Alt-Öğe Collapse Durumu (localStorage) ────────────────────────────────
function getItemCollapseState() {
    try { return JSON.parse(localStorage.getItem('tr_item_collapse_' + LANG_ID) || '{}'); }
    catch (e) { return {}; }
}
function saveItemCollapseState(state) {
    localStorage.setItem('tr_item_collapse_' + LANG_ID, JSON.stringify(state));
}

// ── Alt-Öğeyi Aç / Kapa ────────────────────────────────────────────────────
function toggleItem(groupName, itemName) {
    const wId     = itemWrapperId(groupName, itemName);
    const wrapper = document.getElementById(wId);
    if (!wrapper) return;

    const isNowCollapsed = wrapper.classList.toggle('collapsed');

    const chevron = wrapper.querySelector('.item-chevron');
    if (chevron) chevron.style.transform = isNowCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';

    const state = getItemCollapseState();
    state[groupName + '::' + itemName] = isNowCollapsed;
    saveItemCollapseState(state);
}

// ── Alt-Öğe Sayacını Güncelle ──────────────────────────────────────────────
function updateItemCounter(itemWrapper) {
    const countEl    = itemWrapper.querySelector(':scope > .item-header .item-count');
    if (!countEl) return;
    const total      = itemWrapper.querySelectorAll('.translation-row').length;
    const translated = itemWrapper.querySelectorAll('.translation-row.is-saved').length;
    countEl.textContent = translated + ' / ' + total;
    countEl.className = 'item-count ' +
        (translated >= total && total > 0 ? 'item-count-done' : 'item-count-partial');
}

// ── Key'den Öğe Adını Çıkar ────────────────────────────────────────────────
// Kategori key'leri için özel prefix "__cat__" kullanılır — item-header'da
// "Kategori Bilgileri" olarak gösterilir.
function getItemName(k) {
    if (k.source === 'category') {
        // Kategori kendi çevirileri → özel marker
        return '__cat__';
    } else {
        // "Tatlılar › Cheesecake (Açıklama)" → "Cheesecake"
        const parts = k.label.split(' › ');
        const last  = parts[parts.length - 1] || k.label;
        return last.replace(/\s*\([^)]*\)\s*$/, '').trim();
    }
}

// ── Grup İçindeki Key'leri Öğeye Göre Grupla ─────────────────────────────
function groupKeysByItem(groupKeys) {
    const items = {};
    for (const k of groupKeys) {
        const name = getItemName(k);
        if (!items[name]) items[name] = [];
        items[name].push(k);
    }
    return items;
}

// ── Satırları Render Et / Ekle ─────────────────────────────────────────────
function appendTranslationRows(keys, isReset) {
    const container = document.getElementById('translationsContainer');
    if (!container) return;

    if (isReset) {
        container.innerHTML = '';
    }

    if (keys.length === 0 && isReset) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Sonuç bulunamadı</h5>
                <p class="text-muted small">Farklı bir arama veya filtre deneyin.</p>
            </div>`;
        return;
    }

    const groups        = groupKeysBySource(keys);
    const collapseState = getCollapseState();
    const itemColState  = getItemCollapseState();

    for (const [groupName, groupKeys] of Object.entries(groups)) {
        const wId    = groupWrapperId(groupName);
        let wrapper  = document.getElementById(wId);

        if (!wrapper) {
            // Artık tüm gruplar kategori adıyla adlandırılır
            const displayName = groupName;
            const iconFa      = 'fa-layer-group';
            const iconClass   = 'category-icon';
            const isCollapsed = collapseState[groupName] === true;

            wrapper               = document.createElement('div');
            wrapper.className     = 'group-wrapper' + (isCollapsed ? ' collapsed' : '');
            wrapper.id            = wId;
            wrapper.dataset.group = groupName;

            wrapper.innerHTML = `
                <div class="group-header" onclick="toggleGroup('${escAttr(groupName)}')">
                    <div class="group-header-icon ${iconClass}">
                        <i class="fas ${iconFa}"></i>
                    </div>
                    <span class="group-header-title">${escHtml(displayName)}</span>
                    <span class="group-item-count count-partial">0 / 0</span>
                    <i class="fas fa-chevron-down group-chevron"
                       style="transform:${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}"></i>
                </div>
                <div class="group-body"></div>`;
            container.appendChild(wrapper);
        }

        // ── 2. Seviye: Öğe Alt-Grupları ──
        // Kategori key'leri → "__cat__" adlı öğe (Kategori Bilgileri)
        // Ürün key'leri    → ürün adıyla öğe
        const body       = wrapper.querySelector('.group-body');
        const itemGroups = groupKeysByItem(groupKeys);

        // Kategori öğesini sıralamanın başına taşı
        const sortedItems = Object.entries(itemGroups).sort(([a], [b]) => {
            if (a === '__cat__') return -1;
            if (b === '__cat__') return  1;
            return a.localeCompare(b, 'tr');
        });

        for (const [itemName, itemKeys] of sortedItems) {
            const iWId    = itemWrapperId(groupName, itemName);
            let iWrapper  = document.getElementById(iWId);

            if (!iWrapper) {
                const isCatItem   = itemName === '__cat__';
                const iconFa      = isCatItem ? 'fa-tag' : 'fa-circle-dot';
                const iconClass   = isCatItem ? 'item-icon-cat' : 'item-icon-prod';
                const displayName = isCatItem ? 'Kategori Bilgileri' : itemName;
                const colKey      = groupName + '::' + itemName;
                const isCollapsed = itemColState[colKey] === true;
                const fieldCount  = itemKeys.length;

                iWrapper               = document.createElement('div');
                iWrapper.className     = 'item-wrapper' + (isCollapsed ? ' collapsed' : '') +
                                         (isCatItem ? ' item-wrapper-cat' : '');
                iWrapper.id            = iWId;
                iWrapper.dataset.group = groupName;
                iWrapper.dataset.item  = itemName;

                iWrapper.innerHTML = `
                    <div class="item-header" onclick="toggleItem('${escAttr(groupName)}','${escAttr(itemName)}')">
                        <i class="fas ${iconFa} item-icon ${iconClass}"></i>
                        <span class="item-title">${escHtml(displayName)}</span>
                        <span class="item-field-hint">${fieldCount} alan</span>
                        <span class="item-count item-count-partial">0 / 0</span>
                        <i class="fas fa-chevron-down item-chevron"
                           style="transform:${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}"></i>
                    </div>
                    <div class="item-body"></div>`;
                body.appendChild(iWrapper);
            }

            const iBody = iWrapper.querySelector('.item-body');
            for (const k of itemKeys) {
                const tmp = document.createElement('div');
                tmp.innerHTML = buildTranslationRow(k);
                iBody.appendChild(tmp.firstElementChild);
            }

            updateItemCounter(iWrapper);
        }

        updateGroupCounter(wrapper);
    }

    // Kaydedilmemiş değişiklikleri geri yükle
    for (const [key, val] of Object.entries(modifiedKeys)) {
        const input = container.querySelector(`[data-key="${CSS.escape(key)}"]`);
        if (input) {
            input.value = val;
            markRowModified(input.closest('.translation-row'));
        }
    }
}

// ── Sayfalama Kontrolü ─────────────────────────────────────────────────────
function renderPagination(pagination) {
    const loadMoreArea = document.getElementById('loadMoreArea');
    if (!loadMoreArea) return;

    const { page, total_pages, total, has_next } = pagination;

    if (!has_next) {
        // Tümü yüklendi
        if (total > PER_PAGE) {
            loadMoreArea.innerHTML = `
                <div class="all-loaded-msg">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    Tümü gösteriliyor — <strong>${total}</strong> kayıt
                </div>`;
        } else {
            loadMoreArea.innerHTML = '';
        }
        return;
    }

    const remaining = total - (page * PER_PAGE);
    const loadCount = Math.min(PER_PAGE, remaining);

    loadMoreArea.innerHTML = `
        <div class="text-center py-3">
            <button class="btn btn-outline-primary btn-load-more" onclick="loadNextPage()">
                <i class="fas fa-chevron-down me-2"></i>
                Daha Fazla Yükle
                <span class="badge bg-primary ms-2">${loadCount > 0 ? '+' + loadCount : ''}</span>
            </button>
            <p class="text-muted small mt-2 mb-0">
                ${page * PER_PAGE} / ${total} gösteriliyor
            </p>
        </div>`;
}

// ── Sonraki Sayfayı Yükle ──────────────────────────────────────────────────
function loadNextPage() {
    currentPage++;
    loadTranslations(false);
}

// ── Tek Çeviri Satırı HTML ─────────────────────────────────────────────────
function buildTranslationRow(k) {
    const statusIcon = k.translated
        ? (k.is_auto
            ? `<div class="status-icon auto" title="Otomatik çevrildi"><i class="fas fa-magic"></i></div>`
            : `<div class="status-icon translated" title="Çevrildi"><i class="fas fa-check"></i></div>`)
        : `<div class="status-icon missing" title="Çeviri eksik"><i class="fas fa-exclamation"></i></div>`;

    const fieldLabels = { name: 'Ad', description: 'Açıklama', ingredients: 'Malzemeler' };
    const fieldLabel  = fieldLabels[k.field] || k.field;
    const fieldColors = { name: 'field-name', description: 'field-desc', ingredients: 'field-ingr' };
    const fieldColor  = fieldColors[k.field] || '';

    const inputClass = [
        'translation-input',
        k.value ? 'has-value' : '',
        k.is_auto ? 'auto-translated' : '',
    ].filter(Boolean).join(' ');

    const rowClass = k.translated ? 'is-saved' : 'is-missing';

    // Kullanıcıya gösterilen metin: key değeri (= kaynak metin / Türkçe içerik)
    // Uzun metinler 60 karaktere kısaltılır; tooltip'te tam yol bağlamı gösterilir.
    const rawDisplay   = k.key;
    const displayLabel = rawDisplay.length > 60 ? rawDisplay.substring(0, 57) + '…' : rawDisplay;

    return `
    <div class="translation-row ${rowClass}" id="row-${escAttr(k.key)}">
        <div class="row-status">${statusIcon}</div>
        <div class="row-label">
            <span class="tr-display-label" title="${escAttr(k.label)}">${escHtml(displayLabel)}</span>
            <span class="tr-field-badge ${fieldColor}">${fieldLabel}</span>
        </div>
        <div class="row-middle">
            <input
                type="text"
                class="${inputClass}"
                data-key="${escAttr(k.key)}"
                data-original="${escAttr(k.value)}"
                value="${escAttr(k.value)}"
                placeholder="${escAttr(LANG_NAME)} çevirisi girin..."
                oninput="onInputChange(this)"
                onkeydown="onInputKeydown(event, this)"
            >
        </div>
        <div class="row-right">
            <button class="btn-action btn-save-single" title="Kaydet" onclick="saveSingleTranslation(this)">
                <i class="fas fa-save"></i>
            </button>
            ${k.translated ? `
            <button class="btn-action btn-delete-single" title="Çeviriyi sil"
                    onclick="deleteTranslation('${escAttr(k.key)}', this)">
                <i class="fas fa-times"></i>
            </button>` : ''}
        </div>
    </div>`;
}

// ── Grup Oluştur ────────────────────────────────────────────────────────────
// Hem kategori hem ürün key'leri, ait oldukları kategori adına göre gruplanır.
// Böylece "Tatlılar" grubu hem Tatlılar kategorisi çevirilerini hem ürünlerini içerir.
function groupKeysBySource(keys) {
    const groups = {};
    for (const k of keys) {
        let groupName;
        if (k.source === 'category') {
            // "Tatlılar" veya "Tatlılar (Açıklama)" → "Tatlılar"
            groupName = k.label.replace(/\s*\([^)]*\)\s*$/, '').trim();
        } else {
            // "Tatlılar › Cheesecake" → "Tatlılar"
            const parts = k.label.split(' › ');
            groupName   = parts[0] || 'Ürünler';
        }
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(k);
    }
    return groups;
}

// ── İstatistik Barını Güncelle ──────────────────────────────────────────────
function updateStatsBar(stats) {
    if (!stats) return;
    const pct  = stats.percentage || 0;
    const bar  = document.getElementById('progressBar');
    const text = document.getElementById('progressText');
    if (bar) {
        bar.style.width  = pct + '%';
        bar.className    = 'progress-bar ' +
            (pct >= 90 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-danger');
    }
    if (text) {
        text.textContent = `${stats.translated} / ${stats.total} (${pct}%)`;
    }
}

function updateFilterCounts(stats) {
    const el = (id) => document.getElementById(id);
    if (el('countAll'))        el('countAll').textContent        = stats.total        || 0;
    if (el('countTranslated')) el('countTranslated').textContent = stats.translated   || 0;
    if (el('countMissing'))    el('countMissing').textContent    = stats.missing      || 0;
}

function loadStats() {
    const params = new URLSearchParams({
        action:      'getTranslationKeys',
        language_id: LANG_ID,
        filter:      'all',
        search:      '',
        page:        1,
        per_page:    1, // sadece stats için, keys boş olsun
    });
    fetch(ACTIONS_URL + '?' + params.toString())
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                updateStatsBar(data.stats);
                updateFilterCounts(data.stats);
            }
        });
}

// ── Input Değişikliğinde ────────────────────────────────────────────────────
function onInputChange(input) {
    const key      = input.dataset.key;
    const original = input.dataset.original;
    const current  = input.value.trim();
    const row      = input.closest('.translation-row');

    if (current !== original) {
        modifiedKeys[key] = current;
        markRowModified(row);
    } else {
        delete modifiedKeys[key];
        unmarkRowModified(row);
    }
    updateSaveAllButton();
}

function onInputKeydown(event, input) {
    if (event.key === 'Enter') {
        event.preventDefault();
        saveSingleTranslation(input.closest('.translation-row').querySelector('.btn-save-single'));
    }
}

function markRowModified(row) {
    row.classList.remove('is-saved', 'is-missing');
    row.classList.add('is-modified');
}

function unmarkRowModified(row) {
    const input    = row.querySelector('.translation-input');
    const hasValue = input && input.value.trim().length > 0;
    row.classList.remove('is-modified');
    row.classList.add(hasValue ? 'is-saved' : 'is-missing');
}

function updateSaveAllButton() {
    const btn   = document.getElementById('saveAllBtn');
    const count = document.getElementById('unsavedCount');
    const n     = Object.keys(modifiedKeys).length;
    if (btn) {
        btn.style.display = n > 0 ? 'inline-flex' : 'none';
        if (count) count.textContent = n;
    }
}

// ── Tek Çeviri Kaydet ──────────────────────────────────────────────────────
function saveSingleTranslation(btn) {
    const row   = btn.closest('.translation-row');
    const input = row.querySelector('.translation-input');
    if (!input) return;

    const key   = input.dataset.key;
    const value = input.value.trim();

    btn.disabled      = true;
    btn.innerHTML     = '<i class="fas fa-spinner fa-spin"></i>';

    const fd = new FormData();
    fd.append('action',            'saveTranslation');
    fd.append('language_id',       LANG_ID);
    fd.append('translation_key',   key);
    fd.append('translation_value', value);

    fetch(ACTIONS_URL, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            btn.disabled  = false;
            btn.innerHTML = '<i class="fas fa-save"></i>';

            if (data.success) {
                input.dataset.original = value;
                delete modifiedKeys[key];
                unmarkRowModified(row);
                updateSaveAllButton();
                showToast('Çeviri kaydedildi', 'success');

                // Sil butonu ekle (yoksa)
                if (value && !row.querySelector('.btn-delete-single')) {
                    const delBtn      = document.createElement('button');
                    delBtn.className  = 'btn-action btn-delete-single';
                    delBtn.title      = 'Çeviriyi sil';
                    delBtn.innerHTML  = '<i class="fas fa-times"></i>';
                    delBtn.onclick    = () => deleteTranslation(key, delBtn);
                    row.querySelector('.row-right').appendChild(delBtn);
                }

                // Durum ikonunu güncelle
                const statusIcon = row.querySelector('.status-icon');
                if (statusIcon) {
                    statusIcon.className = 'status-icon translated';
                    statusIcon.title     = 'Çevrildi';
                    statusIcon.innerHTML = '<i class="fas fa-check"></i>';
                }

                // Stats güncel tut
                if (allKeysMeta && !row.classList.contains('is-saved')) {
                    allKeysMeta.translated = (allKeysMeta.translated || 0) + 1;
                    allKeysMeta.missing    = Math.max(0, (allKeysMeta.missing || 1) - 1);
                    allKeysMeta.percentage = allKeysMeta.total > 0
                        ? Math.round((allKeysMeta.translated / allKeysMeta.total) * 100) : 0;
                    updateStatsBar(allKeysMeta);
                    updateFilterCounts(allKeysMeta);
                }

                // Öğe ve grup sayaç rozetlerini güncelle (Bug fix: kayıt sonrası rozet güncellenmiyordu)
                const iwSave = row.closest('.item-wrapper');
                if (iwSave) updateItemCounter(iwSave);
                const gwSave = row.closest('.group-wrapper');
                if (gwSave) updateGroupCounter(gwSave);
            } else {
                showToast(data.message || 'Kayıt başarısız', 'danger');
            }
        })
        .catch(() => {
            btn.disabled  = false;
            btn.innerHTML = '<i class="fas fa-save"></i>';
            showToast('Bağlantı hatası', 'danger');
        });
}

// ── Tümünü Kaydet ──────────────────────────────────────────────────────────
function saveAllChanges() {
    const entries = Object.entries(modifiedKeys);
    if (entries.length === 0) return;

    const btn = document.getElementById('saveAllBtn');
    btn.disabled  = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Kaydediliyor...';

    const fd = new FormData();
    fd.append('action',       'bulkSave');
    fd.append('language_id',  LANG_ID);
    fd.append('translations', JSON.stringify(entries.map(([key, value]) => ({ key, value }))));

    fetch(ACTIONS_URL, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            btn.disabled  = false;
            btn.innerHTML = '<i class="fas fa-save me-2"></i>Tümünü Kaydet <span class="badge bg-white text-primary ms-1" id="unsavedCount">0</span>';

            if (data.success) {
                for (const [key, value] of entries) {
                    const input = document.querySelector(`[data-key="${CSS.escape(key)}"]`);
                    if (input) {
                        input.dataset.original = value;
                        unmarkRowModified(input.closest('.translation-row'));
                    }
                }
                modifiedKeys = {};
                updateSaveAllButton();
                showToast(data.message, 'success');
                loadStats();
            } else {
                showToast(data.message || 'Kayıt başarısız', 'danger');
            }
        })
        .catch(() => {
            btn.disabled  = false;
            btn.innerHTML = '<i class="fas fa-save me-2"></i>Tümünü Kaydet';
            showToast('Bağlantı hatası', 'danger');
        });
}

// ── Çeviri Sil ─────────────────────────────────────────────────────────────
function deleteTranslation(key, btn) {
    if (!confirm(`"${key}" çevirisini silmek istediğinizden emin misiniz?`)) return;

    const row   = btn.closest('.translation-row');
    const input = row.querySelector('.translation-input');

    const fd = new FormData();
    fd.append('action',           'deleteTranslation');
    fd.append('language_id',      LANG_ID);
    fd.append('translation_key',  key);

    fetch(ACTIONS_URL, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                if (input) {
                    input.value = '';
                    input.dataset.original = '';
                    input.classList.remove('has-value', 'auto-translated');
                }
                btn.remove();
                const statusIcon = row.querySelector('.status-icon');
                if (statusIcon) {
                    statusIcon.className = 'status-icon missing';
                    statusIcon.title     = 'Çeviri eksik';
                    statusIcon.innerHTML = '<i class="fas fa-exclamation"></i>';
                }
                row.classList.remove('is-saved', 'is-modified');
                row.classList.add('is-missing');

                // Öğe ve grup sayaç rozetlerini güncelle (Bug fix: silme sonrası rozet güncellenmiyordu)
                const iwDel = row.closest('.item-wrapper');
                if (iwDel) updateItemCounter(iwDel);
                const gwDel = row.closest('.group-wrapper');
                if (gwDel) updateGroupCounter(gwDel);

                // Global istatistikleri yerel olarak güncelle (loadStats API çağrısı öncesi anlık güncelleme)
                if (allKeysMeta) {
                    allKeysMeta.missing    = (allKeysMeta.missing    || 0) + 1;
                    allKeysMeta.translated = Math.max(0, (allKeysMeta.translated || 1) - 1);
                    allKeysMeta.percentage = allKeysMeta.total > 0
                        ? Math.round((allKeysMeta.translated / allKeysMeta.total) * 100) : 0;
                    updateStatsBar(allKeysMeta);
                    updateFilterCounts(allKeysMeta);
                }

                delete modifiedKeys[key];
                updateSaveAllButton();
                showToast('Çeviri silindi', 'success');
                loadStats(); // Arka planda API'den doğrulama
            } else {
                showToast(data.message || 'Silinemedi', 'danger');
            }
        })
        .catch(() => showToast('Bağlantı hatası', 'danger'));
}

// ── Otomatik Çeviri (Azure) ────────────────────────────────────────────────
function autoTranslateAll() {
    if (!confirm(`Azure Translator API ile "${LANG_NAME}" diline otomatik çeviri yapılacak.\n\nDevam etmek istiyor musunuz?`)) return;

    const modal = new bootstrap.Modal(document.getElementById('autoTranslateModal'));
    modal.show();

    const fd = new FormData();
    fd.append('action',       'autoTranslate');
    fd.append('language_id',  LANG_ID);
    fd.append('target_code',  LANG_CODE);

    fetch(ACTIONS_URL, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            modal.hide();
            if (data.success) {
                showToast(data.message, 'success');
                modifiedKeys = {};
                loadTranslations(true);
            } else {
                showToast(data.message || 'Otomatik çeviri başarısız', 'danger');
            }
        })
        .catch(err => {
            modal.hide();
            showToast('Bağlantı hatası: ' + err.message, 'danger');
        });
}

// ── Filtre ─────────────────────────────────────────────────────────────────
function setFilter(filter) {
    currentFilter = filter;
    ['filterAll', 'filterTranslated', 'filterMissing'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    const map = { all: 'filterAll', translated: 'filterTranslated', missing: 'filterMissing' };
    const activeEl = document.getElementById(map[filter]);
    if (activeEl) activeEl.classList.add('active');
    loadTranslations(true, currentSearch, filter);
}

// ── Arama ──────────────────────────────────────────────────────────────────
function debounceSearch(value) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        loadTranslations(true, value, currentFilter);
    }, 400);
}

function clearSearch() {
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = '';
        loadTranslations(true, '', currentFilter);
    }
}

// ── Hata Göster ────────────────────────────────────────────────────────────
function showContainerError(msg) {
    const container = document.getElementById('translationsContainer');
    if (container) {
        container.innerHTML = `
            <div class="alert alert-danger m-3">
                <i class="fas fa-exclamation-circle me-2"></i>${escHtml(msg)}
            </div>`;
    }
}

// ── Toast Bildirimi ────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    const toast     = document.getElementById('mainToast');
    const toastBody = document.getElementById('toastBody');
    if (!toast || !toastBody) return;

    const icons = {
        success: '<i class="fas fa-check-circle me-2"></i>',
        danger:  '<i class="fas fa-times-circle me-2"></i>',
        warning: '<i class="fas fa-exclamation-triangle me-2"></i>',
    };

    toastBody.innerHTML  = (icons[type] || '') + escHtml(message);
    toast.className      = `toast align-items-center text-bg-${type} border-0`;

    const bsToast = bootstrap.Toast.getOrCreateInstance(toast, { delay: 3000 });
    bsToast.show();
}

// ── HTML Escape ────────────────────────────────────────────────────────────
function escHtml(str) {
    const el = document.createElement('span');
    el.textContent = String(str ?? '');
    return el.innerHTML;
}

function escAttr(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}