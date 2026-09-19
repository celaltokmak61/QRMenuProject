/**
 * admin/pages/ui-translations/list.js
 * Merkezi Çeviri Yönetim Sayfası — JavaScript
 * FAZA 13 — 3 scope: client | admin | landing
 * BUG 21 Fix: Landing sekme çoklu dil desteği
 */

'use strict';

const ACTIONS_URL = (window.ADMIN_URL || '/LokmaQR/admin') + '/pages/ui-translations/actions.php';

/* ─────────────────────────────────────────────────────────────────────────
   GLOBAL STATE — scope başına ayrı state
───────────────────────────────────────────────────────────────────────── */
const state = {
    client: { langId: null, langCode: null, langName: null, page: 1, totalPages: 1, searchTimer: null, pending: new Map() },
    admin:  { langId: null, langCode: null, langName: null, page: 1, totalPages: 1, searchTimer: null, pending: new Map() },
};

let currentScope             = 'client';   // aktif sekme
let currentModalScope        = 'client';   // dil ekleme modalı için
let currentLandingSection    = 'all';      // landing bölüm seçici
let currentLandingLangCode   = null;       // BUG 21: seçili landing dili
let currentLandingLangName   = null;       // BUG 21: seçili landing dil adı
let landingPending           = new Map();  // landing kaydetmemiş değişiklikler

/* ─────────────────────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    loadLanguages('client');
    loadLanguages('admin');
    loadLandingLanguages(); // BUG 21: dil listesini yükle, içerik dil seçilince yüklenir
});

/* ─────────────────────────────────────────────────────────────────────────
   SCOPE DEĞİŞİMİ
───────────────────────────────────────────────────────────────────────── */
function onScopeChange(scope) {
    currentScope = scope;
}

function reloadCurrentScope() {
    if (currentScope === 'landing') {
        if (currentLandingLangCode) {
            loadLandingItems(currentLandingSection);
        } else {
            loadLandingLanguages();
        }
    } else {
        loadLanguages(currentScope);
        if (state[currentScope].langId) {
            loadTranslations(currentScope, 1);
        }
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   DİL LİSTESİ (client / admin)
───────────────────────────────────────────────────────────────────────── */
async function loadLanguages(scope) {
    setLangLoading(scope, true);

    const res = await apiFetch({ action: 'getLanguages', scope });

    if (!res.success || !res.languages?.length) {
        document.getElementById(`langList-${scope}`).innerHTML = `
            <li class="list-group-item text-center text-muted py-4">
                <i class="fas fa-flag-checkered fa-2x mb-2 opacity-25 d-block"></i>
                <p class="mb-0 small">Henüz dil eklenmedi.</p>
            </li>`;
        setLangLoading(scope, false);
        updateScopeBadge(scope, '0');
        return;
    }

    const list = document.getElementById(`langList-${scope}`);
    list.innerHTML = '';

    res.languages.forEach(lang => {
        const isDefault  = lang.is_default == 1;
        const isActive   = lang.is_active  == 1;
        const isSelected = lang.id == state[scope].langId;

        const li = document.createElement('li');
        li.className = `list-group-item list-group-item-action d-flex align-items-center gap-2 py-3${isSelected ? ' active' : ''}`;
        li.style.cursor = 'pointer';
        li.dataset.id   = lang.id;

        li.innerHTML = `
            <span class="fs-5">${lang.flag || '🌐'}</span>
            <div class="flex-grow-1 min-w-0">
                <div class="fw-semibold small">${escHtml(lang.name)}</div>
                <div class="small opacity-75">
                    ${escHtml(lang.code)}
                    ${isDefault ? '<span class="badge bg-warning text-dark ms-1" style="font-size:.65rem">Varsayılan</span>' : ''}
                    ${!isActive  ? '<span class="badge bg-secondary ms-1" style="font-size:.65rem">Pasif</span>' : ''}
                </div>
            </div>
            <div class="d-flex flex-column align-items-end gap-1">
                <span class="badge bg-primary rounded-pill small">${lang.scope_translated ?? 0}</span>
                <div class="dropdown" onclick="event.stopPropagation()">
                    <button class="btn btn-sm btn-link p-0 text-${isSelected ? 'white' : 'secondary'}"
                            data-bs-toggle="dropdown">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                        ${!isDefault ? `
                        <li><button class="dropdown-item small" onclick="setDefaultLang(${lang.id},'${scope}')">
                            <i class="fas fa-star me-2 text-warning"></i>Varsayılan Yap
                        </button></li>` : ''}
                        <li><button class="dropdown-item small" onclick="startAutoTranslate('${scope}',${lang.id},'${escHtml(lang.code)}','${escHtml(lang.name)}')">
                            <i class="fas fa-robot me-2 text-info"></i>Azure ile Çevir
                        </button></li>
                        ${!isDefault ? `
                        <li><hr class="dropdown-divider"></li>
                        <li><button class="dropdown-item text-danger small" onclick="deleteLang(${lang.id},'${escHtml(lang.name)}','${scope}')">
                            <i class="fas fa-trash me-2"></i>Sil
                        </button></li>` : ''}
                    </ul>
                </div>
            </div>`;

        li.addEventListener('click', () => selectLanguage(scope, lang.id, lang.code, lang.name));
        list.appendChild(li);
    });

    document.getElementById(`baseCount-${scope}`).textContent = res.base_count ?? 0;
    document.getElementById(`langFooter-${scope}`).style.display = '';

    // Scope rozetini güncelle (toplam çeviri sayısı)
    const totalTranslated = res.languages.reduce((a, l) => a + (parseInt(l.scope_translated) || 0), 0);
    updateScopeBadge(scope, res.base_count ?? 0);

    setLangLoading(scope, false);
}

function setLangLoading(scope, on) {
    document.getElementById(`langLoading-${scope}`).style.display = on ? '' : 'none';
    document.getElementById(`langList-${scope}`).style.display    = on ? 'none' : '';
}

function updateScopeBadge(scope, count) {
    const el = document.getElementById(`badge-${scope}`);
    if (el) el.textContent = count;
}

/* ─────────────────────────────────────────────────────────────────────────
   DİL SEÇİMİ
───────────────────────────────────────────────────────────────────────── */
function selectLanguage(scope, id, code, name) {
    if (state[scope].langId === id) return;

    if (state[scope].pending.size > 0) {
        if (!confirm(`${state[scope].pending.size} kaydedilmemiş değişiklik var. Devam et?`)) return;
        state[scope].pending.clear();
    }

    state[scope].langId   = id;
    state[scope].langCode = code;
    state[scope].langName = name;
    state[scope].page     = 1;

    // Sidebar seçim güncelle
    document.querySelectorAll(`#langList-${scope} .list-group-item`).forEach(li => {
        li.classList.toggle('active', li.dataset.id == id);
    });

    document.getElementById(`activeLangName-${scope}`).textContent = name;
    document.getElementById(`translationPanel-${scope}`).style.display = '';
    document.getElementById(`noLangSelected-${scope}`).style.display   = 'none';

    loadTranslations(scope, 1);
}

/* ─────────────────────────────────────────────────────────────────────────
   ÇEVİRİ LİSTESİ (client / admin)
───────────────────────────────────────────────────────────────────────── */
async function loadTranslations(scope, page = 1) {
    if (!state[scope].langId) return;

    state[scope].page = page;

    document.getElementById(`transLoading-${scope}`).style.display = '';
    document.getElementById(`transList-${scope}`).style.display    = 'none';
    document.getElementById(`transEmpty-${scope}`).style.display   = 'none';

    const params = {
        action   : 'getTranslations',
        scope,
        lang_id  : state[scope].langId,
        page,
        per_page : 30,
        search   : document.getElementById(`searchInput-${scope}`).value.trim(),
        filter   : document.getElementById(`filterSelect-${scope}`).value,
    };

    const res = await apiFetch(params);

    document.getElementById(`transLoading-${scope}`).style.display = 'none';

    if (!res.success) {
        showToast('Çeviriler yüklenemedi: ' + (res.message ?? ''), 'danger');
        return;
    }

    // İstatistik
    document.getElementById(`statTotal-${scope}`).textContent   = `${res.total ?? 0} toplam`;
    document.getElementById(`statDone-${scope}`).textContent    = `${res.translated ?? 0} çevrildi`;
    document.getElementById(`statMissing-${scope}`).textContent = `${res.missing ?? 0} eksik`;

    state[scope].totalPages = res.pages ?? 1;

    renderTranslations(scope, res.items ?? []);
    renderPager(scope, page, state[scope].totalPages, res.total ?? 0);
}

function renderTranslations(scope, items) {
    const container = document.getElementById(`transList-${scope}`);
    const empty     = document.getElementById(`transEmpty-${scope}`);

    container.innerHTML = '';

    if (!items.length) {
        empty.style.display     = '';
        container.style.display = 'none';
        document.getElementById(`transPager-${scope}`).style.display = 'none';
        return;
    }

    empty.style.display     = 'none';
    container.style.display = '';

    items.forEach(item => {
        const key       = item.trans_key ?? '';
        const hasTrans  = item.trans_value && item.trans_value.trim() !== '';
        const isAuto    = item.is_auto == 1;
        const isPending = state[scope].pending.has(key);
        const curVal    = isPending ? state[scope].pending.get(key) : (item.trans_value ?? '');

        const row = document.createElement('div');
        row.className = `trans-row${!hasTrans ? ' trans-row--missing' : ''}`;
        row.dataset.key = key;

        row.innerHTML = `
            <div class="trans-key">
                <code class="small">${escHtml(key)}</code>
                <div class="trans-source text-muted small mt-1">${escHtml(item.source_value ?? '')}</div>
            </div>
            <div class="trans-value-wrap">
                <textarea class="form-control form-control-sm trans-textarea${isPending ? ' border-warning' : ''}"
                    data-key="${escHtml(key)}" rows="2"
                    placeholder="Çeviri girin...">${escHtml(curVal)}</textarea>
                <div class="d-flex justify-content-between align-items-center mt-1">
                    <span class="badge ${hasTrans ? (isAuto ? 'bg-info' : 'bg-success') : 'bg-danger'} small">
                        ${hasTrans ? (isAuto ? 'Otomatik' : 'Manuel') : 'Eksik'}
                    </span>
                    <button class="btn btn-xs btn-outline-primary save-one-btn"
                            onclick="saveOne('${scope}','${escHtml(key)}',this)">
                        <i class="fas fa-save me-1"></i>Kaydet
                    </button>
                </div>
            </div>`;

        const ta = row.querySelector('textarea');
        ta.addEventListener('input', () => {
            state[scope].pending.set(key, ta.value);
            ta.classList.add('border-warning');
            updateSaveAllLabel(scope);
        });

        container.appendChild(row);
    });
}

function renderPager(scope, page, pages, total) {
    const pager = document.getElementById(`transPager-${scope}`);
    if (pages <= 1) { pager.style.display = 'none'; return; }
    pager.style.display = '';

    const start = (page - 1) * 30 + 1;
    const end   = Math.min(page * 30, total);
    document.getElementById(`pagerInfo-${scope}`).textContent = `${start}–${end} / ${total}`;
    document.getElementById(`btnPrev-${scope}`).disabled = page <= 1;
    document.getElementById(`btnNext-${scope}`).disabled = page >= pages;
}

function loadPage(scope, p) {
    if (p < 1 || p > state[scope].totalPages) return;
    loadTranslations(scope, p);
}

/* ─────────────────────────────────────────────────────────────────────────
   ARAMA / FİLTRE
───────────────────────────────────────────────────────────────────────── */
function onSearchChange(scope) {
    clearTimeout(state[scope].searchTimer);
    state[scope].searchTimer = setTimeout(() => loadTranslations(scope, 1), 350);
}

/* ─────────────────────────────────────────────────────────────────────────
   TEK ÇEVİRİ KAYDET
───────────────────────────────────────────────────────────────────────── */
async function saveOne(scope, transKey, btn) {
    const row   = btn.closest('.trans-row');
    const ta    = row.querySelector('textarea');
    const value = ta.value;

    btn.disabled  = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const res = await apiFetch({
        action   : 'saveTranslation',
        scope,
        lang_id  : state[scope].langId,
        trans_key: transKey,
        value,
    });

    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-save me-1"></i>Kaydet';

    if (res.success) {
        state[scope].pending.delete(transKey);
        ta.classList.remove('border-warning');
        ta.classList.add('border-success');
        setTimeout(() => ta.classList.remove('border-success'), 1500);
        showToast('Kaydedildi.', 'success');
        updateSaveAllLabel(scope);
        loadLanguages(scope);
    } else {
        showToast('Hata: ' + (res.message ?? ''), 'danger');
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   TOPLU KAYDET
───────────────────────────────────────────────────────────────────────── */
async function saveAllPending(scope) {
    if (!state[scope].pending.size) {
        showToast('Kaydedilecek değişiklik yok.', 'info');
        return;
    }

    const translations = [];
    state[scope].pending.forEach((value, trans_key) => {
        translations.push({ trans_key, value });
    });

    const res = await apiFetch({
        action      : 'saveBulk',
        scope,
        lang_id     : state[scope].langId,
        translations: JSON.stringify(translations),
    });

    if (res.success) {
        state[scope].pending.clear();
        showToast(`${res.saved ?? 0} çeviri kaydedildi.`, 'success');
        loadTranslations(scope, state[scope].page);
        loadLanguages(scope);
    } else {
        showToast('Hata: ' + (res.message ?? ''), 'danger');
    }
    updateSaveAllLabel(scope);
}

function updateSaveAllLabel(scope) {
    const n   = state[scope].pending.size;
    const lbl = document.getElementById(`saveAllLabel-${scope}`);
    if (lbl) lbl.textContent = n > 0 ? `Tümünü Kaydet (${n})` : 'Tümünü Kaydet';
}

/* ─────────────────────────────────────────────────────────────────────────
   DİL EKLE
───────────────────────────────────────────────────────────────────────── */
async function addLanguage() {
    const code = document.getElementById('newLangCode').value.trim().toLowerCase();
    const name = document.getElementById('newLangName').value.trim();
    const flag = document.getElementById('newLangFlag').value.trim();
    const autoTr = document.getElementById('autoTranslateOnAdd').checked;
    const scope  = currentModalScope;

    const errBox = document.getElementById('addLangError');
    errBox.style.display = 'none';

    if (!code || !name) {
        errBox.textContent = 'Dil kodu ve adı zorunludur.';
        errBox.style.display = '';
        return;
    }

    const btn = document.getElementById('btnAddLang');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Ekleniyor...';

    const res = await apiFetch({ action: 'addLanguage', scope, code, name, flag });

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus me-1"></i> Ekle';

    if (res.success) {
        bootstrap.Modal.getInstance(document.getElementById('addLangModal')).hide();
        document.getElementById('newLangCode').value = '';
        document.getElementById('newLangName').value = '';
        document.getElementById('newLangFlag').value = '';

        showToast(res.message ?? 'Dil eklendi.', 'success');
        await loadLanguages(scope);
        loadLandingLanguages(); // BUG 33: yeni dil landing listesine de eklensin

        const newId = res.lang_id || res.id;
        if (autoTr && newId) {
            startAutoTranslate(scope, newId, code, name);
        } else if (newId) {
            selectLanguage(scope, newId, code, name);
        }
    } else {
        errBox.textContent = res.message ?? 'Dil eklenemedi.';
        errBox.style.display = '';
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   VARSAYILAN DİL
───────────────────────────────────────────────────────────────────────── */
async function setDefaultLang(langId, scope) {
    const res = await apiFetch({ action: 'setDefault', scope, lang_id: langId });
    if (res.success) {
        showToast('Varsayılan dil güncellendi.', 'success');
        loadLanguages(scope);
    } else {
        showToast('Hata: ' + (res.message ?? ''), 'danger');
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   DİL SİL
───────────────────────────────────────────────────────────────────────── */
async function deleteLang(langId, langName, scope) {
    if (!confirm(`"${langName}" dilini silmek istediğinizden emin misiniz?\nBu dilin tüm çevirileri de silinecektir.`)) return;

    const res = await apiFetch({ action: 'deleteLanguage', scope, lang_id: langId });
    if (res.success) {
        showToast('Dil silindi.', 'success');
        if (state[scope].langId == langId) {
            state[scope].langId   = null;
            state[scope].langCode = null;
            document.getElementById(`translationPanel-${scope}`).style.display = 'none';
            document.getElementById(`noLangSelected-${scope}`).style.display   = '';
        }
        loadLanguages(scope);
        loadLandingLanguages(); // BUG 33: silinen dil landing listesinden de kaldırılsın
    } else {
        showToast('Hata: ' + (res.message ?? ''), 'danger');
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   AZURE OTOMATİK ÇEVİRİ — client/admin
───────────────────────────────────────────────────────────────────────── */
async function startAutoTranslate(scope, langId, langCode, langName) {
    // Overload: eğer scope'tan çağrılıyorsa state'den al
    if (langId === undefined) {
        langId   = state[scope].langId;
        langCode = state[scope].langCode;
        langName = state[scope].langName;
    }

    if (!langId) return;

    if (langCode === 'tr') {
        showToast('Türkçe kaynak dildir, çeviri yapılamaz.', 'warning');
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('progressModal'));
    modal.show();
    setProgress(`Azure Translator başlatılıyor...`, `Dil: ${langName} (${langCode}) | Scope: ${scope}`);

    const res = await apiFetch({
        action   : 'autoTranslate',
        scope,
        lang_id  : langId,
        lang_code: langCode,
    });

    modal.hide();

    if (res.success) {
        const translated  = res.translated   ?? 0;
        const skipped     = res.skipped      ?? 0;
        const failed      = res.failed       ?? 0;
        const errorDetail = res.error_detail ?? '';

        let toastType = 'success';
        let toastMsg  = `${translated} çeviri tamamlandı. ${skipped} zaten mevcuttu.`;

        if (failed > 0 && translated === 0) {
            toastType = 'danger';
            toastMsg  = `Çeviri başarısız! ${failed} anahtar çevrilemedi.`;
            if (errorDetail) {
                toastMsg += ` Hata: ${errorDetail}`;
            } else {
                toastMsg += ` Azure API bağlantısını veya API key'i kontrol edin.`;
            }
        } else if (failed > 0) {
            toastType = 'warning';
            toastMsg  = `${translated} çeviri tamamlandı. ${failed} anahtar başarısız. ${skipped} zaten mevcuttu.`;
            if (errorDetail) toastMsg += ` (${errorDetail})`;
        } else if (translated === 0 && skipped > 0) {
            toastMsg = `Tüm çeviriler zaten mevcut (${skipped} anahtar).`;
        }

        showToast(toastMsg, toastType);
        if (state[scope].langId == langId) loadTranslations(scope, 1);
        loadLanguages(scope);
    } else {
        showToast('Otomatik çeviri hatası: ' + (res.message ?? ''), 'danger');
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   LANDING SİTE — BUG 21: Dil listesini yükle
───────────────────────────────────────────────────────────────────────── */
async function loadLandingLanguages() {
    const loadingEl = document.getElementById('landingLangLoading');
    const listEl    = document.getElementById('landingLangList');

    if (loadingEl) loadingEl.style.display = '';
    if (listEl)    listEl.style.display    = 'none';

    const res = await apiFetch({ action: 'getLandingLanguages', scope: 'landing' });

    if (loadingEl) loadingEl.style.display = 'none';

    if (!res.success || !res.languages?.length) {
        if (listEl) {
            listEl.style.display = '';
            listEl.innerHTML = `
                <li class="list-group-item text-center text-muted py-4">
                    <i class="fas fa-flag-checkered fa-2x mb-2 opacity-25 d-block"></i>
                    <p class="mb-0 small">Henüz dil eklenmedi.</p>
                </li>`;
        }
        // Dil yoksa badge'i sıfırla
        const badgeEl = document.getElementById('badge-landing');
        if (badgeEl) badgeEl.textContent = '0';
        return;
    }

    if (listEl) {
        listEl.style.display = '';
        listEl.innerHTML = '';

        const totalFields = res.total_fields || 1;

        res.languages.forEach(lang => {
            const isSelected = lang.code === currentLandingLangCode;
            const pct = Math.min(100, Math.round((lang.landing_count / totalFields) * 100));

            const li = document.createElement('li');
            li.className = `list-group-item list-group-item-action d-flex align-items-center gap-2 py-2${isSelected ? ' active' : ''}`;
            li.style.cursor = 'pointer';
            li.dataset.code = lang.code;
            li.onclick = () => selectLandingLanguage(lang.code, lang.name, lang.flag || '🌐');
            li.innerHTML = `
                <span class="fs-5">${lang.flag || '🌐'}</span>
                <div class="flex-grow-1 min-w-0">
                    <div class="fw-semibold small">${escHtml(lang.name)}</div>
                    <div class="small opacity-75">${escHtml(lang.code)} — ${lang.landing_count}/${totalFields}</div>
                    <div class="progress mt-1" style="height:3px;">
                        <div class="progress-bar ${isSelected ? 'bg-white' : 'bg-primary'}" style="width:${pct}%"></div>
                    </div>
                </div>`;
            listEl.appendChild(li);
        });

        // Seçili dil için badge güncelle
        // BUG 36 Fix: badge-landing yalnızca buradan (tek kaynaktan) güncellenir
        // loadLandingItems içindeki badge güncellemesi kaldırıldı
        const selLang = res.languages.find(l => l.code === currentLandingLangCode);
        const badgeEl = document.getElementById('badge-landing');
        if (badgeEl) {
            if (selLang) {
                badgeEl.textContent = `${selLang.landing_count}/${res.total_fields ?? 0}`;
            } else {
                const totalDone = res.languages.reduce((a, l) => a + (parseInt(l.landing_count) || 0), 0);
                badgeEl.textContent = totalDone;
            }
        }

        // Daha önce seçili dil yoksa ilk dili otomatik seç
        if (!currentLandingLangCode && res.languages.length > 0) {
            const first = res.languages[0];
            selectLandingLanguage(first.code, first.name, first.flag || '🌐');
        }
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   LANDING SİTE — BUG 21: Dil seç
───────────────────────────────────────────────────────────────────────── */
function selectLandingLanguage(langCode, langName, langFlag = '🌐') {
    currentLandingLangCode = langCode;
    currentLandingLangName = langName;

    // Dil listesinde seçimi güncelle (li elemanları)
    const listEl = document.getElementById('landingLangList');
    if (listEl) {
        listEl.querySelectorAll('.list-group-item').forEach(li => {
            const isActive = li.dataset.code === langCode;
            li.classList.toggle('active', isActive);
            const bar = li.querySelector('.progress-bar');
            if (bar) bar.className = `progress-bar ${isActive ? 'bg-white' : 'bg-primary'}`;
        });
    }

    // Panel göster, noLang gizle
    const noLangEl    = document.getElementById('landingNoLang');
    const panelEl     = document.getElementById('landingTransPanel');
    const subtitleEl  = document.getElementById('landingLangSubtitle');
    if (noLangEl)   noLangEl.style.display   = 'none';
    if (panelEl)    panelEl.style.display     = '';
    if (subtitleEl) subtitleEl.textContent    = `TR → ${langName} (${langCode})`;

    // Mevcut değişiklikler varsa sıfırla
    if (landingPending.size > 0) {
        landingPending.clear();
        updateLandingSaveLabel();
    }

    loadLandingItems(currentLandingSection);
}

/* ─────────────────────────────────────────────────────────────────────────
   LANDING SİTE — Bölüm seçici
───────────────────────────────────────────────────────────────────────── */
function selectLandingSection(section) {
    currentLandingSection = section;

    // Sidebar seçim vurgulama
    document.querySelectorAll('#landingSectionList .list-group-item').forEach(li => {
        li.classList.toggle('active', li.dataset.section === section);
    });

    // Başlık
    const titles = {
        all:      'Tüm Bölümler',
        settings: 'Genel Ayarlar',
        features: 'Özellikler',
        steps:    'Nasıl Çalışır? Adımları',
        faqs:     'SSS',
        footer:   'Footer Linkleri',
        pricing:  'Fiyatlandırma Özellikleri', // BUG 11 Fix
    };
    document.getElementById('landingSectionTitle').innerHTML = `
        <i class="fas fa-globe-americas me-2 text-success"></i>
        Landing Site — ${titles[section] ?? section}`;

    if (currentLandingLangCode) {
        loadLandingItems(section);
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   LANDING SİTE — İçerikleri yükle
───────────────────────────────────────────────────────────────────────── */
async function loadLandingItems(section = 'all') {
    if (!currentLandingLangCode) return;

    document.getElementById('landingLoading').style.display = '';
    document.getElementById('landingList').style.display    = 'none';
    document.getElementById('landingEmpty').style.display   = 'none';

    const res = await apiFetch({
        action   : 'getLandingItems',
        scope    : 'landing',
        section,
        lang_code: currentLandingLangCode,
    });

    document.getElementById('landingLoading').style.display = 'none';

    if (!res.success) {
        showToast('Landing içerikler yüklenemedi: ' + (res.message ?? ''), 'danger');
        return;
    }

    const items = res.items ?? [];

    // BUG 36 Fix: badge-landing badge'ini loadLandingLanguages() üzerinden güncelle (tek kaynak).
    // Burada yalnızca alt bölüm sayaçları (landing-count-*) güncellenir.
    if (section === 'all') {
        // Alt bölüm sayaçları
        const sectionCounts = {};
        items.forEach(i => {
            if (!sectionCounts[i.section]) sectionCounts[i.section] = {total:0, done:0};
            sectionCounts[i.section].total++;
            if (i.trans_value !== '') sectionCounts[i.section].done++;
        });
        // BUG 11 Fix: pricing bölümü de sayaçlara dahil edildi
        ['settings','features','steps','faqs','footer','pricing'].forEach(s => {
            const el = document.getElementById(`landing-count-${s}`);
            if (el && sectionCounts[s]) {
                el.textContent = `${sectionCounts[s].done}/${sectionCounts[s].total}`;
            }
        });
        const allEl = document.getElementById('landing-count-all');
        if (allEl) allEl.textContent = `${res.translated ?? 0}/${res.total ?? 0}`;

        // Dil listesini ve badge'i yenile (loadLandingLanguages tek kaynak)
        // currentLandingLangCode set olduğundan sonsuz döngü oluşmaz
        loadLandingLanguages();
    }

    // İstatistik
    document.getElementById('landingStatTotal').textContent   = `${res.total ?? 0} toplam`;
    document.getElementById('landingStatDone').textContent    = `${res.translated ?? 0} çevrildi`;
    document.getElementById('landingStatMissing').textContent = `${res.missing ?? 0} eksik`;

    renderLandingItems(items);
}

function renderLandingItems(items) {
    const container = document.getElementById('landingList');
    const empty     = document.getElementById('landingEmpty');

    container.innerHTML = '';

    if (!items.length) {
        empty.style.display     = '';
        container.style.display = 'none';
        return;
    }

    empty.style.display     = 'none';
    container.style.display = '';

    // Bölüme göre grupla
    let lastSectionLabel = '';

    items.forEach(item => {
        // Bölüm başlığı
        if (item.section_label !== lastSectionLabel) {
            lastSectionLabel = item.section_label;
            const hdr = document.createElement('div');
            hdr.className = 'px-3 py-2 bg-light border-bottom fw-semibold small text-muted text-uppercase';
            hdr.innerHTML = `<i class="fas fa-layer-group me-2"></i>${escHtml(item.section_label)}`;
            container.appendChild(hdr);
        }

        const hasTrans  = item.trans_value && item.trans_value.trim() !== '';
        // BUG 32 Fix: item.field_key kullan, item.field_en yok (response'da field_key geliyor)
        const key       = `${item.section}:${item.record_id}:${item.field_key}`;
        const isPending = landingPending.has(key);
        const curVal    = isPending ? landingPending.get(key) : (item.trans_value ?? '');

        const row = document.createElement('div');
        row.className = `trans-row${!hasTrans ? ' trans-row--missing' : ''}`;
        row.dataset.key       = key;
        row.dataset.section   = item.section;
        row.dataset.recordId  = item.record_id;
        row.dataset.fieldEn   = item.field_en;

        const inputEl = item.type === 'textarea'
            ? `<textarea class="form-control form-control-sm trans-textarea${isPending ? ' border-warning' : ''}"
                rows="2" placeholder="İngilizce çeviri...">${escHtml(curVal)}</textarea>`
            : `<input type="text" class="form-control form-control-sm trans-textarea${isPending ? ' border-warning' : ''}"
                placeholder="İngilizce çeviri..." value="${escHtml(curVal)}">`;

        row.innerHTML = `
            <div class="trans-key">
                <div class="fw-semibold small">${escHtml(item.label)}</div>
                <div class="trans-source text-muted small mt-1">${escHtml(item.source_value ?? '')}</div>
            </div>
            <div class="trans-value-wrap">
                ${inputEl}
                <div class="d-flex justify-content-between align-items-center mt-1">
                    <span class="badge ${hasTrans ? 'bg-success' : 'bg-danger'} small">
                        ${hasTrans ? 'Çevrildi' : 'Eksik'}
                    </span>
                    <button class="btn btn-xs btn-outline-primary" onclick="saveLandingOne(this)">
                        <i class="fas fa-save me-1"></i>Kaydet
                    </button>
                </div>
            </div>`;

        // field_key dataset'i ekle (BUG 21: field_en yerine field_key kullanılıyor)
        row.dataset.fieldKey = item.field_key;

        // Input change takibi
        const inp = row.querySelector('input, textarea');
        inp.addEventListener('input', () => {
            landingPending.set(key, inp.value);
            inp.classList.add('border-warning');
            updateLandingSaveLabel();
        });

        container.appendChild(row);
    });
}

/* ─────────────────────────────────────────────────────────────────────────
   LANDING — Tek kaydet
   BUG 37 Fix: Kayıt başarılı olduğunda tüm listeyi yeniden render etme.
   Yalnızca ilgili satırı inline güncelle + loadLandingLanguages() ile
   badge/sayaçları tazele. Bu sayede diğer satırlardaki pending (unsaved)
   değişiklikler kaybolmaz.
───────────────────────────────────────────────────────────────────────── */
async function saveLandingOne(btn) {
    const row      = btn.closest('.trans-row');
    const inp      = row.querySelector('input, textarea');
    const key      = row.dataset.key;
    const section  = row.dataset.section;
    const recordId = row.dataset.recordId;
    const fieldKey = row.dataset.fieldKey || row.dataset.fieldEn;
    const value    = inp.value;

    if (!currentLandingLangCode) {
        showToast('Lütfen önce bir dil seçin.', 'warning');
        return;
    }

    btn.disabled  = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const res = await apiFetch({
        action   : 'saveLandingItem',
        scope    : 'landing',
        section,
        record_id: recordId,
        field_key: fieldKey,
        lang_code: currentLandingLangCode,
        value,
    });

    btn.disabled  = false;
    btn.innerHTML = '<i class="fas fa-save me-1"></i>Kaydet';

    if (res.success) {
        // BUG 37 Fix: Satırı inline güncelle — listeyi yeniden render ETME
        landingPending.delete(key);
        inp.classList.remove('border-warning');
        inp.classList.add('border-success');
        setTimeout(() => inp.classList.remove('border-success'), 1500);

        // Satır badge'ini "Çevrildi" olarak güncelle
        const badge = row.querySelector('.badge');
        if (badge) {
            badge.className = 'badge bg-success small';
            badge.textContent = 'Çevrildi';
        }
        // Satırın missing sınıfını kaldır
        row.classList.remove('trans-row--missing');

        showToast('Kaydedildi.', 'success');
        updateLandingSaveLabel();

        // Badge ve dil listesindeki sayaçları güncelle (tek kaynak: loadLandingLanguages)
        loadLandingLanguages();
    } else {
        showToast('Hata: ' + (res.message ?? ''), 'danger');
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   LANDING — Tümünü kaydet
───────────────────────────────────────────────────────────────────────── */
async function saveAllLanding() {
    if (!landingPending.size) {
        showToast('Kaydedilecek değişiklik yok.', 'info');
        return;
    }

    let saved = 0;
    let failed = 0;

    if (!currentLandingLangCode) {
        showToast('Lütfen önce bir dil seçin.', 'warning');
        return;
    }

    for (const [key, value] of landingPending.entries()) {
        const [section, recordId, fieldKey] = key.split(':');
        const res = await apiFetch({
            action   : 'saveLandingItem',
            scope    : 'landing',
            section,
            record_id: recordId,
            field_key: fieldKey,
            lang_code: currentLandingLangCode,
            value,
        });
        if (res.success) { saved++; landingPending.delete(key); }
        else failed++;
    }

    showToast(`${saved} çeviri kaydedildi${failed ? `, ${failed} başarısız` : ''}.`, failed ? 'warning' : 'success');
    updateLandingSaveLabel();
    loadLandingItems(currentLandingSection);
}

function updateLandingSaveLabel() {
    const n   = landingPending.size;
    const lbl = document.getElementById('landingSaveLabel');
    if (lbl) lbl.textContent = n > 0 ? `Tümünü Kaydet (${n})` : 'Tümünü Kaydet';
}

/* ─────────────────────────────────────────────────────────────────────────
   LANDING — Azure Otomatik Çeviri
───────────────────────────────────────────────────────────────────────── */
async function autoTranslateLanding() {
    if (!currentLandingLangCode) {
        showToast('Lütfen önce bir dil seçin.', 'warning');
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('progressModal'));
    modal.show();
    setProgress(
        `Landing site içerikleri Azure ile çevriliyor...`,
        `Türkçe → ${currentLandingLangName} (${currentLandingLangCode})`
    );

    const res = await apiFetch({
        action   : 'autoTranslateLanding',
        scope    : 'landing',
        lang_code: currentLandingLangCode,
    });

    modal.hide();

    if (res.success) {
        const translated = res.translated ?? 0;
        const skipped    = res.skipped    ?? 0;
        const failed     = res.failed     ?? 0;
        let msg  = `${translated} landing çevirisi tamamlandı (${currentLandingLangCode}).`;
        let type = 'success';
        if (skipped > 0) msg += ` ${skipped} zaten mevcuttu.`;
        if (failed  > 0) { msg += ` ${failed} başarısız.`; type = failed > translated ? 'danger' : 'warning'; }
        if (translated === 0 && skipped > 0) { msg = `Tüm çeviriler zaten mevcut (${skipped}).`; type = 'info'; }
        showToast(msg, type);
        loadLandingLanguages();
        loadLandingItems(currentLandingSection);
    } else {
        showToast('Hata: ' + (res.message ?? ''), 'danger');
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   PROGRESS MODAL
───────────────────────────────────────────────────────────────────────── */
function setProgress(main, sub = '') {
    document.getElementById('progressText').textContent = main;
    document.getElementById('progressSub').textContent  = sub;
}

/* ─────────────────────────────────────────────────────────────────────────
   YARDIMCI: API FETCH
───────────────────────────────────────────────────────────────────────── */
async function apiFetch(params) {
    try {
        const body = new FormData();
        Object.entries(params).forEach(([k, v]) => body.append(k, v));
        const resp = await fetch(ACTIONS_URL, { method: 'POST', body });
        return await resp.json();
    } catch (e) {
        console.error('apiFetch error:', e);
        return { success: false, message: 'Bağlantı hatası.' };
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   YARDIMCI: TOAST
───────────────────────────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = 9999;
        document.body.appendChild(container);
    }

    const id   = 'toast_' + Date.now();
    const html = `
        <div id="${id}" class="toast align-items-center text-bg-${type} border-0 shadow" role="alert">
            <div class="d-flex">
                <div class="toast-body">${escHtml(message)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`;

    container.insertAdjacentHTML('beforeend', html);
    const toastEl = document.getElementById(id);
    // danger/warning için daha uzun süre göster (hata detayı okunabilsin)
    const toastDelay = (type === 'danger') ? 10000 : (type === 'warning' ? 6000 : 4000);
    const toast   = new bootstrap.Toast(toastEl, { delay: toastDelay });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

/* ─────────────────────────────────────────────────────────────────────────
   YARDIMCI: HTML ESCAPE
───────────────────────────────────────────────────────────────────────── */
function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}