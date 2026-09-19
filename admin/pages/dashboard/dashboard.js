/**
 * ==============================================
 * DASHBOARD JAVASCRIPT - FAZA 5
 * ==============================================
 * - Kart animasyonları
 * - Chart.js gelir grafiği
 * - İstatistik değer animasyonları
 * - Sayfa yüklenme efektleri
 * ==============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // İstatistik kartlarını animasyonlu göster
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        }, index * 100);
    });
    
    // Gelir grafiğini oluştur (Chart.js)
    const ctx = document.getElementById('revenueChart');
    if (ctx && typeof Chart !== 'undefined') {
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(28, 200, 138, 0.3)');
        gradient.addColorStop(1, 'rgba(28, 200, 138, 0)');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: window.monthLabels || [],
                datasets: [{
                    label: 'Gelir',
                    data: window.revenueData || [],
                    backgroundColor: gradient,
                    borderColor: '#1cc88a',
                    borderWidth: 3,
                    pointBackgroundColor: '#1cc88a',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 13
                        },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('tr-TR', {
                                        style: 'currency',
                                        currency: 'TRY'
                                    }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('tr-TR', {
                                    style: 'currency',
                                    currency: 'TRY',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // İstatistik değerlerini animasyonlu artır
    const animateValue = (element, start, end, duration, isCurrency = false) => {
        const startTime = performance.now();
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            
            if (isCurrency) {
                element.textContent = new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                }).format(current);
            } else {
                element.textContent = current.toLocaleString('tr-TR');
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    };
    
    // Animasyon devre dışı - değerler direkt görünsün
    // setTimeout(() => {
    //     const statElements = document.querySelectorAll('.stat-value');
    //     statElements.forEach(element => {
    //         const text = element.textContent.trim();
    //         const isCurrency = text.includes('₺') || text.includes('TL');
    //         
    //         if (isCurrency) {
    //             return;
    //         }
    //         
    //         let targetValue = parseInt(text.replace(/\D/g, ''), 10);
    //         
    //         if (!isNaN(targetValue) && targetValue > 0) {
    //             animateValue(element, 0, targetValue, 1500, false);
    //         }
    //     });
    // }, 500);
    
    console.log('Dashboard loaded successfully with FAZA 5 features');
});