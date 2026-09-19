/**
 * ==============================================
 * ADMİN LOGİN SAYFASI JAVASCRIPT
 * ==============================================
 * - Şifre göster/gizle özelliği
 * - Alert otomatik kapanma
 * ==============================================
 */

// Sayfa yüklendiğinde çalış
document.addEventListener('DOMContentLoaded', function() {
    
    // Form elementleri
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const usernameInput = document.getElementById('username');
    
    /**
     * Şifre Göster/Gizle İşlevi
     */
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            
            // Password tipini değiştir
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    /**
     * Alert Auto Close
     * Hata mesajları 5 saniye sonra otomatik kapansın
     */
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        // 5 saniye sonra fade out
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease';
            alert.style.opacity = '0';
            
            // Animasyon bitince kaldır
            setTimeout(() => {
                alert.remove();
            }, 500);
        }, 5000);
    });
    
    /**
     * Sayfa yüklendiğinde username'e focus
     */
    if (usernameInput && usernameInput.value === '') {
        usernameInput.focus();
    }
    
    console.log('Login page loaded');
});