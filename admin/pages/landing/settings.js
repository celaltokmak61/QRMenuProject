/**
 * ==============================================
 * LANDING PAGE GENEL AYARLAR - JAVASCRIPT
 * ==============================================
 * Landing page genel ayarlar sayfası fonksiyonları
 * ==============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Form validation
    const form = document.getElementById('settingsForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            // Temel validasyon
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('is-invalid');
                    isValid = false;
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            // Email validasyonu
            const emailField = document.getElementById('contact_email');
            if (emailField && emailField.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(emailField.value)) {
                    emailField.classList.add('is-invalid');
                    isValid = false;
                }
            }
            
            // URL validasyonu (opsiyonel alanlar için)
            const urlFields = ['facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url'];
            urlFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && field.value && field.value !== '#') {
                    try {
                        new URL(field.value);
                        field.classList.remove('is-invalid');
                    } catch {
                        field.classList.add('is-invalid');
                        isValid = false;
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Lütfen tüm gerekli alanları doğru formatta doldurun.');
            }
        });
    }
    
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }, 5000);
    });
    
    // Character counter for textareas
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        if (maxLength) {
            const counter = document.createElement('div');
            counter.className = 'form-text text-end';
            counter.innerHTML = `<span class="char-count">0</span> / ${maxLength} karakter`;
            textarea.parentNode.insertBefore(counter, textarea.nextSibling);
            
            textarea.addEventListener('input', function() {
                counter.querySelector('.char-count').textContent = this.value.length;
            });
            
            // Initial count
            counter.querySelector('.char-count').textContent = textarea.value.length;
        }
    });
    
});