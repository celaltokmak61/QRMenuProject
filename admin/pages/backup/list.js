/**
 * admin/pages/backup/list.js
 * Faz 16 — Yedekleme Sistemi sayfa JS'i
 */

'use strict';

const T          = window.BACKUP_TRANSLATIONS || {};
const ACTIONS    = 'actions.php';
let   deleteTarget = null;
let   deleteModal  = null;

// ── Sayfa yüklenince ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    // İlk yükleme
    loadBackupList();

    // Yedek al butonu
    document.getElementById('btnRunBackup').addEventListener('click', runBackup);

    // Yenile butonu
    document.getElementById('btnRefresh').addEventListener('click', () => loadBackupList(true));

    // Silme onayla butonu
    document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
});

// ── Yedek listesini yükle ────────────────────────────────────────────────────
async function loadBackupList(showSpinner = false) {
    const container = document.getElementById('backupListContainer');

    if (showSpinner) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                ${escHtml(T.running || '...')}
            </div>`;
    }

    try {
        const fd = new FormData();
        fd.append('action', 'listBackups');
        const res  = await fetch(ACTIONS, { method: 'POST', body: fd });
        const data = await res.json();

        if (!data.success) throw new Error(data.message || 'Hata');

        // İstatistikleri güncelle
        document.getElementById('statTotal').textContent = data.total ?? '0';
        document.getElementById('statSize').textContent  = data.total_size ?? '0 B';
        document.getElementById('statLast').textContent  =
            data.last_date ?? (T.stats_never || '—');

        // Listeyi render et
        renderBackupList(data.backups || []);

    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger m-3">${escHtml(err.message)}</div>`;
    }
}

// ── Yedek listesini render et ────────────────────────────────────────────────
function renderBackupList(backups) {
    const container = document.getElementById('backupListContainer');

    if (backups.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-archive"></i>
                ${escHtml(T.list_empty || 'Henüz yedek bulunmuyor.')}
            </div>`;
        return;
    }

    const rows = backups.map(b => `
        <tr>
            <td class="filename-cell">
                <i class="fas fa-file-archive me-2 text-muted"></i>${escHtml(b.filename)}
            </td>
            <td>
                <span class="badge bg-secondary size-badge">${escHtml(b.size_fmt)}</span>
            </td>
            <td class="text-muted" style="font-size:.83rem">${escHtml(b.date)}</td>
            <td>
                <div class="d-flex gap-1">
                    <a href="${ACTIONS}?action=downloadBackup&filename=${encodeURIComponent(b.filename)}"
                       class="btn btn-outline-primary btn-sm" title="${escHtml(T.download || 'İndir')}">
                        <i class="fas fa-download"></i>
                    </a>
                    <button class="btn btn-outline-danger btn-sm"
                            data-filename="${escHtml(b.filename)}"
                            onclick="openDeleteModal(this)"
                            title="${escHtml(T.delete || 'Sil')}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('');

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table backup-table">
                <thead>
                    <tr>
                        <th>${escHtml(T.col_filename || 'Dosya Adı')}</th>
                        <th>${escHtml(T.col_size     || 'Boyut')}</th>
                        <th>${escHtml(T.col_date     || 'Tarih')}</th>
                        <th>${escHtml(T.col_actions  || 'İşlemler')}</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

// ── Manuel yedek al ──────────────────────────────────────────────────────────
async function runBackup() {
    const btn      = document.getElementById('btnRunBackup');
    const progress = document.getElementById('backupProgress');

    btn.disabled = true;
    progress.classList.remove('d-none');
    clearAlert();

    try {
        const fd = new FormData();
        fd.append('action', 'runBackup');
        const res  = await fetch(ACTIONS, { method: 'POST', body: fd });
        const data = await res.json();

        if (data.success) {
            showAlert('success', '<i class="fas fa-check-circle me-2"></i>' + escHtml(data.message || T.success));
        } else {
            showAlert('danger', '<i class="fas fa-exclamation-triangle me-2"></i>' + escHtml(data.message || T.error));
        }

        // Liste yenile
        await loadBackupList();

    } catch (err) {
        showAlert('danger', '<i class="fas fa-exclamation-triangle me-2"></i>' + escHtml(T.error || 'Hata oluştu.'));
    } finally {
        btn.disabled = false;
        progress.classList.add('d-none');
    }
}

// ── Silme modalını aç ────────────────────────────────────────────────────────
function openDeleteModal(btn) {
    deleteTarget = btn.dataset.filename;
    document.getElementById('deleteFilename').textContent = deleteTarget;
    deleteModal.show();
}

// ── Silmeyi onayla ───────────────────────────────────────────────────────────
async function confirmDelete() {
    if (!deleteTarget) return;

    const confirmBtn = document.getElementById('confirmDelete');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    try {
        const fd = new FormData();
        fd.append('action',   'deleteBackup');
        fd.append('filename', deleteTarget);
        const res  = await fetch(ACTIONS, { method: 'POST', body: fd });
        const data = await res.json();

        deleteModal.hide();

        if (data.success) {
            showAlert('success', '<i class="fas fa-check-circle me-2"></i>' + escHtml(T.delete_success || 'Yedek silindi.'));
        } else {
            showAlert('danger', '<i class="fas fa-exclamation-triangle me-2"></i>' + escHtml(data.message || T.delete_error));
        }

        await loadBackupList();

    } catch (err) {
        showAlert('danger', escHtml(T.delete_error || 'Hata oluştu.'));
        deleteModal.hide();
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<i class="fas fa-trash-alt me-1"></i>${escHtml(T.delete || 'Sil')}`;
        deleteTarget = null;
    }
}

// ── Yardımcılar ──────────────────────────────────────────────────────────────
function showAlert(type, html) {
    const area = document.getElementById('alertArea');
    area.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${html}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAlert() {
    document.getElementById('alertArea').innerHTML = '';
}

function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = String(str ?? '');
    return d.innerHTML;
}