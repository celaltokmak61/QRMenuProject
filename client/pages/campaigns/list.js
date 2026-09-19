var currentCampaignId = null;
var modal = null;

document.addEventListener('DOMContentLoaded', () => {
    modal = new bootstrap.Modal(document.getElementById('campaignModal'));

    document.getElementById('campaignImage')?.addEventListener('change', function () {
        const file = this.files[0];
        if (!file) return;
        const preview = document.getElementById('imgPreview');
        const placeholder = document.getElementById('imgPlaceholder');
        preview.src = URL.createObjectURL(file);
        preview.classList.remove('d-none');
        placeholder.classList.add('d-none');
    });
});

function openCreateModal() {
    currentCampaignId = null;
    document.getElementById('modalTitle').textContent = 'Yeni Kampanya';
    document.getElementById('formAction').value = 'create';
    document.getElementById('campaignId').value = '';
    document.getElementById('campaignForm').reset();
    document.getElementById('imgPreview').classList.add('d-none');
    document.getElementById('imgPlaceholder').classList.remove('d-none');
    document.getElementById('linkProduct').classList.add('d-none');
    document.getElementById('linkCategory').classList.add('d-none');
    document.getElementById('isActive').checked = true;
    modal.show();
}

function openEditModal(c) {
    currentCampaignId = c.id;
    document.getElementById('modalTitle').textContent = 'Kampanyayı Düzenle';
    document.getElementById('formAction').value = 'update';
    document.getElementById('campaignId').value = c.id;
    document.getElementById('campTitle').value = c.title || '';
    document.getElementById('campDesc').value = c.description || '';
    document.getElementById('campPrice').value = c.price || '';
    document.getElementById('campBtn').value = c.button_text || '';
    document.getElementById('campBranch').value = c.branch_id || '';
    document.getElementById('campOrder').value = c.sort_order || 0;
    document.getElementById('isPopup').checked = c.is_popup == 1;
    document.getElementById('isActive').checked = c.is_active == 1;
    document.getElementById('linkType').value = c.link_type || 'none';
    updateLinkSelect();

    if (c.link_type === 'product') {
        document.getElementById('linkProduct').value = c.link_id || '';
    } else if (c.link_type === 'category') {
        document.getElementById('linkCategory').value = c.link_id || '';
    }

    // Resim önizleme
    const preview = document.getElementById('imgPreview');
    const placeholder = document.getElementById('imgPlaceholder');
    if (c.image_path) {
        preview.src = SITE_URL + '/' + c.image_path;
        preview.classList.remove('d-none');
        placeholder.classList.add('d-none');
    } else {
        preview.classList.add('d-none');
        placeholder.classList.remove('d-none');
    }

    // Çeviri alanlarını doldur
    try {
        const trans = c.translations ? JSON.parse(c.translations) : {};
        document.querySelectorAll('[name^="trans["]').forEach(el => {
            const m = el.name.match(/trans\[(\w+)\]\[(\w+)\]/);
            if (m && trans[m[1]]) {
                el.value = trans[m[1]][m[2]] || '';
            }
        });
    } catch (e) {}

    modal.show();
}

function updateLinkSelect() {
    const lt = document.getElementById('linkType').value;
    document.getElementById('linkProduct').classList.toggle('d-none', lt !== 'product');
    document.getElementById('linkCategory').classList.toggle('d-none', lt !== 'category');
}

function switchLangTab(code, btn) {
    document.querySelectorAll('.lang-tab-pane').forEach(p => p.classList.add('d-none'));
    document.querySelectorAll('#langTabs .nav-link').forEach(b => b.classList.remove('active'));
    document.getElementById('lang-' + code).classList.remove('d-none');
    btn.classList.add('active');
}

function saveCampaign() {
    const form = document.getElementById('campaignForm');
    const fd = new FormData(form);

    // checkbox değerleri
    fd.set('is_popup', document.getElementById('isPopup').checked ? 1 : 0);
    fd.set('is_active', document.getElementById('isActive').checked ? 1 : 0);

    // link_id
    const lt = fd.get('link_type');
    if (lt === 'product') fd.set('link_id', fd.get('link_product') || 0);
    else if (lt === 'category') fd.set('link_id', fd.get('link_category') || 0);
    else fd.set('link_id', 0);

    // translations json
    const trans = {};
    document.querySelectorAll('[name^="trans["]').forEach(el => {
        const m = el.name.match(/trans\[(\w+)\]\[(\w+)\]/);
        if (m && el.value.trim()) {
            if (!trans[m[1]]) trans[m[1]] = {};
            trans[m[1]][m[2]] = el.value.trim();
        }
    });
    fd.set('translations', JSON.stringify(trans));

    const btn = document.getElementById('saveBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    fetch(ACTIONS_URL, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                modal.hide();
                showAlert(res.message, 'success');
                setTimeout(() => location.reload(), 800);
            } else {
                showAlert(res.message, 'danger');
            }
        })
        .catch(() => showAlert('Sunucu hatası', 'danger'))
        .finally(() => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save me-1"></i>Kaydet';
        });
}

function toggleActive(id, newVal) {
    const fd = new FormData();
    fd.append('action', 'toggle');
    fd.append('id', id);
    fd.append('field', 'is_active');
    fetch(ACTIONS_URL, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(res => {
            if (res.success) { showAlert('Güncellendi', 'success'); setTimeout(() => location.reload(), 600); }
        });
}

function deleteCampaign(id, title) {
    if (!confirm(`"${title}" kampanyasını silmek istediğinize emin misiniz?`)) return;
    const fd = new FormData();
    fd.append('action', 'delete');
    fd.append('id', id);
    fetch(ACTIONS_URL, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                showAlert(res.message, 'success');
                document.querySelector(`[data-campaign-id="${id}"]`)?.remove();
            } else {
                showAlert(res.message, 'danger');
            }
        });
}

function autoTranslate() {
    const title = document.getElementById('campTitle').value.trim();
    const desc  = document.getElementById('campDesc').value.trim();
    const btn   = document.getElementById('campBtn').value.trim();

    if (!title) { showAlert('Önce başlık girin', 'warning'); return; }

    document.querySelectorAll('.lang-tab-pane').forEach(pane => {
        const langCode = pane.id.replace('lang-', '');
        const titleInput = pane.querySelector('[name$="[title]"]');
        const descInput  = pane.querySelector('[name$="[description]"]');
        const btnInput   = pane.querySelector('[name$="[button_text]"]');

        if (titleInput && !titleInput.value) {
            fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${langCode}&dt=t&q=${encodeURIComponent(title)}`)
                .then(r => r.json()).then(d => { if (d[0]?.[0]?.[0]) titleInput.value = d[0][0][0]; }).catch(() => {});
        }
        if (descInput && !descInput.value && desc) {
            fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${langCode}&dt=t&q=${encodeURIComponent(desc)}`)
                .then(r => r.json()).then(d => { if (d[0]?.[0]?.[0]) descInput.value = d[0][0][0]; }).catch(() => {});
        }
        if (btnInput && !btnInput.value && btn) {
            fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${langCode}&dt=t&q=${encodeURIComponent(btn)}`)
                .then(r => r.json()).then(d => { if (d[0]?.[0]?.[0]) btnInput.value = d[0][0][0]; }).catch(() => {});
        }
    });

    showAlert('Çeviri uygulandı', 'success');
}

function showAlert(msg, type) {
    const box = document.getElementById('alertBox');
    box.className = `alert alert-${type} alert-dismissible fade show`;
    box.innerHTML = `${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    box.classList.remove('d-none');
    setTimeout(() => box.classList.add('d-none'), 4000);
}