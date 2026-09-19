/**
 * QR MENÜ SİSTEMİ - LANDING PAGE JAVASCRIPT
 * FAZA 5.5 - Profesyonel Vitrin Sayfası
 */

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (navbarToggle) {
        navbarToggle.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
        });
        
        // Menü linklerine tıklandığında menüyü kapat
        const menuLinks = document.querySelectorAll('.navbar-menu a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                navbarMenu.classList.remove('active');
            });
        });
        
        // Dışarı tıklandığında menüyü kapat
        document.addEventListener('click', function(e) {
            if (!navbarToggle.contains(e.target) && !navbarMenu.contains(e.target)) {
                navbarMenu.classList.remove('active');
            }
        });
    }
});

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // 80px navbar yüksekliği
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// FAQ ACCORDION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Diğer tüm FAQ'ları kapat
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Bu FAQ'ı aç/kapat
            item.classList.toggle('active');
        });
    });
});

// ============================================
// CONTACT FORM SUBMISSION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form verilerini al
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            // Basit validasyon
            if (!data.name || !data.email || !data.message) {
                alert('Lütfen tüm zorunlu alanları doldurun.');
                return;
            }
            
            // E-posta formatı kontrolü
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                alert('Lütfen geçerli bir e-posta adresi girin.');
                return;
            }
            
            // Burada form verilerini backend'e gönderebilirsiniz
            // Şimdilik sadece başarı mesajı gösterelim
            alert('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
            this.reset();
        });
    }
});

// ============================================
// SCROLL ANIMATIONS
// ============================================
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function checkScroll() {
    const elements = document.querySelectorAll('.feature-card, .step, .pricing-card, .faq-item');
    
    elements.forEach(element => {
        if (isElementInViewport(element)) {
            element.classList.add('fade-in');
        }
    });
}

// Sayfa yüklendiğinde ve scroll sırasında kontrol et
window.addEventListener('load', checkScroll);
window.addEventListener('scroll', checkScroll);

// ============================================
// PRICING DYNAMIC UPDATE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Eğer fiyatlar dinamik olarak backend'den geliyorsa
    // burada güncellenebilir
    updatePricingDisplay();
});

function updatePricingDisplay() {
    // Fiyatları formatla (Türk Lirası formatında)
    const priceElements = document.querySelectorAll('.pricing-price');
    
    priceElements.forEach(element => {
        const price = element.textContent.replace(/[^0-9]/g, '');
        if (price) {
            element.innerHTML = formatPrice(price) + '<span> / yıl</span>';
        }
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// ============================================
// LOADING ANIMATION
// ============================================
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// ============================================
// BACK TO TOP BUTTON
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const backToTopBtn = document.getElementById('landingBackToTop');
    if (!backToTopBtn) return;

    // Scroll izle — 300px sonra göster
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    // Tıklanınca sayfanın başına git
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ============================================
// FLOATING LANGUAGE SWITCHER (Menü stili)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const langBtn      = document.getElementById('landingLangBtn');
    const langPanel    = document.getElementById('landingLangPanel');
    const langBackdrop = document.getElementById('landingLangBackdrop');

    if (!langBtn || !langPanel) return;

    function openPanel() {
        langPanel.classList.add('open');
        if (langBackdrop) langBackdrop.classList.add('open');
    }

    function closePanel() {
        langPanel.classList.remove('open');
        if (langBackdrop) langBackdrop.classList.remove('open');
    }

    // Butona tıkla: paneli aç/kapat
    langBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = langPanel.classList.contains('open');
        if (isOpen) {
            closePanel();
        } else {
            openPanel();
        }
    });

    // Backdrop tıkla: kapat
    if (langBackdrop) {
        langBackdrop.addEventListener('click', closePanel);
    }

    // Sayfa dışı tıklama: kapat
    document.addEventListener('click', function(e) {
        if (!langBtn.contains(e.target) && !langPanel.contains(e.target)) {
            closePanel();
        }
    });

    // ESC tuşu: kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closePanel();
    });
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
// Scroll event'lerini throttle et
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle'lanmış scroll handler
const throttledScroll = throttle(function() {
    checkScroll();
}, 100);

window.removeEventListener('scroll', checkScroll);
window.addEventListener('scroll', throttledScroll);

// ============================================
// CONSOLE BRANDING (Opsiyonel)
// ============================================
console.log('%c🎉 QR Menü Sistemi', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cGeliştirici: AI Assistant (Cline)', 'color: #764ba2;');
console.log('%cFAZA 5.5 - Landing Page Tamamlandı', 'color: #28a745;');