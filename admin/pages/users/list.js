/**
 * ==============================================
 * KULLANICI LİSTESİ JAVASCRIPT
 * ==============================================
 * Kullanıcı yönetimi sayfası için tüm etkileşimler
 * - DataTable başlatma
 * - Subdomain kontrolü (AJAX)
 * - Kullanıcı ekleme/düzenleme/silme
 * - Status değiştirme
 * ==============================================
 */

(function() {
    'use strict';
    
    // ==============================================
    // GLOBAL DEĞİŞKENLER
    // ==============================================
    let usersTable;
    let subdomainCheckTimeout;
    
    // ==============================================
    // SAYFA YÜKLENDİĞİNDE
    // ==============================================
    document.addEventListener('DOMContentLoaded', function() {
        initDataTable();
        initEventListeners();
    });
    
    // ==============================================
    // DATATABLE BAŞLATMA
    // ==============================================
    function initDataTable() {
        usersTable = $('#usersTable').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/tr.json'
            },
            order: [[0, 'desc']], // ID'ye göre azalan sıralama
            pageLength: 25,
            responsive: true,
            columnDefs: [
                {
                    targets: -1, // Son kolon (İşlemler)
                    orderable: false,
                    searchable: false
                },
                {
                    targets: 5, // Status kolonu
                    orderable: false
                }
            ]
        });
    }
    
    // ==============================================
    // EVENT LISTENER'LARI BAŞLATMA
    // ==============================================
    function initEventListeners() {
        // Subdomain kontrolü (Ekleme modalı)
        const subdomainInput = document.getElementById('subdomain');
        if (subdomainInput) {
            subdomainInput.addEventListener('input', function() {
                clearTimeout(subdomainCheckTimeout);
                const subdomain = this.value.trim().toLowerCase();
                
                // Sadece küçük harf ve tire (-) için temizle
                this.value = subdomain.replace(/[^a-z0-9-]/g, '');
                
                // Kullanıcı adını otomatik doldur (kullanıcı değiştirmediyse)
                const usernameInput = document.getElementById('username');
                if (usernameInput && !usernameInput.dataset.manuallySet) {
                    usernameInput.value = this.value;
                }
                
                if (subdomain.length >= 3) {
                    subdomainCheckTimeout = setTimeout(() => {
                        checkSubdomainAvailability(subdomain);
                    }, 500);
                } else {
                    document.getElementById('subdomainFeedback').innerHTML = '';
                }
            });
        }
        
        // Kullanıcı adını manuel değiştirirse otomatik doldurmayı durdur
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('input', function() {
                if (this.value !== document.getElementById('subdomain')?.value) {
                    this.dataset.manuallySet = 'true';
                }
            });
        }
        
        // Kullanıcı kaydetme butonu
        const saveUserBtn = document.getElementById('saveUserBtn');
        if (saveUserBtn) {
            saveUserBtn.addEventListener('click', saveUser);
        }
        
        // Kullanıcı güncelleme butonu
        const updateUserBtn = document.getElementById('updateUserBtn');
        if (updateUserBtn) {
            updateUserBtn.addEventListener('click', updateUser);
        }
        
        // Düzenleme butonları
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-edit')) {
                const userId = e.target.closest('.btn-edit').getAttribute('data-user-id');
                openEditModal(userId);
            }
        });
        
        // Silme butonları
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-delete')) {
                const userId = e.target.closest('.btn-delete').getAttribute('data-user-id');
                deleteUser(userId);
            }
        });
        
        // Status değiştirme
        document.addEventListener('change', function(e) {
            if (e.target.classList.contains('status-select')) {
                const userId = e.target.getAttribute('data-user-id');
                const newStatus = e.target.value;
                const oldStatus = e.target.getAttribute('data-old-status') || e.target.value;
                
                if (confirm(`Kullanıcı durumunu "${newStatus}" olarak değiştirmek istediğinizden emin misiniz?`)) {
                    changeUserStatus(userId, newStatus);
                } else {
                    e.target.value = oldStatus;
                }
            }
        });
        
        // Modal kapandığında formu temizle
        const addUserModal = document.getElementById('addUserModal');
        if (addUserModal) {
            addUserModal.addEventListener('hidden.bs.modal', function() {
                document.getElementById('addUserForm').reset();
                document.getElementById('subdomainFeedback').innerHTML = '';
            });
        }
    }
    
    // ==============================================
    // SUBDOMAIN MÜSAFARLIK KONTROLÜ
    // ==============================================
    function checkSubdomainAvailability(subdomain) {
        const feedbackDiv = document.getElementById('subdomainFeedback');
        
        // Loading göster
        feedbackDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kontrol ediliyor...';
        feedbackDiv.className = 'text-info';
        
        // AJAX isteği
        fetch(ADMIN_URL + '/pages/users/actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=check_subdomain&subdomain=${encodeURIComponent(subdomain)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.available) {
                    feedbackDiv.innerHTML = '<i class="fas fa-check-circle"></i> Bu subdomain kullanılabilir';
                    feedbackDiv.className = 'text-success';
                    document.getElementById('saveUserBtn').disabled = false;
                } else {
                    feedbackDiv.innerHTML = '<i class="fas fa-times-circle"></i> Bu subdomain zaten kullanılıyor';
                    feedbackDiv.className = 'text-danger';
                    document.getElementById('saveUserBtn').disabled = true;
                }
            } else {
                feedbackDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Kontrol yapılamadı';
                feedbackDiv.className = 'text-warning';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            feedbackDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Hata oluştu';
            feedbackDiv.className = 'text-danger';
        });
    }
    
    // ==============================================
    // YENİ KULLANICI KAYDETME
    // ==============================================
    function saveUser() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);
        formData.append('action', 'add_user');
        
        // Form validasyonu
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Butonu disable et
        const saveBtn = document.getElementById('saveUserBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
        
        // AJAX isteği
        fetch(ADMIN_URL + '/pages/users/actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Modal'ı kapat
                const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
                modal.hide();
                
                // Başarı mesajı göster
                showAlert('success', data.message || 'Kullanıcı başarıyla eklendi');
                
                // Sayfayı yenile
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                showAlert('danger', data.message || 'Kullanıcı eklenirken hata oluştu');
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('danger', 'Bir hata oluştu');
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        });
    }
    
    // ==============================================
    // KULLANICI DÜZENLEME MODAL AÇMA
    // ==============================================
    function openEditModal(userId) {
        // Kullanıcı bilgilerini getir
        fetch(ADMIN_URL + '/pages/users/actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=get_user&user_id=${userId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.user;
                
                // Form alanlarını doldur
                document.getElementById('edit_user_id').value = user.id;
                document.getElementById('edit_company_name').value = user.company_name;
                document.getElementById('edit_subdomain').value = user.subdomain;
                document.getElementById('edit_username').value = user.username || '';
                document.getElementById('edit_email').value = user.email;
                document.getElementById('edit_phone').value = user.phone || '';
                document.getElementById('edit_status').value = user.status;
                document.getElementById('edit_branch_count').value = user.branch_count || 1;
                
                // Modal'ı aç
                const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
                modal.show();
            } else {
                showAlert('danger', data.message || 'Kullanıcı bilgileri alınamadı');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('danger', 'Bir hata oluştu');
        });
    }
    
    // ==============================================
    // KULLANICI GÜNCELLEME
    // ==============================================
    function updateUser() {
        const form = document.getElementById('editUserForm');
        const formData = new FormData(form);
        formData.append('action', 'update_user');
        
        // Form validasyonu
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Butonu disable et
        const updateBtn = document.getElementById('updateUserBtn');
        const originalText = updateBtn.innerHTML;
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Güncelleniyor...';
        
        // AJAX isteği
        fetch(ADMIN_URL + '/pages/users/actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Modal'ı kapat
                const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
                modal.hide();
                
                // Başarı mesajı göster
                showAlert('success', data.message || 'Kullanıcı başarıyla güncellendi');
                
                // Sayfayı yenile
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                showAlert('danger', data.message || 'Kullanıcı güncellenirken hata oluştu');
                updateBtn.disabled = false;
                updateBtn.innerHTML = originalText;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('danger', 'Bir hata oluştu');
            updateBtn.disabled = false;
            updateBtn.innerHTML = originalText;
        });
    }
    
    // ==============================================
    // KULLANICI SİLME
    // ==============================================
    function deleteUser(userId) {
        if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz ve kullanıcının tüm verileri silinecektir.')) {
            return;
        }
        
        // İkinci onay
        if (!confirm('Son kez soruyorum: Bu kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz?')) {
            return;
        }
        
        // AJAX isteği
        fetch(ADMIN_URL + '/pages/users/actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=delete_user&user_id=${userId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message || 'Kullanıcı başarıyla silindi');
                
                // Sayfayı yenile
                setTimeout(() => {
                    location.reload();
                }, 1500);
            } else {
                showAlert('danger', data.message || 'Kullanıcı silinirken hata oluştu');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('danger', 'Bir hata oluştu');
        });
    }
    
    // ==============================================
    // KULLANICI STATUS DEĞİŞTİRME
    // ==============================================
    function changeUserStatus(userId, newStatus) {
        // AJAX isteği
        fetch(ADMIN_URL + '/pages/users/actions.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=change_status&user_id=${userId}&status=${newStatus}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message || 'Durum başarıyla güncellendi');
                
                // Select'e eski değeri kaydet (geri dönüş için)
                const selectElement = document.querySelector(`.status-select[data-user-id="${userId}"]`);
                if (selectElement) {
                    selectElement.setAttribute('data-old-status', newStatus);
                }
                
                // İstatistikleri güncelle (opsiyonel - sayfa yenilemeden)
                // Bu kısım gelecekte eklenebilir
            } else {
                showAlert('danger', data.message || 'Durum güncellenirken hata oluştu');
                
                // Hata durumunda eski değere geri dön
                const selectElement = document.querySelector(`.status-select[data-user-id="${userId}"]`);
                if (selectElement) {
                    const oldStatus = selectElement.getAttribute('data-old-status');
                    if (oldStatus) {
                        selectElement.value = oldStatus;
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('danger', 'Bir hata oluştu');
        });
    }
    
    // ==============================================
    // ALERT MESAJI GÖSTERME
    // ==============================================
    function showAlert(type, message) {
        // Varolan alert'leri temizle
        const existingAlerts = document.querySelectorAll('.alert-floating');
        existingAlerts.forEach(alert => alert.remove());
        
        // Yeni alert oluştur
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-floating`;
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
        `;
        
        // Icon seç
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'danger') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        alertDiv.innerHTML = `
            <i class="fas fa-${icon}"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 5 saniye sonra otomatik kapat
        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 5000);
    }
    
    // ==============================================
    // YARDIMCI FONKSİYONLAR
    // ==============================================
    
    /**
     * String'i URL-safe hale getirir
     */
    function slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Boşlukları tire ile değiştir
            .replace(/[^\w\-]+/g, '')       // Geçersiz karakterleri kaldır
            .replace(/\-\-+/g, '-')         // Çift tireleri tek tireye çevir
            .replace(/^-+/, '')             // Başındaki tireleri kaldır
            .replace(/-+$/, '');            // Sonundaki tireleri kaldır
    }
    
    /**
     * Form verilerini JSON'a çevirir
     */
    function formDataToJson(formData) {
        const obj = {};
        formData.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }
    
    /**
     * Tarih formatlar (dd.mm.yyyy)
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
    
})();