/**
 * Ödemeler Sayfası JavaScript
 * - DataTable başlatma
 * - İstatistik sayaçları
 * - Ödeme onaylama/reddetme
 * - AJAX işlemleri
 */

$(document).ready(function() {
    // Boş tablo mesajını PHP'den oku (çeviri sisteminden geliyor)
    const emptyText = $('#paymentsTable').data('empty-text') || 'Tabloda herhangi bir veri mevcut değil.';

    // DataTable başlat
    const table = $('#paymentsTable').DataTable({
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/tr.json',
            emptyTable: emptyText,
            zeroRecords: emptyText
        },
        order: [[6, 'desc']], // Tarihe göre azalan sırada
        pageLength: 25,
        responsive: true
    });
    
    // İstatistikler artık PHP tarafında hesaplanıyor, JavaScript'te güncellemeye gerek yok
    
    /**
     * Ödeme onaylama butonu
     */
    $(document).on('click', '.approve-btn', function() {
        const paymentId = $(this).data('id');
        const userId = $(this).data('user-id');
        const companyName = $(this).data('company');
        
        if (confirm(`${companyName} firmasının ödemesini onaylamak istediğinize emin misiniz?\n\nBu işlem kullanıcı veritabanını oluşturacak ve aboneliği aktive edecektir.`)) {
            approvePayment(paymentId, userId);
        }
    });
    
    /**
     * Ödeme reddetme butonu
     */
    $(document).on('click', '.reject-btn', function() {
        const paymentId = $(this).data('id');
        
        const reason = prompt('Ödeme ret nedeni (opsiyonel):');
        if (reason !== null) {
            rejectPayment(paymentId, reason);
        }
    });
    
    /**
     * Ödeme onaylama AJAX işlemi
     */
    function approvePayment(paymentId, userId) {
        const formData = new FormData();
        formData.append('action', 'approve');
        formData.append('payment_id', paymentId);
        formData.append('user_id', userId);
        
        showLoadingAlert('Ödeme onaylanıyor ve veritabanı oluşturuluyor...');
        
        fetch('actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message);
                // Sayfayı 2 saniye sonra yenile
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                showAlert('danger', data.message);
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            showAlert('danger', 'Bir hata oluştu. Lütfen tekrar deneyin.');
        });
    }
    
    /**
     * Ödeme reddetme AJAX işlemi
     */
    function rejectPayment(paymentId, reason) {
        const formData = new FormData();
        formData.append('action', 'reject');
        formData.append('payment_id', paymentId);
        formData.append('reason', reason || '');
        
        fetch('actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('warning', data.message);
                // Sayfayı 2 saniye sonra yenile
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                showAlert('danger', data.message);
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            showAlert('danger', 'Bir hata oluştu. Lütfen tekrar deneyin.');
        });
    }
    
    /**
     * Alert mesajı göster
     */
    function showAlert(type, message) {
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'exclamation-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        const alertContainer = $('#alertContainer');
        alertContainer.html(alertHTML);
        
        // Sayfayı yukarı kaydır
        $('html, body').animate({ scrollTop: 0 }, 'fast');
        
        // 10 saniye sonra alert'i kaldır
        setTimeout(() => {
            alertContainer.find('.alert').fadeOut();
        }, 10000);
    }
    
    /**
     * Yükleniyor mesajı göster
     */
    function showLoadingAlert(message) {
        const alertHTML = `
            <div class="alert alert-info" role="alert">
                <div class="d-flex align-items-center">
                    <div class="spinner-border spinner-border-sm me-3" role="status">
                        <span class="visually-hidden">Yükleniyor...</span>
                    </div>
                    <div>${message}</div>
                </div>
            </div>
        `;
        
        $('#alertContainer').html(alertHTML);
        $('html, body').animate({ scrollTop: 0 }, 'fast');
    }
});