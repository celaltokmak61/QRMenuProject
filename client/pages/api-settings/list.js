/**
 * API Ayarları — list.js
 * FAZA 13
 */

'use strict';

const ApiSettings = (function () {

    const cfg         = window.apiSettingsConfig || { actionsUrl: 'actions.php', totalKeys: 0, maxKeys: 10 };
    let   deleteKeyId = null;

    // -----------------------------------------------
    // Bootstrap nesneleri (lazy init)
    // -----------------------------------------------
    let createModal, deleteModal, toast;

    function initBs() {
        const createEl = document.getElementById('createKeyModal');
        const deleteEl = document.getElementById('deleteKeyModal');
        const toastEl  = document.getElementById('actionToast');

        if (createEl) createModal = new bootstrap.Modal(createEl);
        if (deleteEl) deleteModal = new bootstrap.Modal(deleteEl);
        if (toastEl)  toast       = new bootstrap.Toast(toastEl, { delay: 3500 });
    }

    // -----------------------------------------------
    // Toast bildirimi
    // -----------------------------------------------
    function showToast(msg, type = 'success') {
        const el = document.getElementById('actionToast');
        const msgEl = document.getElementById('toastMessage');
        if (!el || !msgEl) return;

        el.className = `toast align-items-center border-0 text-white bg-${type}`;
        msgEl.textContent = msg;
        toast.show();
    }

    // -----------------------------------------------
    // AJAX helper
    // -----------------------------------------------
    async function post(data) {
        const form = new FormData();
        for (const [k, v] of Object.entries(data)) form.append(k, v);

        const res  = await fetch(cfg.actionsUrl, { method: 'POST', body: form });
        const json = await res.json();
        return json;
    }

    // -----------------------------------------------
    // Yeni anahtar oluştur modal
    // -----------------------------------------------
    function openCreateModal() {
        if (cfg.totalKeys >= cfg.maxKeys) {
            showToast(cfg.i18n?.maxKeysWarning || `Max ${cfg.maxKeys} keys allowed.`, 'warning');
            return;
        }
        document.getElementById('keyNameInput').value  = '';
        document.getElementById('createdKeyBox').style.display = 'none';
        document.getElementById('createKeyResult').innerHTML   = '';
        const alertEl = document.getElementById('newKeyAlert');
        if (alertEl) alertEl.style.removeProperty('display');
        document.getElementById('saveKeyBtn').style.display = '';
        createModal.show();
    }

    // -----------------------------------------------
    // Anahtar oluştur
    // -----------------------------------------------
    async function createKey() {
        const name    = document.getElementById('keyNameInput').value.trim();
        const resultEl = document.getElementById('createKeyResult');

        if (!name) {
            resultEl.innerHTML = `<div class="alert alert-danger py-2 mb-0">${escHtml(cfg.i18n?.keyNameRequired || 'Key name is required.')}</div>`;
            return;
        }

        const btn = document.getElementById('saveKeyBtn');
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>${escHtml(cfg.i18n?.creating || 'Creating...')}`;

        try {
            const data = await post({ action: 'generate', name });

            if (data.success) {
                // Tam anahtarı göster (tek sefer)
                document.getElementById('createdKeyValue').value = data.key.api_key;
                document.getElementById('createdKeyBox').style.display = '';
                document.getElementById('newKeyAlert').style.display   = '';
                btn.style.display = 'none';

                // Tabloyu güncelle
                addKeyRow(data.key);
                cfg.totalKeys++;
                updateKeyCount();
                showToast(cfg.i18n?.keyCreated || 'API key created.', 'success');

                resultEl.innerHTML = '';
            } else {
                resultEl.innerHTML = `<div class="alert alert-danger py-2 mb-0">${escHtml(data.message)}</div>`;
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-plus me-2"></i>${escHtml(cfg.i18n?.createBtn || 'Create')}`;
            }
        } catch (e) {
            resultEl.innerHTML = `<div class="alert alert-danger py-2 mb-0">${escHtml(cfg.i18n?.connectionError || 'Connection error.')}</div>`;
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-plus me-2"></i>${escHtml(cfg.i18n?.createBtn || 'Create')}`;
        }
    }

    // -----------------------------------------------
    // Tabloya satır ekle
    // -----------------------------------------------
    function addKeyRow(key) {
        const tbody = document.getElementById('keysTableBody');
        if (!tbody) {
            // Tablo yoksa (empty-state) sayfayı yenile
            location.reload();
            return;
        }

        const keyShort = key.api_key.substring(0, 12) + '••••••••••••••••';
        const now      = new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        const tr = document.createElement('tr');
        tr.id    = `key-row-${key.id}`;
        tr.innerHTML = `
            <td><strong>${escHtml(key.name)}</strong></td>
            <td>
                <div class="key-display d-flex align-items-center gap-2">
                    <code class="key-text" id="keyText-${key.id}"
                          data-full="${escHtml(key.api_key)}"
                          data-short="${escHtml(keyShort)}">
                        ${escHtml(keyShort)}
                    </code>
                    <button class="btn btn-sm btn-outline-secondary py-0 px-1 toggle-key-vis"
                            data-key-id="${key.id}" title="${escHtml(cfg.i18n?.toggleShowHide || 'Show/Hide')}">
                        <i class="fas fa-eye" id="eyeIcon-${key.id}"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary py-0 px-1 copy-key-btn"
                            data-key="${escHtml(key.api_key)}" title="${escHtml(cfg.i18n?.keyCopied || 'Copy')}">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
                    <input class="form-check-input status-toggle" type="checkbox" data-key-id="${key.id}" checked>
                    <span class="status-badge badge bg-success" id="statusBadge-${key.id}">${escHtml(cfg.i18n?.statusActive || 'Active')}</span>
                </div>
            </td>
            <td class="text-muted small">—</td>
            <td><span class="badge bg-light text-dark border" id="reqCount-${key.id}">0</span></td>
            <td class="text-muted small">${now}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger delete-key-btn"
                        data-key-id="${key.id}"
                        data-key-name="${escHtml(key.name)}"
                        title="${escHtml(cfg.i18n?.deleteKeyTitle || 'Delete')}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.insertBefore(tr, tbody.firstChild);
    }

    // -----------------------------------------------
    // Anahtar sil
    // -----------------------------------------------
    function openDeleteModal(keyId, keyName) {
        deleteKeyId = keyId;
        const nameEl = document.getElementById('deleteKeyName');
        if (nameEl) nameEl.textContent = keyName;
        deleteModal.show();
    }

    async function confirmDelete() {
        if (!deleteKeyId) return;

        const btn = document.getElementById('confirmDeleteBtn');
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>${escHtml(cfg.i18n?.deleting || 'Deleting...')}`;

        try {
            const data = await post({ action: 'delete', key_id: deleteKeyId });

            if (data.success) {
                const row = document.getElementById(`key-row-${deleteKeyId}`);
                if (row) row.remove();
                cfg.totalKeys--;
                updateKeyCount();
                deleteModal.hide();
                showToast(cfg.i18n?.keyDeleted || 'API key deleted.', 'success');

                // Tablo boşaldıysa sayfayı yenile
                const tbody = document.getElementById('keysTableBody');
                if (tbody && tbody.children.length === 0) {
                    setTimeout(() => location.reload(), 800);
                }
            } else {
                showToast(data.message || cfg.i18n?.deleteFailed || 'Could not delete.', 'danger');
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-trash me-1"></i>${escHtml(cfg.i18n?.deleteBtn || 'Yes, Delete')}`;
            }
        } catch (e) {
            showToast(cfg.i18n?.connectionError || 'Connection error.', 'danger');
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-trash me-1"></i>${escHtml(cfg.i18n?.deleteBtn || 'Yes, Delete')}`;
        }
    }

    // -----------------------------------------------
    // Anahtar aktif/pasif toggle
    // -----------------------------------------------
    async function toggleKey(keyId, newActive) {
        const badge = document.getElementById(`statusBadge-${keyId}`);

        try {
            const data = await post({ action: 'toggle', key_id: keyId, is_active: newActive ? 1 : 0 });

            if (data.success) {
                if (badge) {
                    badge.className = `status-badge badge ${data.is_active ? 'bg-success' : 'bg-secondary'}`;
                    badge.textContent = data.is_active ? (cfg.i18n?.statusActive || 'Active') : (cfg.i18n?.statusPassive || 'Passive');
                }
                showToast(data.message, data.is_active ? 'success' : 'warning');
            } else {
                // Geri al
                const chk = document.querySelector(`.status-toggle[data-key-id="${keyId}"]`);
                if (chk) chk.checked = !newActive;
                showToast(data.message || cfg.i18n?.deleteFailed || 'Operation failed.', 'danger');
            }
        } catch (e) {
            const chk = document.querySelector(`.status-toggle[data-key-id="${keyId}"]`);
            if (chk) chk.checked = !newActive;
            showToast(cfg.i18n?.connectionError || 'Connection error.', 'danger');
        }
    }

    // -----------------------------------------------
    // Anahtar göster/gizle
    // -----------------------------------------------
    function toggleKeyVisibility(keyId) {
        const codeEl = document.getElementById(`keyText-${keyId}`);
        const eyeEl  = document.getElementById(`eyeIcon-${keyId}`);
        if (!codeEl) return;

        const isMasked = codeEl.textContent.trim() === codeEl.dataset.short.trim();
        codeEl.textContent = isMasked ? codeEl.dataset.full : codeEl.dataset.short;
        if (eyeEl) {
            eyeEl.className = isMasked ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
    }

    // -----------------------------------------------
    // Panoya kopyala
    // -----------------------------------------------
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showToast(cfg.i18n?.keyCopied || 'Key copied.', 'success');
        } catch (e) {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity  = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast(cfg.i18n?.keyCopied || 'Key copied.', 'success');
        }
    }

    // -----------------------------------------------
    // Anahtar sayısı güncelle
    // -----------------------------------------------
    function updateKeyCount() {
        const createBtn = document.getElementById('createKeyBtn');
        if (createBtn) {
            if (cfg.totalKeys >= cfg.maxKeys) {
                createBtn.disabled = true;
                createBtn.title    = cfg.i18n?.maxKeysTooltip || `Max ${cfg.maxKeys} keys allowed.`;
            } else {
                createBtn.disabled = false;
                createBtn.title    = '';
            }
        }

        // Tüm sayaç badge'lerini güncelle
        document.querySelectorAll('.badge.bg-secondary[data-count-badge]').forEach(el => {
            el.textContent = `${cfg.totalKeys} / ${cfg.maxKeys}`;
        });
    }

    // -----------------------------------------------
    // XSS koruması
    // -----------------------------------------------
    function escHtml(str) {
        if (typeof str !== 'string') return String(str ?? '');
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // -----------------------------------------------
    // Event listener'lar
    // -----------------------------------------------
    function bindEvents() {
        // Yeni anahtar butonu
        document.getElementById('createKeyBtn')?.addEventListener('click', openCreateModal);
        document.getElementById('createFirstKeyBtn')?.addEventListener('click', openCreateModal);

        // Oluştur butonu
        document.getElementById('saveKeyBtn')?.addEventListener('click', createKey);

        // Enter tuşu
        document.getElementById('keyNameInput')?.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') createKey();
        });

        // Oluşturulan anahtarı kopyala
        document.querySelector('.copy-created-key')?.addEventListener('click', function () {
            const val = document.getElementById('createdKeyValue')?.value;
            if (val) copyToClipboard(val);
        });

        // Silme onay butonu
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);

        // Event delegation — tablo butonları
        document.addEventListener('click', function (e) {

            // Sil butonu
            const delBtn = e.target.closest('.delete-key-btn');
            if (delBtn) {
                openDeleteModal(
                    parseInt(delBtn.dataset.keyId),
                    delBtn.dataset.keyName
                );
                return;
            }

            // Göster/gizle
            const visBtn = e.target.closest('.toggle-key-vis');
            if (visBtn) {
                toggleKeyVisibility(parseInt(visBtn.dataset.keyId));
                return;
            }

            // Kopyala
            const copyBtn = e.target.closest('.copy-key-btn');
            if (copyBtn) {
                copyToClipboard(copyBtn.dataset.key);
                return;
            }
        });

        // Status toggle (checkbox)
        document.addEventListener('change', function (e) {
            if (e.target.classList.contains('status-toggle')) {
                toggleKey(parseInt(e.target.dataset.keyId), e.target.checked);
            }
        });

        // Modal kapanınca formu sıfırla
        const createEl = document.getElementById('createKeyModal');
        createEl?.addEventListener('hidden.bs.modal', function () {
            document.getElementById('keyNameInput').value  = '';
            document.getElementById('createdKeyBox').style.display = 'none';
            document.getElementById('createKeyResult').innerHTML   = '';
            const saveBtn = document.getElementById('saveKeyBtn');
            if (saveBtn) {
                saveBtn.style.display = '';
                saveBtn.disabled      = false;
                saveBtn.innerHTML     = `<i class="fas fa-plus me-2"></i>${escHtml(cfg.i18n?.createBtn || 'Create')}`;
            }
        });
    }

    // -----------------------------------------------
    // Init
    // -----------------------------------------------
    function init() {
        initBs();
        bindEvents();
    }

    return { init };

})();

document.addEventListener('DOMContentLoaded', ApiSettings.init);