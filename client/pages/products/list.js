/**
 * Ürün Yönetimi - JavaScript
 * AJAX CRUD işlemleri, Drag & Drop, Fiyat Yönetimi, Alerjen Yönetimi
 */

// Global değişkenler
let productModal, priceModal;
let sortable;
let currentView = 'card';

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Modal'ları başlat
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    priceModal = new bootstrap.Modal(document.getElementById('priceModal'));
    
    // Drag & Drop'u başlat
    initializeSortable();
    
    // Resim önizleme
    setupImagePreviews();
    
    // BUG 29 Fix: Custom file input metinlerini çeviriye göre yükle
    setupCustomFileInputs();
    
    // View başlangıç durumu
    const savedView = localStorage.getItem('productsView') || 'card';
    switchView(savedView);
    
    // Hızlı düzenleme başlat
    initQuickEdit();
});

/**
 * Hızlı Düzenleme İşlevselliği
 */
function initQuickEdit() {
    // Resme tıklama - hızlı resim değiştir
    document.addEventListener('click', function(e) {
        const imageWrapper = e.target.closest('.product-image-quick-edit');
        if (imageWrapper) {
            const productId = imageWrapper.dataset.productId;
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/jpeg,image/jpg,image/png,image/webp';
            
            fileInput.onchange = async function(e) {
                const file = e.target.files[0];
                if (!file) return;
                
                // Dosya boyutu kontrolü
                if (file.size > 5 * 1024 * 1024) {
                    showAlert('danger', (window.langStrings && window.langStrings.img_too_large) || 'Ürün resmi 5MB\'dan büyük olamaz!');
                    return;
                }
                
                // Loading göster
                const img = imageWrapper.querySelector('img');
                const originalSrc = img.src;
                imageWrapper.classList.add('loading');
                
                try {
                    const formData = new FormData();
                    formData.append('action', 'quick_update_image');
                    formData.append('product_id', productId);
                    formData.append('product_image', file);
                    
                    const response = await fetch('actions.php', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const text = await response.text();
                    let result;
                    try {
                        result = JSON.parse(text);
                    } catch (parseErr) {
                        throw new Error((window.langStrings && window.langStrings.invalid_response) || 'Sunucu geçersiz yanıt döndürdü');
                    }
                    
                    if (result.success) {
                        // Yeni resmi göster (cache-busting için timestamp ekle)
                        img.src = '../../../' + result.image_path + '?t=' + Date.now();
                        showAlert('success', result.message);
                    } else {
                        img.src = originalSrc;
                        showAlert('danger', result.message || 'Resim güncellenemedi');
                    }
                } catch (error) {
                    img.src = originalSrc;
                    showAlert('danger', 'Bir hata oluştu');
                    console.error('Quick update image error:', error);
                } finally {
                    imageWrapper.classList.remove('loading');
                }
            };
            
            fileInput.click();
        }
    });
    
    // Fiyata tıklama - hızlı fiyat değiştir (TÜM ŞUBELER)
    document.addEventListener('click', function(e) {
        const priceElement = e.target.closest('.product-price-quick-edit');
        if (priceElement && !priceElement.classList.contains('editing')) {
            const productId = priceElement.dataset.productId;
            const currentPrice = priceElement.dataset.price || '0';
            
            // Input oluştur
            const input = document.createElement('input');
            input.type = 'number';
            input.step = '0.01';
            input.min = '0';
            input.value = currentPrice;
            input.className = 'form-control form-control-sm price-quick-input';
            input.placeholder = (window.langStrings && window.langStrings.price_hint) || 'Tüm şubeler için fiyat';
            
            // Mevcut içeriği sakla
            const originalContent = priceElement.innerHTML;
            
            // Input'u yerleştir
            priceElement.innerHTML = '';
            priceElement.appendChild(input);
            priceElement.classList.add('editing');
            input.focus();
            input.select();
            
            // Kaydetme fonksiyonu
            const savePrice = async function() {
                const newPrice = parseFloat(input.value) || 0;
                
                if (newPrice < 0) {
                    showAlert('danger', (window.langStrings && window.langStrings.price_negative) || 'Fiyat negatif olamaz');
                    return;
                }
                
                try {
                    const formData = new FormData();
                    formData.append('action', 'quick_update_price');
                    formData.append('product_id', productId);
                    formData.append('price', newPrice);
                    
                    const response = await fetch('actions.php', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Yeni fiyatı göster - virgüllü format
                        const formattedPrice = parseFloat(result.price).toLocaleString('tr-TR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                        priceElement.dataset.price = result.price;
                        priceElement.innerHTML = `<i class="fas fa-tag me-1"></i>${formattedPrice} ₺`;
                        priceElement.classList.remove('editing');
                        
                        // Başarı mesajı - kaç şubede güncellendi
                        showAlert('success', result.message);
                    } else {
                        priceElement.innerHTML = originalContent;
                        priceElement.classList.remove('editing');
                        showAlert('danger', result.message || 'Fiyat güncellenemedi');
                    }
                } catch (error) {
                    priceElement.innerHTML = originalContent;
                    priceElement.classList.remove('editing');
                    showAlert('danger', 'Bir hata oluştu');
                    console.error('Quick update price error:', error);
                }
            };
            
            // Enter ile kaydet
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    savePrice();
                } else if (e.key === 'Escape') {
                    priceElement.innerHTML = originalContent;
                    priceElement.classList.remove('editing');
                }
            });
            
            // Blur ile kaydet
            input.addEventListener('blur', function() {
                setTimeout(savePrice, 100);
            });
        }
    });
}

/**
 * Kategori Filtresi
 */
function filterByCategory(categoryId) {
    filterProducts();
}

function filterProducts() {
    const search = (document.getElementById('productSearch')?.value || '').toLowerCase().trim();
    const categoryId = parseInt(document.getElementById('categoryFilter')?.value || '0');

    // Kart görünümü
    document.querySelectorAll('#productsContainer .col-md-4, #productsContainer .col-sm-6').forEach(card => {
        const name = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
        const cat  = parseInt(card.dataset.categoryId || '0');
        const matchSearch = !search || name.includes(search);
        const matchCat    = !categoryId || cat === categoryId;
        card.style.display = (matchSearch && matchCat) ? '' : 'none';
    });

    // Liste görünümü
    document.querySelectorAll('#listViewContainer tbody tr').forEach(row => {
        const name = (row.querySelector('td:first-child')?.textContent || '').toLowerCase();
        const cat  = parseInt(row.dataset.categoryId || '0');
        const matchSearch = !search || name.includes(search);
        const matchCat    = !categoryId || cat === categoryId;
        row.style.display = (matchSearch && matchCat) ? '' : 'none';
    });
}

/**
 * View Switch (Card/List)
 */
function switchView(view) {
    currentView = view;
    
    const cardContainer = document.getElementById('productsContainer');
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
    
    localStorage.setItem('productsView', view);
}

/**
 * Drag & Drop Sıralama - SortableJS
 */
function initializeSortable() {
    const container = document.getElementById('productsContainer');
    
    if (!container || container.children.length === 0) {
        return;
    }
    
    sortable = new Sortable(container, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'dragging',
        dragClass: 'drag-over',
        onEnd: function(evt) {
            updateProductOrder();
        }
    });
}

/**
 * Ürün Sıralama Güncelleme
 */
function updateProductOrder() {
    const items = document.querySelectorAll('.product-item');
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
 * Yeni Ürün Modal Aç
 */
function openAddModal() {
    document.getElementById('modalTitle').textContent = (window.langStrings && window.langStrings.modal_add_title) || MODAL_TITLE_ADD || 'Yeni Ürün';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    
    // BUG 29 Fix: Modal sıfırlanınca custom dosya adı etiketini de sıfırla
    const noFileTxt = (window.langStrings && window.langStrings.file_no_selection) || 'Dosya seçilmedi';
    const productImageName = document.getElementById('productImage_name');
    if (productImageName) productImageName.textContent = noFileTxt;
    
    // Alerjen checkbox'larını temizle
    document.querySelectorAll('.allergen-checkbox').forEach(cb => {
        cb.checked = false;
    });
    
    // Gıda Mevzuatı checkbox'larını sıfırla
    document.getElementById('isAlcohol').checked = false;
    document.getElementById('isPork').checked = false;
}

/**
 * Ürün Düzenle
 */
function editProduct(id) {
    fetch(`actions.php?action=get&id=${id}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const product = data.product;
            
            document.getElementById('modalTitle').textContent = (window.langStrings && window.langStrings.modal_edit_title) || MODAL_TITLE_EDIT || 'Ürün Düzenle';
            
            // BUG 29 Fix: Düzenleme modalı açılınca dosya adı etiketini sıfırla
            const noFileTxtEdit = (window.langStrings && window.langStrings.file_no_selection) || 'Dosya seçilmedi';
            const prodImgName = document.getElementById('productImage_name');
            if (prodImgName) prodImgName.textContent = noFileTxtEdit;
            
            document.getElementById('productId').value = product.id;
            document.getElementById('categoryId').value = product.category_id;
            document.getElementById('nameKey').value = product.name_key;
            document.getElementById('descriptionKey').value = product.description_key || '';
            document.getElementById('ingredientsKey').value = product.ingredients_key || '';
            document.getElementById('calories').value = product.calories || '';
            document.getElementById('infoDisplay').value = product.info_display;
            document.getElementById('isActive').checked = product.is_active == 1;
            document.getElementById('isAlcohol').checked = product.is_alcohol == 1;
            document.getElementById('isPork').checked = product.is_pork == 1;
            
            // Alerjen checkbox'larını işaretle
            document.querySelectorAll('.allergen-checkbox').forEach(cb => {
                cb.checked = false;
            });
            
            if (product.allergens) {
                try {
                    const allergens = JSON.parse(product.allergens);
                    allergens.forEach(allergen => {
                        const checkbox = document.getElementById('allergen_' + allergen);
                        if (checkbox) {
                            checkbox.checked = true;
                        }
                    });
                } catch (e) {
                    console.error('Alerjen parse hatası:', e);
                }
            }
            
            // Mevcut resmi göster
            if (product.image_path) {
                const curImg = (window.langStrings && window.langStrings.current_image) || 'Mevcut resim (yeni yüklerseniz değişir)';
                document.getElementById('imagePreview').innerHTML =
                    `<img src="/${product.image_path}" alt="Mevcut resim">
                     <p class="text-muted small mt-1">${curImg}</p>`;
            }
            
            productModal.show();
        } else {
            showAlert('danger', data.message);
        }
    })
    .catch(error => {
        showAlert('danger', (window.langStrings && window.langStrings.err_fetch_product) || 'Ürün bilgileri alınırken hata oluştu');
        console.error('Error:', error);
    });
}

/**
 * Ürün Sil
 */
function deleteProduct(id) {
    if (!confirm((window.langStrings && window.langStrings.confirm_delete) || 'Bu ürünü silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    fetch('actions.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=delete&product_id=${id}`
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
 * Fiyat Yönetimi Modal Aç
 */
function managePrices(productId) {
    document.getElementById('priceProductId').value = productId;
    
    // Tüm fiyatları temizle
    document.querySelectorAll('.branch-price-active').forEach(cb => cb.checked = false);
    document.querySelectorAll('.branch-price-input').forEach(input => input.value = '');
    
    // Mevcut fiyatları getir
    fetch(`actions.php?action=get_prices&product_id=${productId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            data.prices.forEach(price => {
                const activeCheckbox = document.querySelector(`.branch-price-active[data-branch-id="${price.branch_id}"]`);
                const priceInput = document.querySelector(`.branch-price-input[data-branch-id="${price.branch_id}"]`);
                
                if (activeCheckbox && priceInput) {
                    activeCheckbox.checked = price.is_active == 1;
                    priceInput.value = price.price;
                }
            });
            
            priceModal.show();
        } else {
            showAlert('danger', data.message);
        }
    })
    .catch(error => {
        showAlert('danger', (window.langStrings && window.langStrings.err_fetch_price) || 'Fiyat bilgileri alınırken hata oluştu');
        console.error('Error:', error);
    });
}

/**
 * Fiyatları Kaydet
 */
function savePrices() {
    const productId = document.getElementById('priceProductId').value;
    const prices = [];
    
    document.querySelectorAll('.branch-price-active').forEach(checkbox => {
        const branchId = checkbox.dataset.branchId;
        const priceInput = document.querySelector(`.branch-price-input[data-branch-id="${branchId}"]`);
        const isActive = checkbox.checked;
        const price = priceInput.value;
        
        if (isActive && price) {
            prices.push({
                branch_id: branchId,
                price: price,
                is_active: 1
            });
        }
    });
    
    fetch('actions.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=save_prices&product_id=${productId}&prices=${JSON.stringify(prices)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('success', data.message);
            priceModal.hide();
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
 * Form Submit
 */
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const productId = document.getElementById('productId').value;
    
    formData.append('action', productId ? 'update' : 'create');
    
    // is_active değeri
    const isActive = document.getElementById('isActive').checked ? '1' : '0';
    formData.set('is_active', isActive);
    
    // Alerjen bilgilerini topla
    const allergens = [];
    document.querySelectorAll('.allergen-checkbox:checked').forEach(cb => {
        allergens.push(cb.value);
    });
    formData.append('allergens', JSON.stringify(allergens));
    
    // Varsayılan fiyat (sadece yeni ürün eklerken)
    if (!productId) {
        const defaultPrice = document.getElementById('defaultPrice').value;
        if (defaultPrice) {
            formData.append('default_price', defaultPrice);
        }
    }
    
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
            productModal.hide();
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
 * BUG 29 Fix: Custom File Input — tarayıcı dilinden bağımsız metin gösterimi
 */
function setupCustomFileInputs() {
    const fileSelectTxt  = (window.langStrings && window.langStrings.file_select_btn)   || 'Dosya Seç';
    const fileNoneTxt    = (window.langStrings && window.langStrings.file_no_selection)  || 'Dosya seçilmedi';

    // Ürün resmi custom buton metni
    const productImageBtn  = document.getElementById('productImageBtn');
    const productImageName = document.getElementById('productImage_name');
    if (productImageBtn)  productImageBtn.innerHTML  = `<i class="fas fa-folder-open me-1"></i>${fileSelectTxt}`;
    if (productImageName) productImageName.textContent = fileNoneTxt;
}

/**
 * Resim Önizleme Ayarları
 */
function setupImagePreviews() {
    const imageInput = document.getElementById('productImage');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            // BUG 29 Fix: Seçilen dosya adını custom label'a yaz
            const nameEl = document.getElementById('productImage_name');
            if (nameEl) {
                const noFileTxt = (window.langStrings && window.langStrings.file_no_selection) || 'Dosya seçilmedi';
                nameEl.textContent = this.files[0] ? this.files[0].name : noFileTxt;
            }

            if (this.files[0] && this.files[0].size > 5 * 1024 * 1024) {
                showAlert('danger', (window.langStrings && window.langStrings.img_too_large) || 'Ürün resmi 5MB\'dan büyük olamaz!');
                this.value = '';
                if (nameEl) nameEl.textContent = (window.langStrings && window.langStrings.file_no_selection) || 'Dosya seçilmedi';
                document.getElementById('imagePreview').innerHTML = '';
                return;
            }
            previewImage(e.target, 'imagePreview');
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
    const all = document.getElementById('selectAllProducts');
    document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = all.checked);
    updateBulkCount('product');
}

function updateBulkCount(type) {
    const checked = document.querySelectorAll('.product-checkbox:checked');
    const btn = document.getElementById('bulkDeleteProductsBtn');
    const cnt = document.getElementById('selectedProductCount');
    cnt.textContent = checked.length;
    btn.classList.toggle('d-none', checked.length === 0);
    const all = document.getElementById('selectAllProducts');
    const total = document.querySelectorAll('.product-checkbox').length;
    all.indeterminate = checked.length > 0 && checked.length < total;
    all.checked = total > 0 && checked.length === total;
}

function bulkDelete(type) {
    const checked = document.querySelectorAll('.product-checkbox:checked');
    if (checked.length === 0) return;
    if (!confirm(checked.length + ' ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

    const ids = Array.from(checked).map(cb => cb.value);
    const fd = new FormData();
    fd.append('action', 'bulk_delete');
    ids.forEach(id => fd.append('ids[]', id));

    fetch('actions.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                checked.forEach(cb => cb.closest('.product-item').remove());
                updateBulkCount('product');
                document.getElementById('selectAllProducts').checked = false;
                showAlert(data.message, 'success');
            } else {
                showAlert(data.message || 'Hata oluştu.', 'danger');
            }
        })
        .catch(() => showAlert('Bağlantı hatası.', 'danger'));
}

// ── Toplu Silme ──────────────────────────────────────────────
function toggleSelectAll(type) {
    const allCheck = document.getElementById('selectAllProducts');
    document.querySelectorAll('.product-checkbox').forEach(cb => cb.checked = allCheck.checked);
    updateBulkCount('product');
}

function updateBulkCount(type) {
    const checked = document.querySelectorAll('.product-checkbox:checked');
    const btn = document.getElementById('bulkDeleteProductsBtn');
    const count = document.getElementById('selectedProductCount');
    if (count) count.textContent = checked.length;
    if (btn) btn.classList.toggle('d-none', checked.length === 0);
}

function bulkDelete(type) {
    const checked = document.querySelectorAll('.product-checkbox:checked');
    if (!checked.length) return;
    if (!confirm(checked.length + ' ürünü silmek istediğinize emin misiniz?')) return;
    const ids = Array.from(checked).map(cb => cb.value);
    const fd = new FormData();
    fd.append('action', 'bulk_delete');
    ids.forEach(id => fd.append('ids[]', id));
    fetch('actions.php', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                ids.forEach(id => {
                    const el = document.querySelector(`.product-item[data-id="${id}"]`);
                    if (el) el.remove();
                });
                showAlert(data.message || 'Silindi.', 'success');
                updateBulkCount('product');
                document.getElementById('selectAllProducts').checked = false;
            } else {
                showAlert(data.message || 'Hata.', 'danger');
            }
        })
        .catch(() => showAlert('Bağlantı hatası.', 'danger'));
}
