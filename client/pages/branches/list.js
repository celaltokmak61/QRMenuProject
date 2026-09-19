/**
 * Şube Yönetimi - JavaScript
 * AJAX işlemleri, modal yönetimi, form validasyonu
 */

document.addEventListener('DOMContentLoaded', function() {
    // Modal elementi
    const branchModal = new bootstrap.Modal(document.getElementById('branchModal'));
    const branchForm = document.getElementById('branchForm');
    
    // Butonlar
    const addBranchBtn = document.getElementById('addBranchBtn');
    const addFirstBranchBtn = document.getElementById('addFirstBranchBtn');
    
    /**
     * Yeni Şube Ekle Modal
     */
    if (addBranchBtn) {
        addBranchBtn.addEventListener('click', function() {
            openBranchModal();
        });
    }
    
    if (addFirstBranchBtn) {
        addFirstBranchBtn.addEventListener('click', function() {
            openBranchModal();
        });
    }
    
    /**
     * Modal Açma Fonksiyonu
     */
    function openBranchModal(branchId = null) {
        // Formu temizle
        branchForm.reset();
        document.getElementById('branchId').value = '';
        document.getElementById('currentLogo').style.display = 'none';
        document.getElementById('currentBanner').style.display = 'none';

        // BUG 29 Fix: Custom file input isimlerini sıfırla
        const logoName   = document.getElementById('branchLogo_name');
        const bannerName = document.getElementById('branchBanner_name');
        if (logoName)   logoName.textContent   = window.langStrings?.file_no_selection ?? 'Dosya seçilmedi';
        if (bannerName) bannerName.textContent = window.langStrings?.file_no_selection ?? 'Dosya seçilmedi';

        if (branchId) {
            // Düzenleme modu
            document.getElementById('branchModalTitle').textContent =
                window.langStrings?.modal_edit_title ?? 'Şube Düzenle';
            loadBranchData(branchId);
        } else {
            // Ekleme modu
            document.getElementById('branchModalTitle').textContent =
                window.langStrings?.modal_add_title ?? 'Yeni Şube Ekle';
        }
        
        branchModal.show();
    }
    
    /**
     * Şube Verilerini Yükle
     */
    function loadBranchData(branchId) {
        fetch(`actions.php?action=get&id=${branchId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const branch = data.branch;
                    document.getElementById('branchId').value = branch.id;
                    document.getElementById('branchName').value = branch.name || '';
                    document.getElementById('branchPhone').value = branch.phone || '';
                    document.getElementById('branchEmail').value = branch.email || '';
                    document.getElementById('branchAddress').value = branch.address || '';
                    document.getElementById('branchInstagram').value = branch.instagram || '';
                    document.getElementById('branchFacebook').value = branch.facebook || '';
                    document.getElementById('branchTwitter').value = branch.twitter || '';
                    document.getElementById('branchLat').value = branch.location_lat || '';
                    document.getElementById('branchLng').value = branch.location_lng || '';
                    
                    // Logo varsa göster
                    if (branch.logo_path) {
                        document.getElementById('currentLogo').style.display = 'block';
                        document.getElementById('currentLogo').querySelector('img').src = '/' + branch.logo_path;
                    }
                    
                    // Banner varsa göster
                    if (branch.banner_path) {
                        document.getElementById('currentBanner').style.display = 'block';
                        document.getElementById('currentBanner').querySelector('img').src = '/' + branch.banner_path;
                    }
                } else {
                    showAlert('error', data.message || 'Şube bilgileri yüklenemedi');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('error', 'Bir hata oluştu');
            });
    }
    
    /**
     * Form Submit
     */
    branchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(branchForm);
        const branchId = document.getElementById('branchId').value;
        
        // Action belirle
        formData.append('action', branchId ? 'update' : 'create');
        
        // Submit butonunu devre dışı bırak
        const submitBtn = branchForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        
        // AJAX isteği
        fetch('actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message || 'Şube kaydedildi');
                branchModal.hide();
                
                // Sayfayı yenile
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showAlert('error', data.message || 'İşlem başarısız');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('error', 'Bir hata oluştu');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = originalText;
        });
    });
    
    /**
     * Şube Düzenle
     */
    document.querySelectorAll('.edit-branch').forEach(btn => {
        btn.addEventListener('click', function() {
            const branchId = this.dataset.branchId;
            openBranchModal(branchId);
        });
    });
    
    /**
     * Şube Sil
     */
    document.querySelectorAll('.delete-branch').forEach(btn => {
        btn.addEventListener('click', function() {
            const branchId   = this.dataset.branchId;
            const branchName = this.dataset.branchName;
            const msg = (window.langStrings?.confirm_delete ?? '"{name}" şubesini silmek istediğinizden emin misiniz?')
                .replace('{name}', branchName);

            if (confirm(msg)) {
                deleteBranch(branchId);
            }
        });
    });
    
    /**
     * Şube Silme Fonksiyonu
     */
    function deleteBranch(branchId) {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('branch_id', branchId);
        
        fetch('actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message || 'Şube silindi');
                
                // Sayfayı yenile
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showAlert('error', data.message || 'Silme işlemi başarısız');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('error', 'Bir hata oluştu');
        });
    }
    
    /**
     * Durum Toggle
     */
    document.querySelectorAll('.status-toggle').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const branchId = this.dataset.branchId;
            const isActive = this.checked ? 1 : 0;
            
            const formData = new FormData();
            formData.append('action', 'toggle_status');
            formData.append('branch_id', branchId);
            formData.append('is_active', isActive);
            
            fetch('actions.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success', data.message || 'Durum güncellendi');
                    
                    // Kartın görünümünü güncelle
                    const card = this.closest('.branch-card');
                    if (isActive) {
                        card.classList.remove('inactive');
                    } else {
                        card.classList.add('inactive');
                    }
                } else {
                    showAlert('error', data.message || 'İşlem başarısız');
                    // Toggle'ı geri al
                    this.checked = !this.checked;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('error', 'Bir hata oluştu');
                // Toggle'ı geri al
                this.checked = !this.checked;
            });
        });
    });
    
    /**
     * QR Kod Oluştur
     */
    document.querySelectorAll('.generate-qr').forEach(btn => {
        btn.addEventListener('click', function() {
            const branchId = this.dataset.branchId;
            const button = this;
            
            // Buton durumunu değiştir
            button.disabled = true;
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' +
                (window.langStrings?.qr_generating ?? 'Oluşturuluyor...');
            
            const formData = new FormData();
            formData.append('action', 'generate_qr');
            formData.append('branch_id', branchId);
            
            fetch('actions.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success', window.langStrings?.qr_generated ?? 'QR kod oluşturuldu');
                    
                    // Sayfayı yenile
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showAlert('error', data.message || 'QR kod oluşturulamadı');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('error', 'Bir hata oluştu');
            })
            .finally(() => {
                button.disabled = false;
                button.innerHTML = originalText;
            });
        });
    });
    
    /**
     * Alert Göster
     */
    function showAlert(type, message) {
        // Mevcut alert'leri temizle
        document.querySelectorAll('.alert-floating').forEach(alert => alert.remove());
        
        // Yeni alert oluştur
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show alert-floating`;
        alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 5 saniye sonra otomatik kapat
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
    
    /**
     * Logo Dosya Boyutu & Önizleme
     */
    document.getElementById('branchLogo').addEventListener('change', function() {
        const file    = this.files[0];
        const nameEl  = document.getElementById('branchLogo_name');
        const noSel   = window.langStrings?.file_no_selection ?? 'Dosya seçilmedi';

        if (!file) {
            if (nameEl) nameEl.textContent = noSel;
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showAlert('error', window.langStrings?.logo_too_large ?? 'Logo boyutu 2MB\'dan büyük olamaz');
            this.value = '';
            if (nameEl) nameEl.textContent = noSel;
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showAlert('error', window.langStrings?.invalid_format ?? 'Sadece JPG, PNG ve WEBP formatları desteklenir');
            this.value = '';
            if (nameEl) nameEl.textContent = noSel;
            return;
        }

        // Dosya adını göster
        if (nameEl) nameEl.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('currentLogo').style.display = 'block';
            document.getElementById('currentLogo').querySelector('img').src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    /**
     * Banner Dosya Boyutu & Önizleme
     */
    document.getElementById('branchBanner').addEventListener('change', function() {
        const file    = this.files[0];
        const nameEl  = document.getElementById('branchBanner_name');
        const noSel   = window.langStrings?.file_no_selection ?? 'Dosya seçilmedi';

        if (!file) {
            if (nameEl) nameEl.textContent = noSel;
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showAlert('error', window.langStrings?.banner_too_large ?? 'Banner boyutu 5MB\'dan büyük olamaz');
            this.value = '';
            if (nameEl) nameEl.textContent = noSel;
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showAlert('error', window.langStrings?.invalid_format ?? 'Sadece JPG, PNG ve WEBP formatları desteklenir');
            this.value = '';
            if (nameEl) nameEl.textContent = noSel;
            return;
        }

        // Dosya adını göster
        if (nameEl) nameEl.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('currentBanner').style.display = 'block';
            document.getElementById('currentBanner').querySelector('img').src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
});