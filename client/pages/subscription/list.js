/**
 * client/pages/subscription/list.js
 * FAZA 14 — Abonelik Sayfası JavaScript
 *
 * İşlevler:
 *   - Şube sayısı +/- kontrol + anlık fiyat hesaplama
 *   - IBAN kopyalama
 *   - Drag & Drop + dosya seçimi (dekont)
 *   - Ödeme bildirimi gönderme (submitPayment)
 *   - Ödeme geçmişi yenileme (getHistory)
 *   - Toast bildirimleri
 */

(function () {
    'use strict';

    /* ── Yapılandırma ────────────────────────────────────────── */
    const cfg = window.subscriptionConfig || {
        actionsUrl:     'actions.php',
        singlePrice:    0,
        perBranchPrice: 0,
        currency:       'TRY',
        currentBranches: 1,
        hasPending:     false,
    };

    /* ── DOM Referansları ────────────────────────────────────── */
    const branchInput       = document.getElementById('branchCountInput');
    const branchDec         = document.getElementById('branchDec');
    const branchInc         = document.getElementById('branchInc');
    const extraBranchRow    = document.getElementById('extraBranchRow');
    const extraBranchLabel  = document.getElementById('extraBranchLabel');
    const extraBranchPrice  = document.getElementById('extraBranchPrice');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    const copyIbanBtn       = document.getElementById('copyIbanBtn');
    const ibanText          = document.getElementById('ibanText');
    const uploadArea        = document.getElementById('uploadArea');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview     = document.getElementById('uploadPreview');
    const uploadFileName    = document.getElementById('uploadFileName');
    const uploadFileSize    = document.getElementById('uploadFileSize');
    const proofFileInput    = document.getElementById('paymentProofFile');
    const paymentNote       = document.getElementById('paymentNote');
    const submitPaymentBtn  = document.getElementById('submitPaymentBtn');
    const submitResult      = document.getElementById('submitResult');
    const loadAllHistoryBtn = document.getElementById('loadAllHistoryBtn');
    const historyContainer  = document.getElementById('paymentHistoryContainer');
    const toastEl           = document.getElementById('actionToast');
    const toastMsg          = document.getElementById('toastMessage');

    let bsToast = toastEl ? new bootstrap.Toast(toastEl, { delay: 3500 }) : null;

    /* ── Yardımcı: Para formatla ─────────────────────────────── */
    function fmtCurrency(val) {
        return parseFloat(val).toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + ' ' + cfg.currency;
    }

    /* ── Yardımcı: Dosya boyutu ──────────────────────────────── */
    function fmtFileSize(bytes) {
        if (bytes < 1024)         return bytes + ' B';
        if (bytes < 1024 * 1024)  return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    /* ── Toast göster ────────────────────────────────────────── */
    function showToast(message, type = 'success') {
        if (!toastEl || !bsToast) return;
        toastEl.className = 'toast align-items-center border-0 text-white bg-' + type;
        toastMsg.textContent = message;
        bsToast.show();
    }

    /* ── Fiyat Hesapla ───────────────────────────────────────── */
    function recalcPrice() {
        if (!branchInput || !totalPriceDisplay) return;

        const count      = Math.max(1, Math.min(50, parseInt(branchInput.value) || 1));
        branchInput.value = count;

        const single  = parseFloat(cfg.singlePrice)     || 0;
        const perBr   = parseFloat(cfg.perBranchPrice)  || 0;
        let   total;

        if (count <= 1) {
            total = single;
            if (extraBranchRow) extraBranchRow.style.display = 'none';
        } else {
            const extra = (count - 1) * perBr;
            total = single + extra;
            if (extraBranchRow) {
                extraBranchRow.style.display = '';
                if (extraBranchLabel) extraBranchLabel.textContent = (count - 1) + ' ' + (cfg.i18n?.extraBranches || 'Extra Branch(es)');
                if (extraBranchPrice) extraBranchPrice.textContent = fmtCurrency(extra);
            }
        }

        if (totalPriceDisplay) totalPriceDisplay.textContent = fmtCurrency(total);
    }

    /* ── Şube +/- Butonları ──────────────────────────────────── */
    if (branchDec) {
        branchDec.addEventListener('click', () => {
            const v = parseInt(branchInput?.value || 1);
            if (branchInput && v > 1) { branchInput.value = v - 1; recalcPrice(); }
        });
    }

    if (branchInc) {
        branchInc.addEventListener('click', () => {
            const v = parseInt(branchInput?.value || 1);
            if (branchInput && v < 50) { branchInput.value = v + 1; recalcPrice(); }
        });
    }

    if (branchInput) {
        branchInput.addEventListener('input', recalcPrice);
        branchInput.addEventListener('change', () => {
            const v = Math.max(1, Math.min(50, parseInt(branchInput.value) || 1));
            branchInput.value = v;
            recalcPrice();
        });
    }

    // İlk yükleme fiyat hesabı
    recalcPrice();

    /* ── IBAN Kopyala ────────────────────────────────────────── */
    if (copyIbanBtn && ibanText) {
        copyIbanBtn.addEventListener('click', async () => {
            const iban = ibanText.textContent.trim();
            try {
                await navigator.clipboard.writeText(iban.replace(/\s/g, ''));
                copyIbanBtn.innerHTML = '<i class="fas fa-check text-success"></i>';
                showToast(cfg.i18n?.ibanCopied || 'IBAN copied!', 'success');
                setTimeout(() => {
                    copyIbanBtn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            } catch {
                showToast(cfg.i18n?.copyFailed || 'Copy failed.', 'danger');
            }
        });
    }

    /* ── Dosya Yükleme Alanı ─────────────────────────────────── */
    if (uploadArea && proofFileInput) {

        // Tıklama
        uploadArea.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            proofFileInput.click();
        });

        // Drag & Drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files?.length) {
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // Input değişimi
        proofFileInput.addEventListener('change', () => {
            if (proofFileInput.files?.length) {
                handleFileSelect(proofFileInput.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        const maxSize = 10 * 1024 * 1024;
        const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'];

        if (file.size > maxSize) {
            showToast(cfg.i18n?.fileTooLarge || "File size cannot exceed 10 MB.", 'danger');
            return;
        }
        if (!allowed.includes(file.type)) {
            showToast(cfg.i18n?.invalidFormat || 'Unsupported file format.', 'danger');
            return;
        }

        // Preview göster
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
        if (uploadPreview) {
            uploadPreview.style.display = '';
            if (uploadFileName) uploadFileName.textContent = file.name;
            if (uploadFileSize) uploadFileSize.textContent = fmtFileSize(file.size);
        }
        if (uploadArea) uploadArea.classList.add('has-file');
    }

    /* ── Ödeme Bildirimi Gönder ──────────────────────────────── */
    if (submitPaymentBtn) {
        submitPaymentBtn.addEventListener('click', async () => {
            const branchCount = parseInt(branchInput?.value || 1);
            const note        = paymentNote?.value?.trim() || '';
            const proofFile   = proofFileInput?.files?.[0] || null;

            // Yükleme göstergesi
            submitPaymentBtn.disabled = true;
            submitPaymentBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${cfg.i18n?.submitting || 'Sending...'}`;
            if (submitResult) submitResult.innerHTML = '';

            const formData = new FormData();
            formData.append('action', 'submitPayment');
            formData.append('branch_count', branchCount);
            if (note) formData.append('note', note);
            if (proofFile) formData.append('payment_proof', proofFile);

            try {
                const resp = await fetch(cfg.actionsUrl, {
                    method: 'POST',
                    body:   formData,
                });
                const data = await resp.json();

                if (data.success) {
                    const successMsg = data.message || cfg.i18n?.paymentSent || 'Payment notification received!';
                    showToast(successMsg, 'success');
                    if (submitResult) {
                        submitResult.innerHTML = `
                            <div class="alert alert-success d-flex align-items-center gap-2">
                                <i class="fas fa-check-circle"></i>
                                <span>${escHtml(successMsg)}</span>
                            </div>`;
                    }
                    // 2 saniye sonra sayfayı yenile
                    setTimeout(() => location.reload(), 2200);
                } else {
                    const errMsg = data.message || cfg.i18n?.paymentError || 'An error occurred.';
                    showToast(errMsg, 'danger');
                    if (submitResult) {
                        submitResult.innerHTML = `
                            <div class="alert alert-danger d-flex align-items-center gap-2">
                                <i class="fas fa-exclamation-circle"></i>
                                <span>${escHtml(errMsg)}</span>
                            </div>`;
                    }
                    submitPaymentBtn.disabled = false;
                    submitPaymentBtn.innerHTML = `<i class="fas fa-paper-plane me-2"></i>${cfg.i18n?.submitBtn || 'Notify Payment'}`;
                }
            } catch (err) {
                const srvErr = cfg.i18n?.serverError || 'Server connection error.';
                showToast(srvErr, 'danger');
                if (submitResult) {
                    submitResult.innerHTML = `<div class="alert alert-danger">${escHtml(srvErr)}</div>`;
                }
                submitPaymentBtn.disabled = false;
                submitPaymentBtn.innerHTML = `<i class="fas fa-paper-plane me-2"></i>${cfg.i18n?.submitBtn || 'Notify Payment'}`;
            }
        });
    }

    /* ── Ödeme Geçmişi Yenile ────────────────────────────────── */
    if (loadAllHistoryBtn && historyContainer) {
        loadAllHistoryBtn.addEventListener('click', async () => {
            loadAllHistoryBtn.disabled = true;
            loadAllHistoryBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>${cfg.i18n?.historyRefreshing || 'Loading...'}`;

            try {
                const resp = await fetch(cfg.actionsUrl + '?action=getHistory');
                const data = await resp.json();

                if (data.success) {
                    renderPaymentHistory(data.payments);
                    showToast(cfg.i18n?.historyUpdated || 'Payment history updated.', 'success');
                } else {
                    showToast(data.message || cfg.i18n?.historyLoadFailed || 'Could not load history.', 'danger');
                }
            } catch {
                showToast(cfg.i18n?.connectionError || 'Connection error.', 'danger');
            } finally {
                loadAllHistoryBtn.disabled = false;
                loadAllHistoryBtn.innerHTML = `<i class="fas fa-sync-alt me-1"></i>${cfg.i18n?.historyRefresh || 'Refresh'}`;
            }
        });
    }

    /* ── Ödeme Geçmişi Render ────────────────────────────────── */
    function renderPaymentHistory(payments) {
        if (!historyContainer) return;

        if (!payments || payments.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state py-5 text-center">
                    <i class="fas fa-receipt fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">${escHtml(cfg.i18n?.historyEmpty || 'No payment records yet')}</h6>
                </div>`;
            return;
        }

        const statusMap = {
            pending:  { badge: 'warning text-dark', label: cfg.i18n?.payPending  || 'Pending',   icon: 'fa-hourglass-half' },
            approved: { badge: 'success',           label: cfg.i18n?.payApproved || 'Approved',  icon: 'fa-check-circle'  },
            rejected: { badge: 'danger',            label: cfg.i18n?.payRejected || 'Rejected',  icon: 'fa-times-circle'  },
        };

        const rows = payments.map(p => {
            const s   = statusMap[p.status] || { badge: 'secondary', label: p.status, icon: 'fa-question' };
            const dt  = new Date(p.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const proofCell = p.payment_proof
                ? `<a href="/${escHtml(p.payment_proof)}" target="_blank" class="btn btn-sm btn-outline-info py-0">
                       <i class="fas fa-file-image me-1"></i>${escHtml(cfg.i18n?.viewReceipt || 'View')}
                   </a>`
                : '<span class="text-muted">—</span>';
            const approvedDt = p.approved_at
                ? `<div class="text-muted small">${new Date(p.approved_at).toLocaleDateString('tr-TR')}</div>` : '';

            return `<tr>
                <td class="text-muted small">#${p.id}</td>
                <td class="small">${dt}</td>
                <td>${p.branch_count} ${escHtml(cfg.i18n?.branchUnit || 'branch(es)')}</td>
                <td><strong>${parseFloat(p.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${escHtml(cfg.currency)}</strong></td>
                <td>
                    <span class="badge bg-${s.badge}"><i class="fas ${s.icon} me-1"></i>${s.label}</span>
                    ${approvedDt}
                </td>
                <td class="small text-muted">${p.admin_note ? escHtml(p.admin_note) : '—'}</td>
                <td>${proofCell}</td>
            </tr>`;
        }).join('');

        const i = cfg.i18n || {};
        historyContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>${escHtml(i.histColId || '#')}</th>
                            <th>${escHtml(i.histColDate || 'Date')}</th>
                            <th>${escHtml(i.histColBranch || 'Branch')}</th>
                            <th>${escHtml(i.histColAmount || 'Amount')}</th>
                            <th>${escHtml(i.histColStatus || 'Status')}</th>
                            <th>${escHtml(i.histColNote || 'Admin Note')}</th>
                            <th>${escHtml(i.histColReceipt || 'Receipt')}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    }

    /* ── HTML Escape ─────────────────────────────────────────── */
    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

})();