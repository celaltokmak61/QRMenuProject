/**
 * Fiyatlandırma Ayarları Sayfası JavaScript
 * - Form submit işlemleri
 * - Fiyat hesaplama
 * - Para birimi güncelleme
 * - AJAX işlemleri
 */

document.addEventListener('DOMContentLoaded', function() {
    // Form elementleri
    const pricingForm = document.getElementById('pricingForm');
    const currencySelect = document.getElementById('currency');
    const singleBranchPriceInput = document.getElementById('singleBranchPrice');
    const perBranchPriceInput = document.getElementById('perBranchPrice');
    
    // Para birimi sembolleri
    const currencySymbols = {
        'TRY': '₺',
        'USD': '$',
        'EUR': '€'
    };
    
    /**
     * Para birimi değiştiğinde sembolleri güncelle
     */
    currencySelect.addEventListener('change', function() {
        const selectedCurrency = this.value;
        const symbol = currencySymbols[selectedCurrency];
        
        document.getElementById('currencySymbol1').textContent = symbol;
        document.getElementById('currencySymbol2').textContent = symbol;
        
        // Fiyat önizlemesini güncelle
        updatePricingExamples();
    });
    
    /**
     * Fiyat inputları değiştiğinde önizlemeyi güncelle
     */
    singleBranchPriceInput.addEventListener('input', updatePricingExamples);
    perBranchPriceInput.addEventListener('input', updatePricingExamples);
    
    /**
     * Fiyat önizlemesini güncelle
     */
    function updatePricingExamples() {
        const singlePrice = parseFloat(singleBranchPriceInput.value) || 0;
        const perBranchPrice = parseFloat(perBranchPriceInput.value) || 0;
        const currency = currencySelect.value;
        const symbol = currencySymbols[currency];
        
        const examples = [1, 2, 3, 5, 10];
        const examplesHTML = examples.map(branchCount => {
            const totalPrice = calculatePrice(branchCount, singlePrice, perBranchPrice);
            return `
                <div class="price-example">
                    <span class="branches">
                        <i class="fas fa-store me-2"></i>${branchCount} Şube
                    </span>
                    <span class="price">
                        ${formatNumber(totalPrice)} ${symbol}
                    </span>
                </div>
            `;
        }).join('');
        
        document.getElementById('pricingExamples').innerHTML = examplesHTML;
    }
    
    /**
     * Fiyat hesaplama fonksiyonu
     * Formül: Tek Şube Fiyatı + ((Şube Sayısı - 1) × Şube Başı Ücret)
     */
    function calculatePrice(branchCount, singlePrice, perBranchPrice) {
        if (branchCount === 1) {
            return singlePrice;
        }
        return singlePrice + ((branchCount - 1) * perBranchPrice);
    }
    
    /**
     * Sayıyı formatla (binlik ayırıcı ile)
     */
    function formatNumber(num) {
        return num.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    /**
     * Form submit işlemi
     */
    pricingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        // AJAX isteği
        fetch('pricing_actions.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('success', data.message);
                // Önizlemeyi güncelle
                updatePricingExamples();
            } else {
                showAlert('danger', data.message);
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            showAlert('danger', 'Bir hata oluştu. Lütfen tekrar deneyin.');
        });
    });
    
    /**
     * Alert mesajı göster
     */
    function showAlert(type, message) {
        const alertHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        const alertContainer = document.getElementById('alertContainer');
        alertContainer.innerHTML = alertHTML;
        
        // 5 saniye sonra alert'i kaldır
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
    
    // Sayfa yüklendiğinde önizlemeyi göster
    updatePricingExamples();
});