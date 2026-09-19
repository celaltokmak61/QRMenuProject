/**
 * Kategori Yönetimi - JavaScript
 * AJAX CRUD işlemleri, Drag & Drop, Modal yönetimi
 */

// Global değişkenler
let categoryModal, branchModal;
let sortable;
let currentView = 'card';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Modal'ları başlat
    categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    branchModal = new bootstrap.Modal(document.getElementById('branchModal'));
    
    // Drag & Drop'u başlat
    initializeSortable();
    
    // Resim önizleme
    setupImagePreviews();
    
    // BUG 29 Fix: Custom file input metinlerini çeviriye göre yükle
    setupCustomFileInputs();
    
    // View başlangıç durumu
    const savedView = localStorage.getItem('categoriesView') || 'card';
    switchView(savedView);
});

/**
 * View Switch (Card/List)
 */
function switchView(view) {
    currentView = view;
    
    const cardContainer = document.getElementById('categoriesContainer');
    const listContainer = document.getElementById('listViewContainer');
    const cardBtn = document.getElementById('cardViewBtn');
    const listBtn = document.getElementById('listViewBtn');
    
    if (!cardBtn || !listBtn) return;
    
    if (view === 'card') {
        cardContainer.style.display = 'flex';
        if (listContainer) listContainer.style.display = 'none';
        cardBtn.classList.add('active');
        listBtn.classList.remove('active');
        
        if (sortable) {
            sortable.option('disabled', false);
        }
    } else {
        cardContainer.style.display = 'none';
        if (listContainer) listContainer.style.display = 'block';
        cardBtn.classList.remove('active');
        listBtn.classList.add('active');
        
        if (sortable) {
            sortable.option('disabled', true);
        }
    }
    
    localStorage.setItem('categoriesView', view);
}

/**
 * Drag & Drop Sıralama - SortableJS
 */
function initializeSortable() {
    const container = document.getElementById('categoriesContainer');
    
    if (!container || container.children.length === 0) {
        return;
    }
    
    sortable = new Sortable(container, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'dragging',
        dragClass: 'drag-over',
        onEnd: function(evt) {
            updateCategoryOrder();
        }
    });
}

/**
 * Kategori Sıralama Güncelleme
 */
function updateCategoryOrder() {
    const items = document.querySelectorAll('.category-item');
    const order = Array.from(items).map(item => item.dataset.id);
    
    fetch('actions.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=update_order&order=${JSON.stringify(order)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', data.message);
        } else {
            showAlert('danger', data.message);
        }
    })
    .catch(error => {
        showAlert('danger', (window.langStrings && window.langStrings.err_sort) || 'Sıralama güncellenirken hata oluştu');
        console.error('Error:', error);
    });
}

/**
 * Yeni Kategori Modal Aç
 */
function openAddModal() {
    document.getElementById('modalTitle').textContent = (window.langStrings && window.langStrings.modal_add_title) || 'Yeni Kategori';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('bannerPreview').innerHTML = '';

    // BUG 29 Fix: Modal sıfırlanınca custom dosya adı etiketlerini de sıfırla
    const noFileTxt = (window.langStrings && window.langStrings.file_no_selection) || 'Dosya seçilmedi';
    const catImgName    = document.getElementById('categoryImage_name');
    const bannerImgName = document.getElementById('bannerImage_name');
    if (catImgName)    catImgName.textContent    = noFileTxt;
    if (bannerImgName) bannerImgName.textContent = noFileTxt;
}

/**
 * Kategori Düzenle
 */
function editCategory(id) {
    fetch(`actions.php?action=get&id=${id}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const cat = data.category;
            
            document.getElementById('modalTitle').textContent = (window.langStrings && window.langStrings.modal_edit_title) || 'Kategori Düzenle';
            document.getElementById('categoryId').value = cat.id;
            document.getElementById('nameKey').value = cat.name_key;
            document.getElementById('descriptionKey').value = cat.description_key || '';
            document.getElementById('descriptionDisplay').value = cat.description_display;
            document.getElementById('isActive').checked = cat.is_active == 1;

            // BUG 29 Fix: Düzenleme modalı açılınca dosya adı etiketlerini sıfırla
            const noFileTxt = (window.langStrings && window.langStrings.file_no_selection) || 'Dosya seçilmedi';
            const catImgName    = document.getElementById('categoryImage_name');
            const bannerImgName = document.getElementById('bannerImage_name');
            if (catImgName)    catImgName.textContent    = noFileTxt;
            if (bannerImgName) bannerImgName.textContent = noFileTxt;
            
            // Grid boyutunu seç (grid_span)
            const gridSpanEl = document.getElementById('gridSpan');
            if (gridSpanEl) {
                gridSpanEl.value = cat.grid_span || 'normal';
            }
            
            if (cat.image_path) {
                const curImg = (window.langStrings && window.langStrings.current_image) || 'Mevcut resim (yeni yüklerseniz değişir)';
                document.getElementById('imagePreview').innerHTML =
                    `<img src="/${cat.image_path}" alt="Mevcut resim">
                     <p class="text-muted small mt-1">${curImg}</p>`;
            }
            
            if (cat.banner_path) {
                const curBanner = (window.langStrings && window.langStrings.current_banner) || 'Mevcut banner (yeni yüklerseniz değişir)';
                document.getElementById('bannerPreview').innerHTML =
                    `<img src="/${cat.banner_path}" alt="Mevcut banner">
                     <p class="text-muted small mt-1">${curBanner}</p>`;
            }
            
            categoryModal.show();
        } else {
            showAlert('danger', data.message);
        }
    })
    .catch(error => {
        showAlert('danger', (window.langStrings && window.langStrings.err_fetch_category) || 'Kategori bilgileri alınırken hata oluştu');
        console.error('Error:', error);
    });
}

/**
 * Kategori Sil
 */
function deleteCategory(id) {
    if (!confirm((window.langStrings && window.langStrings.confirm_delete) || 'Bu kategoriyi silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    fetch('actions.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=delete&category_id=${id}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', data.message);
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert('danger', data.message);
        }
    })
    .catch(error => {
        showAlert('danger', (window.langStrings && window.langStrings.err_delete) || 'Silme işlemi sırasında hata oluştu');
        console.error('Error:', error);
    });
}

/**
 * Şube Yönetimi Modal Aç
 */
function manageBranches(categoryId) {
    document.getElementById('branchCategoryId').value = categoryId;
    
    // Önce tüm checkbox'ları temizle
    document.querySelectorAll('.branch-checkbox').forEach(cb => cb.checked = false);
    
    fetch(`actions.php?action=get_branches&category_id=${categoryId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Sadece aktif şubeleri işaretle (is_active = 1 olanlar)
            data.branches.forEach(branch => {
                if (branch.is_active == 1) {
                    const checkbox = document.querySelector(`.branch-checkbox[value="${branch.branch_id}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }
            });
            
            branchModal.show();
        } else {
            showAlert('danger', data.message);
        }
    })
    .catch(error => {
        showAlert('danger', (window.langStrings && window.langStrings.err_fetch_branch) || 'Şube bilgileri alınırken hata oluştu');
        console.error('Error:', error);
    });
}

/**
 * Form Submit
 */
document.getElementById('categoryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const categoryId = document.getElementById('categoryId').value;
    
    formData.append('action', categoryId ? 'update' : 'create');
    
    const isActive = document.getElementById('isActive').checked ? '1' : '0';
    formData.set('is_active', isActive);
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const savingTxt = (window.langStrings && window.langStrings.saving) || 'Kaydediliyor...';
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${savingTxt}`;
    
    fetch('actions.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(text => {
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Sunucu JSON dışı yanıt döndürdü:', text);
            showAlert('danger', (window.langStrings && window.langStrings.err_server) || 'Sunucu hatası oluştu. Lütfen tekrar deneyin.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>' + ((window.langStrings && window.langStrings.btn_save) || 'Kaydet');
            return;
        }
        if (data.success) {
            showAlert('success', data.message);
            categoryModal.hide();
            setTimeout(() => location.reload(), 1500);
        } else {
            showAlert('danger', data.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>' + ((window.langStrings && window.langStrings.btn_save) || 'Kaydet');
        }
    })
    .catch(error => {
        showAlert('danger', (window.langStrings && window.langStrings.err_network) || 'Ağ hatası oluştu. İnternet bağlantınızı kontrol edin.');
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>' + ((window.langStrings && window.langStrings.btn_save) || 'Kaydet');
    });
});

/**
 * Şube Atamaları Kaydet
 * Basitleştirilmiş sistem: Checked = aktif (is_active: 1), Unchecked = atanmamış
 */
function saveBranchAssignments() {
    const categoryId = document.getElementById('branchCategoryId').value;
    const branches = [];
    
    // Seçili şubeleri topla (checked olanlar otomatik olarak aktif)
    document.querySelectorAll('.branch-checkbox:checked').forEach(checkbox => {
        branches.push({
            branch_id: checkbox.value,
            is_active: 1  // Checked = her zaman aktif
        });
    });
    
    fetch('actions.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=save_branches&category_id=${categoryId}&branches=${JSON.stringify(branches)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', data.message);
            branchModal.hide();
        } else {
            showAlert('danger', data.message);
        }
    })
    .catch(error => {
        showAlert('danger', (window.langStrings && window.langStrings.err_save) || 'Kayıt sırasında hata oluştu');
        console.error('Error:', error);
    });
}

/**
 * BUG 29 Fix: Custom File Input — tarayıcı dilinden bağımsız metin gösterimi
 */
function setupCustomFileInputs() {
    const fileSelectTxt = (window.langStrings && window.langStrings.file_select_btn)  || 'Dosya Seç';
    const fileNoneTxt   = (window.langStrings && window.langStrings.file_no_selection) || 'Dosya seçilmedi';

    // Kategori resmi buton metni
    const categoryImageBtn  = document.getElementById('categoryImageBtn');
    const categoryImageName = document.getElementById('categoryImage_name');
    if (categoryImageBtn)  categoryImageBtn.innerHTML   = `<i class="fas fa-folder-open me-1"></i>${fileSelectTxt}`;
    if (categoryImageName) categoryImageName.textContent = fileNoneTxt;

    // Banner resmi buton metni
    const bannerImageBtn  = document.getElementById('bannerImageBtn');
    const bannerImageName = document.getElementById('bannerImage_name');
    if (bannerImageBtn)  bannerImageBtn.innerHTML   = `<i class="fas fa-folder-open me-1"></i>${fileSelectTxt}`;
    if (bannerImageName) bannerImageName.textContent = fileNoneTxt;
}

/**
 * Resim Önizleme İçin Event Listener'ları Ayarla
 */
function setupImagePreviews() {
    const categoryImageInput = document.getElementById('categoryImage');
    const bannerImageInput   = document.getElementById('bannerImage');
    
    if (categoryImageInput) {
        categoryImageInput.addEventListener('change', function() {
            // BUG 29 Fix: Seçilen dosya adını custom label'a yaz
            const nameEl    = document.getElementById('categoryImage_name');
            const noFileTxt = (window.langStrings && window.langStrings.file_no_selection) || 'Dosya seçilmedi';
            if (nameEl) nameEl.textContent = this.files[0] ? this.files[0].name : noFileTxt;

            if (this.files[0] && this.files[0].size > 5 * 1024 * 1024) {
                showAlert('danger', (window.langStrings && window.langStrings.cat_img_too_large) || 'Kategori resmi 5MB\'dan büyük olamaz!');
                this.value = '';
                if (nameEl) nameEl.textContent = noFileTxt;
                document.getElementById('imagePreview').innerHTML = '';
                return;
            }
            previewImage(this, 'imagePreview');
        });
    }
    
    if (bannerImageInput) {
        bannerImageInput.addEventListener('change', function() {
            // BUG 29 Fix: Seçilen dosya adını custom label'a yaz
            const nameEl    = document.getElementById('bannerImage_name');
            const noFileTxt = (window.langStrings && window.langStrings.file_no_selection) || 'Dosya seçilmedi';
            if (nameEl) nameEl.textContent = this.files[0] ? this.files[0].name : noFileTxt;

            if (this.files[0] && this.files[0].size > 5 * 1024 * 1024) {
                showAlert('danger', (window.langStrings && window.langStrings.banner_too_large) || 'Banner resmi 5MB\'dan büyük olamaz!');
                this.value = '';
                if (nameEl) nameEl.textContent = noFileTxt;
                document.getElementById('bannerPreview').innerHTML = '';
                return;
            }
            previewImage(this, 'bannerPreview');
        });
    }
}

/**
 * Resim Önizleme Göster
 */
function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Önizleme">`;
        };
        
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '';
    }
}

/**
 * Alert Göster
 * Modal açıksa hatayı modal içinde göster, değilse sayfada göster
 */
function showAlert(type, message) {
    const alertId = 'alert-' + Date.now();
    
    const alertEl = document.createElement('div');
    alertEl.id = alertId;
    alertEl.className = `alert alert-${type} alert-dismissible fade show`;
    alertEl.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Açık modal var mı kontrol et
    const openModal = document.querySelector('.modal.show');
    if (openModal) {
        const modalBody = openModal.querySelector('.modal-body');
        if (modalBody) {
            // Önceki hata alertini temizle
            const prev = modalBody.querySelector('.alert-modal-inline');
            if (prev) prev.remove();
            alertEl.classList.add('alert-modal-inline');
            alertEl.style.marginBottom = '1rem';
            modalBody.insertBefore(alertEl, modalBody.firstChild);
        } else {
            document.getElementById('alertContainer').appendChild(alertEl);
        }
    } else {
        document.getElementById('alertContainer').appendChild(alertEl);
    }
    
    setTimeout(() => {
        const el = document.getElementById(alertId);
        if (el) {
            try { new bootstrap.Alert(el).close(); } catch(e) { el.remove(); }
        }
    }, 5000);
}

/* ===================== TOPLU SİLME ===================== */
function toggleSelectAll(type) {
    const all = document.getElementById('selectAllCategories');
    document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = all.checked);
    updateBulkCount('category');
}

function updateBulkCount(type) {
    const checked = document.querySelectorAll('.category-checkbox:checked');
    const btn = document.getElementById('bulkDeleteCategoriesBtn');
    const cnt = document.getElementById('selectedCategoryCount');
    cnt.textContent = checked.length;
    btn.classList.toggle('d-none', checked.length === 0);
    const all = document.getElementById('selectAllCategories');
    const total = document.querySelectorAll('.category-checkbox').length;
    all.indeterminate = checked.length > 0 && checked.length < total;
    all.checked = total > 0 && checked.length === total;
}

function bulkDelete(type) {
    const checked = document.querySelectorAll('.category-checkbox:checked');
    if (checked.length === 0) return;
    if (!confirm(checked.length + ' kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

    const ids = Array.from(checked).map(cb => cb.value);
    const fd = new FormData();
    fd.append('action', 'bulk_delete');
    ids.forEach(id => fd.append('ids[]', id));

    fetch('actions.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                checked.forEach(cb => cb.closest('.category-item').remove());
                updateBulkCount('category');
                document.getElementById('selectAllCategories').checked = false;
                showAlert(data.message, 'success');
            } else {
                showAlert(data.message || 'Hata oluştu.', 'danger');
            }
        })
        .catch(() => showAlert('Bağlantı hatası.', 'danger'));
}

// ── Toplu Silme ──────────────────────────────────────────────
function toggleSelectAll(type) {
    const allCheck = document.getElementById('selectAllCategories');
    document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = allCheck.checked);
    updateBulkCount('category');
}

function updateBulkCount(type) {
    const checked = document.querySelectorAll('.category-checkbox:checked');
    const btn = document.getElementById('bulkDeleteCategoriesBtn');
    const count = document.getElementById('selectedCategoryCount');
    if (count) count.textContent = checked.length;
    if (btn) btn.classList.toggle('d-none', checked.length === 0);
}

function bulkDelete(type) {
    const checked = document.querySelectorAll('.category-checkbox:checked');
    if (!checked.length) return;
    if (!confirm(checked.length + ' kategoriyi silmek istediğinize emin misiniz?')) return;
    const ids = Array.from(checked).map(cb => cb.value);
    const fd = new FormData();
    fd.append('action', 'bulk_delete');
    ids.forEach(id => fd.append('ids[]', id));
    fetch('actions.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                showAlert(data.message || 'Hata.', 'danger');
            }
        })
        .catch(() => showAlert('Bağlantı hatası.', 'danger'));
}
