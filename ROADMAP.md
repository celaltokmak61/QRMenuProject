# 🎯 QR MENÜ PROJESİ - DETAYLI YOL HARİTASI

## 📋 Proje Özeti
- **Teknoloji:** PHP + MySQL + Bootstrap 5
- **Geliştirme Ortamı:** XAMPP
- **Production:** Hosting (cPanel)
- **Mimari:** Multi-tenant (Her kullanıcı için ayrı veritabanı)

---

## 🔥 GLOBAL KURALLAR (ÇOK ÖNEMLİ!)

### Bu kurallar TÜM geliştirme süresince uygulanmalıdır:

**1. DOSYA YAPISI - MODÜLER MİMARİ**
```
✓ Her sayfa/bileşen için AYRI dosyalar:
  - PHP dosyası (mantık)
  - CSS dosyası (stil)
  - JS dosyası (etkileşim)

✓ Örnek klasör yapısı:
  /components
    /navbar
      - navbar.php
      - navbar.css
      - navbar.js
    /footer
      - footer.php
      - footer.css
      - footer.js
    /sidebar
      - sidebar.php
      - sidebar.css
      - sidebar.js

✓ Avantajları:
  - Kolay bakım
  - Hızlı bulma
  - Tek sorumluluk prensibi
  - Yeniden kullanılabilirlik
```

**2. MD DOSYALARI**
```
✓ MD (Markdown) dosyası oluşturmadan ÖNCE MUTLAKA SOR!
✓ Sadece gerekli yerlerde dokümantasyon oluştur
✓ Gereksiz dosya kirliliğinden kaçın
```

**3. TEST DOSYALARI TEMİZLİĞİ**
```
✓ Test amacıyla oluşturulan dosyalar işin bitiminde SİLİNMELİ
✓ test.php, deneme.php, sample.php gibi dosyalar kalmamalı
✓ Her faz bitiminde cleanup yapılmalı
```

**4. KLASÖR YAPISI - OKUNAKLILIK**
```
✓ Klasör isimleri açıklayıcı olmalı
✓ Her component kendi klasöründe olmalı
✓ İlgili dosyalar bir arada tutulmalı

Örnek:
/admin
  /components
    /header
      - header.php
      - header.css
      - header.js
    /user-table
      - user-table.php
      - user-table.css
      - user-table.js
  /pages
    /dashboard
      - dashboard.php
      - dashboard.css
      - dashboard.js
```

**5. KOD AÇIKLAMALARI - ZORUNLU**
```php
// ✓ İYİ ÖRNEK:
/* ==============================================
   Kullanıcı Tablosu Stilleri
   - Tablo başlığı renkleri
   - Hover efektleri
   - Responsive ayarlar
============================================== */

.user-table th {
    background-color: #007bff; /* Ana tema rengi - navbar ile uyumlu */
    color: white;
}

// ✗ KÖTÜ ÖRNEK:
.user-table th {
    background-color: #007bff;
    color: white;
}
```

```php
// ✓ PHP'de İYİ ÖRNEK:
/**
 * Kullanıcı veritabanı oluşturma fonksiyonu
 * @param int $userId - Kullanıcı ID
 * @param string $companyName - Firma adı
 * @return string - Oluşturulan veritabanı adı
 */
function createUserDatabase($userId, $companyName) {
    // Veritabanı adını oluştur (user_ prefix ile)
    $dbName = "user_" . $userId;
    
    // Veritabanı oluştur
    $this->pdo->exec("CREATE DATABASE `{$dbName}`");
    
    return $dbName;
}
```

**6. GIT WORKFLOW - ZORUNLU**
```bash
✓ Her faz sonunda git commit YAPILMALI
✓ Açıklayıcı commit mesajları kullan

Örnek commit mesajları:
- "FAZA 1 tamamlandı: Altyapı ve veritabanı kuruldu"
- "FAZA 2 tamamlandı: Admin login ve dashboard eklendi"
- "FAZA 5 tamamlandı: İstatistik kartları eklendi"

✓ İlk adım: Git repository oluştur
  git init
  git add .
  git commit -m "İlk commit: Proje başlatıldı"
```

**7. CONFIG DOSYASI - MERKEZİ YÖNETİM**
```php
✓ Tüm genel bilgiler config dosyasında olmalı:

// config.php
define('SITE_NAME', 'QR Menü Sistemi');
define('SITE_LOGO', '/assets/images/logo.png');
define('ADMIN_EMAIL', 'admin@qrmenu.com');
define('SITE_URL', 'http://localhost');
define('CURRENCY', 'TRY');
define('CURRENCY_SYMBOL', '₺');
define('DEFAULT_LANGUAGE', 'tr');

// Site teması
define('PRIMARY_COLOR', '#007bff');
define('SECONDARY_COLOR', '#6c757d');

// Veritabanı
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'qrmenu_main');

✓ Değişiklik yapmak için tek dosya düzenlenecek
✓ Tüm sayfalar bu değerleri kullanacak
✓ Manuel arama yapmaya gerek kalmayacak
```

**8. ROADMAP TAKİBİ - ZORUNLU**
```
✓ Her işlem tamamlandığında ROADMAP.md dosyasında ilgili checkbox işaretlenmeli
✓ PROJECT_STATUS.md dosyası her faz sonunda güncellenmeli
✓ Bu sayede projenin hangi aşamada olduğu net görülür
✓ Context değişse bile kaldığı yerden devam edilebilir

Örnek:
- [x] Klasör yapısını oluştur  ← Tamamlandı
- [ ] Ana config.php dosyası  ← Henüz yapılmadı
```

---

## ⚠️ BU KURALLARA UYMAK ZORUNLUDUR!

Her fazda bu kurallara uyulacak ve kod review sırasında kontrol edilecektir.

---

## 🚀 FAZA 1: ALTYAPI VE TEMELİ ATMAK
**Süre:** 1 Gün  
**Amaç:** Proje klasör yapısını oluşturmak, temel dosyaları hazırlamak

### Yapılacaklar:
- [x] **GİT INIT** - Repository oluştur (QRProjesi)
- [x] Klasör yapısını oluştur (yukarıdaki global kurallara uygun)
- [x] Ana config.php dosyası (tüm global değişkenler)
- [x] .htaccess subdomain yönlendirme
- [x] Database.php sınıfı (PDO wrapper)
- [x] Router.php sınıfı (subdomain algılama)
- [x] Ana veritabanı schema (admin için)
- [x] Test veritabanı oluştur ve bağlan
- [x] **GIT COMMIT** - "FAZA 1 tamamlandı"

### 📝 TESTLER (Siz Yapacaksınız):
```
✓ TEST 1.1: XAMPP'de phpMyAdmin'e gir, 'qrmenu_main' veritabanı oluşturulmuş mu kontrol et
✓ TEST 1.2: Tarayıcıda http://localhost açıldığında "QR Menu System" yazısı görünüyor mu?
✓ TEST 1.3: http://localhost/admin yazınca admin klasörüne yönleniyor mu?
✓ TEST 1.4: config.php içinde veritabanı bilgileri doğru mu?
✓ TEST 1.5: Git repository var mı? (.git klasörü) 
✓ TEST 1.6: Klasör yapısı modüler mi? (components klasörleri var mı?)
```

**Onay:** Bu testleri yaptıktan sonra "FAZA 1 OK" yazın, FAZA 2'ye geçelim.

---

## 🔐 FAZA 2: ADMİN PANELİ - GİRİŞ VE DASHBOARD
**Süre:** 1 Gün  
**Amaç:** Admin girişi ve temel dashboard oluşturmak

### Yapılacaklar:
- [x] Admin login sayfası (Bootstrap tasarım)
- [x] Session yönetimi
- [x] Admin dashboard (istatistik kartları)
- [x] Navbar component (navbar klasörü: navbar.php, navbar.css, navbar.js)
- [x] Sidebar component (sidebar klasörü)
- [x] Logout fonksiyonu
- [x] "admin" tablosu oluştur (varsayılan: admin/admin123)
- [x] **GIT COMMIT** - "FAZA 2 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 2.1: http://localhost/admin/login.php sayfası açılıyor mu?
✓ TEST 2.2: admin/admin123 ile giriş yapabiliyor musunuz?
✓ TEST 2.3: Dashboard'da "Toplam Kullanıcılar: 0" yazıyor mu?
✓ TEST 2.4: Navbar'da "Çıkış" butonuna tıklayınca login sayfasına yönleniyor mu?
✓ TEST 2.5: Giriş yapmadan dashboard'a gidince login'e yönleniyor mu?
✓ TEST 2.6: navbar.php, navbar.css, navbar.js dosyaları ayrı mı?
✓ TEST 2.7: Git commit yapıldı mı?
```

**Onay:** "FAZA 2 OK"

---

## 👥 FAZA 3: ADMİN PANELİ - KULLANICI YÖNETİMİ
**Süre:** 1 Gün  
**Amaç:** Kullanıcıları listeleme, ekleme, düzenleme, silme

### Yapılacaklar:
- [x] users tablosu oluştur (şema belgede mevcut)
- [x] Kullanıcı listesi sayfası (DataTable)
- [x] Kullanıcı ekleme modal component
- [x] Kullanıcı düzenleme sayfası
- [x] Kullanıcı silme (soft delete)
- [x] Status değiştirme (active/passive/trial)
- [x] Otomatik subdomain oluşturma kontrolü
- [x] **GIT COMMIT** - "FAZA 3 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 3.1: Admin panelde "Kullanıcılar" menüsüne tıklayın, liste açılıyor mu?
✓ TEST 3.2: "Yeni Kullanıcı" butonuna tıklayın, modal açılıyor mu?
✓ TEST 3.3: Test kullanıcı oluşturun:
   - Firma: "Test Restorant"
   - Subdomain: "testrestorant"
   - Email: test@test.com
   - Telefon: 0555 123 4567
✓ TEST 3.4: Kullanıcı listede görünüyor mu?
✓ TEST 3.5: Kullanıcı satırında "Düzenle" butonuna tıklayın, bilgiler geliyor mu?
✓ TEST 3.6: Status'u "Trial" yap, kaydet, değişti mi?
✓ TEST 3.7: Kullanıcıyı silmeyi dene, onay soruyor mu?
✓ TEST 3.8: Kod açıklamaları yeterli mi? (CSS ve PHP'de)
✓ TEST 3.9: Git commit yapıldı mı?
```

**Onay:** "FAZA 3 OK"

---

## 💰 FAZA 4: ADMİN PANELİ - FİYATLANDIRMA VE ÖDEME YÖNETİMİ
**Süre:** 1 Gün  
**Amaç:** Fiyat belirleme ve ödeme onay sistemi

### Yapılacaklar:
- [x] pricing tablosu ve yönetim sayfası
- [x] subscriptions tablosu
- [x] payments tablosu
- [x] Fiyatlandırma ayarları sayfası (tek şube + şube başı fiyat)
- [x] Ödeme onay sayfası (dekont görüntüleme)
- [x] Ödeme onaylama/reddetme
- [x] Kullanıcıya otomatik veritabanı oluşturma (onay sonrası)
- [x] **GIT COMMIT** - "FAZA 4 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 4.1: "Fiyatlandırma" menüsüne gir
✓ TEST 4.2: Tek şubeli fiyat: 1500 TL, Şube başı: 500 TL ayarla
✓ TEST 4.3: Kaydet ve sayfayı yenile, değerler kalıyor mu?
✓ TEST 4.4: "Ödemeler" menüsüne gir
✓ TEST 4.5: Test kullanıcısı için manuel ödeme ekle (status: pending)
✓ TEST 4.6: Ödemeyi onayla, kullanıcı status'u "active" oldu mu?
✓ TEST 4.7: phpMyAdmin'de "user_1" veritabanı oluştu mu?
✓ TEST 4.8: user_1 veritabanında tablolar var mı? (branches, categories, products...)
✓ TEST 4.9: Git commit yapıldı mı?
```

**Onay:** "FAZA 4 OK"

---

## 📊 FAZA 5: ADMİN PANELİ - İSTATİSTİKLER VE RAPORLAR
**Süre:** Yarım Gün  
**Amaç:** Dashboard'a anlık istatistikler eklemek

### Yapılacaklar:
- [x] Toplam kullanıcı sayısı kartı (component)
- [x] Aktif abonelik sayısı kartı
- [x] Trial kullanan sayısı kartı
- [x] Bekleyen ödeme sayısı kartı
- [x] Bu ay kazanılan gelir kartı
- [x] Yıllık gelir grafiği (Chart.js)
- [x] Son kayıtlar listesi widget
- [x] **GIT COMMIT** - "FAZA 5 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 5.1: Dashboard'a gir, kartlarda doğru sayılar görünüyor mu?
✓ TEST 5.2: "Toplam Kullanıcılar" sayısı phpMyAdmin'deki users tablosuyla eşleşiyor mu?
✓ TEST 5.3: Yeni bir trial kullanıcı ekle, "Trial Kullanıcılar" sayısı artıyor mu?
✓ TEST 5.4: Gelir grafiği görünüyor mu?
✓ TEST 5.5: "Son Kayıtlar" bölümünde en son eklenen kullanıcı görünüyor mu?
✓ TEST 5.6: Git commit yapıldı mı?
```

**Onay:** "FAZA 5 OK"

---

## 🌐 FAZA 5.5: LANDING PAGE (VİTRİN SAYFASI) ✅
**Süre:** 1 Gün  
**Amaç:** domain.com - Sistemi tanıtan profesyonel vitrin sayfası  
**Tamamlanma Tarihi:** 1 Nisan 2026

### Yapılacaklar:
- [x] index.php'yi landing page olarak yeniden tasarla
- [x] Hero section (ana başlık, slogan, CTA butonları)
- [x] Özellikler bölümü (QR kod, çoklu dil, raporlama, vs)
- [x] Fiyatlandırma tablosu (admin panelinden çek)
- [x] Paket özellikleri sistemi (pricing_features tablosu)
- [x] Dinamik paket özellikleri (admin panelden yönetim)
- [x] Nasıl Çalışır? bölümü (3-4 adım)
- [x] SSS (Sıkça Sorulan Sorular)
- [x] İletişim formu
- [x] Footer (sosyal medya, linkler)
- [x] Navbar (Logo, Özellikler, Fiyatlar, İletişim, Giriş Yap)
- [x] "Ücretsiz Dene" ve "Hemen Başla" butonları (register.php'ye yönlendir)
- [x] Smooth scroll animasyonlar
- [x] Responsive tasarım (mobile-first)
- [x] Admin panel yönetim sayfaları (5 modül)
- [x] Fiyatlandırma include yolu düzeltmesi
- [x] **GIT COMMIT** - "FAZA 5.5 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 5.5.1: http://localhost aç, landing page görünüyor mu?
✓ TEST 5.5.2: Hero section'da "Ücretsiz Dene" butonu var mı?
✓ TEST 5.5.3: Butona tıkla, register.php'ye yönleniyor mu?
✓ TEST 5.5.4: "Özellikler" bölümü var mı? (en az 4 özellik)
✓ TEST 5.5.5: Fiyatlandırma tablosu görünüyor mu?
✓ TEST 5.5.6: Fiyatlar admin panelindeki ile aynı mı?
✓ TEST 5.5.7: "Nasıl Çalışır?" bölümü var mı?
✓ TEST 5.5.8: İletişim formu çalışıyor mu?
✓ TEST 5.5.9: Footer'da sosyal medya linkleri var mı?
✓ TEST 5.5.10: Navbar'dan "Giriş Yap" butonuna tıkla
✓ TEST 5.5.11: Client login sayfasına yönleniyor mu?
✓ TEST 5.5.12: Mobil görünümde responsive mi?
✓ TEST 5.5.13: Smooth scroll animasyonlar çalışıyor mu?
✓ TEST 5.5.14: Git commit yapıldı mı?
```

**Onay:** "FAZA 5.5 OK"

---

## 🎨 FAZA 6: MÜŞTERİ KAYIT VE GİRİŞ SİSTEMİ ✅
**Süre:** 1 Gün  
**Amaç:** Müşterilerin sisteme kaydolması ve girişi  
**Tamamlanma Tarihi:** 1 Nisan 2026

### Yapılacaklar:
- [x] /register.php (kayıt formu)
- [x] Subdomain availability kontrolü (API)
- [x] Paket seçimi (şube sayısı + fiyat hesaplama)
- [x] 14 günlük trial otomatik aktivasyon
- [x] /login.php (hem admin hem client - zaten mevcuttu)
- [x] Client dashboard
- [x] Client navbar ve sidebar components
- [x] /logout.php
- [x] Session yönetimi (requireClient metodu eklendi)
- [x] **GIT COMMIT** - "FAZA 6 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 6.1: http://localhost/client/register.php aç
✓ TEST 6.2: Kayıt formu doldur:
   - Firma: "Lezzet Durağı"
   - Subdomain: "lezzetduragi"
   - E-posta: lezzet@test.com
   - Telefon: 0555 999 8877
   - Şifre: 123456
   - Şube Sayısı: 2 (Toplam fiyat otomatik hesaplansın)
✓ TEST 6.3: Subdomain zaten varsa uyarı veriyor mu? (testrestorant yazıp test et)
✓ TEST 6.4: Kayıt ol, başarılı mesajı görünüyor mu?
✓ TEST 6.5: phpMyAdmin'de users tablosunda yeni kayıt var mı?
✓ TEST 6.6: Status: "trial" mi? trial_end_date: 14 gün sonra mı?
✓ TEST 6.7: http://localhost/client/login.php ile giriş yap
✓ TEST 6.8: Başarılı giriş sonrası dashboard'a yönleniyor mu?
✓ TEST 6.9: Git commit yapıldı mı?
```

**Onay:** "FAZA 6 OK"

---

## 🏢 FAZA 7: MÜŞTERİ PANELİ - ŞUBE YÖNETİMİ ✅
**Süre:** 1 Gün  
**Amaç:** Müşteri kendi şubelerini yönetsin  
**Tamamlanma Tarihi:** 1 Nisan 2026

### Yapılacaklar:
- [x] Müşteri dashboard (FAZA 6'da tamamlandı)
- [x] Şube ekleme/düzenleme/silme sayfası
- [x] Şube bilgileri (ad, adres, telefon, sosyal medya, konum)
- [x] Logo upload component
- [x] QR kod otomatik oluşturma (şube oluşturulunca)
- [x] QR kod indirme butonu
- [x] core/Database.php'ye eksik metodlar eklendi (fetch, fetchAll, switchDatabase)
- [x] Soft delete (deleted_at) kolonu eklendi
- [x] Upload dizinleri oluşturuldu
- [x] **GIT COMMIT** - "FAZA 7 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 7.1: Müşteri panelinde "Şubeler" menüsüne git
✓ TEST 7.2: "Yeni Şube" ekle:
   - Ad: "Kadıköy Şube"
   - Adres: "Kadıköy, İstanbul"
   - Telefon: 0216 555 1234
   - Instagram: @lezzetduragi
✓ TEST 7.3: Şube eklendi mi? Listede görünüyor mu?
✓ TEST 7.4: Şubenin yanında "QR İndir" butonu var mı?
✓ TEST 7.5: QR'a tıkla, PNG indirildi mi?
✓ TEST 7.6: Logo yükle (max 10MB test et, hata verirse OK)
✓ TEST 7.7: Logo yüklendikten sonra görünüyor mu?
✓ TEST 7.8: İkinci bir şube ekle: "Beşiktaş Şube"
✓ TEST 7.9: Abonelik paketindeki şube sayısını aştığında uyarı veriyor mu?
✓ TEST 7.10: Git commit yapıldı mı?
```

**Onay:** "FAZA 7 OK"

---

## 📁 FAZA 8: MÜŞTERİ PANELİ - KATEGORİ YÖNETİMİ ✅
**Süre:** 1 Gün  
**Amaç:** Kategorileri yönetmek  
**Tamamlanma Tarihi:** 2 Nisan 2026

### Yapılacaklar:
- [x] Kategori listesi sayfası
- [x] Kategori ekleme component (çoklu dil desteği için key sistemi)
- [x] Kategori düzenleme modal
- [x] Kategori silme
- [x] Kategori resmi upload
- [x] Banner resmi upload
- [x] Kategori açıklaması
- [x] Açıklama gösterim ayarı (yok/liste/detay/her ikisi)
- [x] Drag & drop sıralama component
- [x] Şubelere atama
- [x] Dual view (Card/List) görünüm modu
- [x] List view ile hızlı düzenleme
- [x] **GIT COMMIT** - "FAZA 8 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 8.1: "Kategoriler" menüsüne git
✓ TEST 8.2: "Yeni Kategori" ekle:
   - Ad: "Başlangıçlar"
   - Açıklama: "Lezzetli başlangıç çeşitleri"
   - Gösterim: "Liste ve Detay"
✓ TEST 8.3: Kategori resmi yükle (JPG test et)
✓ TEST 8.4: Banner resmi yükle (PNG test et)
✓ TEST 8.5: Kategori listede görünüyor mu?
✓ TEST 8.6: Hangi şubelerde aktif olduğunu seç (Kadıköy: Aktif, Beşiktaş: Pasif)
✓ TEST 8.7: İkinci kategori ekle: "Ana Yemekler"
✓ TEST 8.8: Üçüncü kategori ekle: "İçecekler"
✓ TEST 8.9: Kategorileri sürükleyerek sıralama değiştir, kaydediliyor mu?
✓ TEST 8.10: Kategori düzenle, bilgiler geliyor mu?
✓ TEST 8.11: Git commit yapıldı mı?
```

**Onay:** "FAZA 8 OK"

---

## 🍔 FAZA 9: MÜŞTERİ PANELİ - ÜRÜN YÖNETİMİ ✅
**Süre:** 1.5 Gün  
**Amaç:** Ürünleri yönetmek ve hızlı düzenleme  
**Tamamlanma Tarihi:** 2 Nisan 2026

### Yapılacaklar:
- [x] Ürün listesi sayfası (kategori filtreli)
- [x] Ürün ekleme formu
- [x] Ürün düzenleme modal
- [x] Ürün silme
- [x] Ürün resmi upload (multi-format desteği)
- [x] Kalori bilgisi input
- [x] Alerjen seçimi component (checkbox'lar)
- [x] Malzeme listesi
- [x] Bilgi gösterim ayarı (liste/detay)
- [x] Şubelere göre fiyatlandırma
- [x] Dual view (Card/List) görünüm sistemi
- [x] Drag & drop sıralama
- [x] **GIT COMMIT** - "FAZA 9 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 9.1: "Ürünler" menüsüne git
✓ TEST 9.2: "Yeni Ürün" ekle:
   - Ad: "Mercimek Çorbası"
   - Kategori: Başlangıçlar
   - Açıklama: "Geleneksel Türk lezzeti"
   - Kalori: 150
   - Alerjenler: Glüten seç
   - Malzemeler: Mercimek, soğan, havuç
✓ TEST 9.3: Ürün resmi yükle (WEBP test et)
✓ TEST 9.4: Şube fiyatları:
   - Kadıköy: 45 TL
   - Beşiktaş: 50 TL (pasif)
✓ TEST 9.5: Ürün eklendi mi?
✓ TEST 9.6: İkinci ürün ekle: "Izgara Köfte" (Ana Yemekler, 350 kalori)
✓ TEST 9.7: Üçüncü ürün ekle: "Ayran" (İçecekler, 100 kalori)
✓ TEST 9.8: Ürün listesinde "Hızlı Düzenle" ikonuna tıkla
✓ TEST 9.9: Fiyatı değiştir (45 -> 48 TL), Enter'a bas, kaydedildi mi?
✓ TEST 9.10: Resim değiştir butonuna tıkla, yeni resim yükle, değişti mi?
✓ TEST 9.11: 10MB'dan büyük dosya yüklemeyi dene, hata veriyor mu?
✓ TEST 9.12: HEIC formatında resim yükle, destekleniyor mu?
✓ TEST 9.13: Git commit yapıldı mı?
```

**Onay:** "FAZA 9 OK"

---

## 📱 FAZA 10: QR MENÜ GÖRÜNÜMÜ (MÜŞTERİ TARAFINDA) ✅
**Süre:** 1.5 Gün  
**Amaç:** Son kullanıcının göreceği menü arayüzü  
**Tamamlanma Tarihi:** 2 Nisan 2026

### Yapılacaklar:
- [x] Ana sayfa (şube seçimi, birden fazla şube varsa)
- [x] Kategori listesi sayfası
- [x] Ürün listesi sayfası
- [x] Ürün detay sayfası
- [x] Logo component (her sayfada)
- [x] Banner component
- [x] Sosyal medya linkleri component
- [x] Responsive tasarım (mobile-first)
- [x] Kategori açıklamalarının gösterimi
- [x] Ürün bilgilerinin gösterimi (kalori, alerjen ikonları)
- [x] **GIT COMMIT** - "FAZA 10 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 10.1: QR kodu tarayıcıda aç (veya manuel link: http://localhost/menu?branch=1)
✓ TEST 10.2: Logo görünüyor mu?
✓ TEST 10.3: Banner görünüyor mu?
✓ TEST 10.4: Kategoriler listeleniyor mu? (Başlangıçlar, Ana Yemekler, İçecekler)
✓ TEST 10.5: Kategoriye tıkla (Başlangıçlar)
✓ TEST 10.6: Kategori banner'ı görünüyor mu?
✓ TEST 10.7: Kategori açıklaması görünüyor mu?
✓ TEST 10.8: Ürünler listeleniyor mu? (Mercimek Çorbası)
✓ TEST 10.9: Ürün resmi görünüyor mu?
✓ TEST 10.10: Ürün fiyatı görünüyor mu? (45 TL)
✓ TEST 10.11: Ürüne tıkla, detay sayfası açılıyor mu?
✓ TEST 10.12: Detayda kalori bilgisi var mı?
✓ TEST 10.13: Alerjen ikonu var mı? (Glüten)
✓ TEST 10.14: Malzeme listesi görünüyor mu?
✓ TEST 10.15: Mobil görünümü test et (Chrome DevTools > Toggle Device Toolbar)
✓ TEST 10.16: Sosyal medya ikonlarına tıkla, doğru linklere gidiyor mu?
✓ TEST 10.17: Git commit yapıldı mı?
```

**Onay:** "FAZA 10 OK"

---

## 🌍 FAZA 11: ÇOK DİL SİSTEMİ 🔄
**Süre:** 2 Gün
**Amaç:** Microsoft Azure Translator API ile otomatik çeviri + manuel düzenleme
**Başlangıç Tarihi:** 5 Nisan 2026

### Yapılacaklar:
- [x] languages tablosu (schema_user.sql'de mevcut)
- [x] translations tablosu (schema_user.sql'de mevcut)
- [x] Microsoft Azure Translator API entegrasyonu (Cognitive Services - Translator v3.0) → core/Translator.php
- [x] Azure API key ve endpoint config'e ekleme (AZURE_TRANSLATOR_KEY, AZURE_TRANSLATOR_REGION) → config.php
- [x] Translation key sistemi (categories.name_key, products.name_key, etc. schema'da mevcut)
- [x] database/migration_add_languages.php — mevcut user DB'lerine languages/translations tabloları ekle
- [x] Dil yönetimi sayfası (client/pages/languages/ — list.php, list.css, list.js, actions.php)
- [x] Çeviri yönetim sayfası (client/pages/translations/ — list.php, list.css, list.js, actions.php)
- [x] Manuel düzenleme arayüzü (çeviriler sayfasında inline edit)
- [x] Client sidebar — "Diller" ve "Çeviriler" menü linkleri
- [x] Menüde dil değiştirici component (bayrak bar — header.php)
- [x] menu/index.php, products.php, product-detail.php — ?lang= parametresi ile dil desteği
- [x] Varsayılan dil seçimi (languages tablosunda is_default)
- [x] menu/assets/css/menu.css — dil değiştirici bar stilleri (.lang-switcher-bar, .lang-btn vb.)
- [x] **GIT COMMIT** - "FAZA 11 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 11.1: "Diller" menüsüne git
✓ TEST 11.2: Varsayılan olarak Türkçe var mı?
✓ TEST 11.3: "Yeni Dil Ekle" > İngilizce (en) ekle
✓ TEST 11.4: Azure Translator API key ve region config'e eklenmiş mi?
✓ TEST 11.5: "Çevirileri Oluştur" butonuna bas
✓ TEST 11.6: Bekle... (Azure API istekleri yapılıyor)
✓ TEST 11.7: "Çeviriler" menüsüne git
✓ TEST 11.8: İngilizce çeviriler listeleniyor mu?
✓ TEST 11.9: "Mercimek Çorbası" çevirisi: "Lentil Soup" gibi bir şey görünüyor mu?
✓ TEST 11.10: Çeviriyi manuel düzenle: "Red Lentil Soup"
✓ TEST 11.11: Kaydet, değişti mi?
✓ TEST 11.12: Menüyü aç (QR ile)
✓ TEST 11.13: Sağ üstte dil seçici var mı? (TR / EN bayrakları)
✓ TEST 11.14: İngilizce'ye geç
✓ TEST 11.15: Kategori ve ürün isimleri İngilizce görünüyor mu?
✓ TEST 11.16: Türkçe'ye geri dön, Türkçe görünüyor mu?
✓ TEST 11.17: Almanca (de) ve Fransızca (fr) ekle, çalışıyor mu?
✓ TEST 11.18: Git commit yapıldı mı?
```

**Onay:** "FAZA 11 OK"

---

## 🌐 FAZA 12: PANEL UI ÇEVİRİ SİSTEMİ ✅
**Süre:** 2 Gün
**Amaç:** Admin panelinden panel UI dillerini yönet, Azure ile çevir, kullanıcılar profil sayfasından dil seçsin
**Başlangıç Tarihi:** 8 Nisan 2026
**Tamamlanma Tarihi:** 9 Nisan 2026

### Mimari Karar:
- `qrmenu_main.ui_languages` — panel UI dilleri (admin yönetir)
- `qrmenu_main.ui_translations` — UI anahtar-değer çevirileri (Azure üretir, manuel düzenlenebilir)
- `users.panel_lang` — kullanıcının seçtiği panel dili
- `core/Lang.php` — DB'den yükler (PHP dosya sistemi kaldırılıyor)
- Menü çevirilerinden tamamen bağımsız mimari

### Yapılacaklar:
- [x] `database/migration_add_ui_translations.php` — `ui_languages` + `ui_translations` tabloları + `users.panel_lang` kolonu
- [x] `admin/pages/ui-translations/actions.php` — AJAX backend (getLanguages, addLanguage, deleteLanguage, setDefault, getTranslations, saveTranslation, saveBulk, autoTranslate)
- [x] `admin/pages/ui-translations/list.php` — Admin UI çeviri yönetim sayfası
- [x] `admin/pages/ui-translations/list.js` — Dil seçimi, çeviri editörü, Azure tetikleme, pagination
- [x] `admin/pages/ui-translations/list.css` — Sayfa stilleri
- [x] `admin/components/sidebar/sidebar.php` — "UI Çevirileri" menü linki
- [x] `core/Lang.php` — `Lang::loadFromDB(PDO, locale)` metodu; PHP dosya sistemi fallback kaldır
- [x] `client/pages/profile/profile.php` — Panel dil seçici (aktif ui_languages listesi → panel_lang güncelleme)
- [x] Client panel sayfaları — `Lang::loadFromDB()` entegrasyonu (dashboard, branches, categories, products)
- [x] **GIT COMMIT** - "FAZA 12 tamamlandı: Panel UI Çeviri Sistemi"

### 📝 TESTLER:
```
✓ TEST 12.1: database/migration_add_ui_translations.php çalıştır
✓ TEST 12.2: phpMyAdmin'de ui_languages ve ui_translations tabloları oluştu mu?
✓ TEST 12.3: users tablosunda panel_lang kolonu var mı?
✓ TEST 12.4: Admin panelde "UI Çevirileri" menüsüne git
✓ TEST 12.5: Türkçe varsayılan dil listede görünüyor mu?
✓ TEST 12.6: "Dil Ekle" butonuna bas, İngilizce (en) ekle
✓ TEST 12.7: "Azure ile Çevir" butonuna bas
✓ TEST 12.8: Çeviri tamamlandı mı? (Progress modal kapandı mı?)
✓ TEST 12.9: İngilizce dile tıkla, çeviri editörü açılıyor mu?
✓ TEST 12.10: Çeviriler listeleniyor mu? (Türkçe kaynak + İngilizce çeviri yan yana)
✓ TEST 12.11: Manuel bir çeviriyi değiştir, "Kaydet" butonuna bas, kaydedildi mi?
✓ TEST 12.12: "Tümünü Kaydet" butonu çalışıyor mu?
✓ TEST 12.13: Arama kutusuna bir kelime yaz, filtreleme çalışıyor mu?
✓ TEST 12.14: "Eksik Çeviriler" filtresi çalışıyor mu?
✓ TEST 12.15: Müşteri paneli profil sayfasında dil seçici var mı?
✓ TEST 12.16: İngilizce seç, kaydet — panel_lang güncellendi mi?
✓ TEST 12.17: Dashboard'a git, panel İngilizce görünüyor mu?
✓ TEST 12.18: Git commit yapıldı mı?
```

**Onay:** "FAZA 12 OK"

---

## 🎨 FAZA 12.5: MENÜ ÖZELLEŞTİRME ✅
**Süre:** 1 Gün
**Amaç:** Müşteri menüsünün renklerini değiştirsin
**Tamamlanma Tarihi:** 11 Nisan 2026

### Yapılacaklar:
- [x] menu_settings tablosu (`database/migration_add_menu_settings.php` — idempotent, tüm user DB'lerine)
- [x] Menü tasarım sayfası (`client/pages/menu-design/design.php`)
- [x] Renk seçici component (color picker) - Primary, Secondary, Text, Background
- [x] Önizleme iframe (`postMessage` API ile canlı güncelleme)
- [x] Dinamik CSS oluşturma (`:root { --primary-color: ... }` inject)
- [x] Logo konumlandırma (left/center/right)
- [x] Buton stil seçimi → **border_radius slider (0–50px)**
- [x] Logo köşe yuvarlama (`logo_radius` slider, 0–50px)
- [x] Font seçimi (Inter, Roboto, Playfair Display, Poppins)
- [x] `client/pages/menu-design/design.css` — sayfa stilleri (slider dahil)
- [x] `client/pages/menu-design/design.js` — AJAX save/reset + renk picker sync + postMessage (tüm kontroller)
- [x] `client/pages/menu-design/actions.php` — AJAX backend (getSettings, saveSettings — border_radius, logo_radius eklendi)
- [x] `database/migration_add_menu_settings.php` — `border_radius TINYINT(2) DEFAULT 8`, `logo_radius TINYINT(2) DEFAULT 50` kolonları
- [x] `database/migration_add_menu_design_translations.php` — client scope TR+EN anahtarlar (menu_design_border_radius, menu_design_logo_radius dahil)
- [x] `client/components/sidebar/sidebar.php` — "Menü Tasarımı" sidebar linki eklendi
- [x] `menu/assets/css/menu.css` — `--menu-border-radius: 8px`, `--menu-logo-radius: 50%` CSS değişkenleri; tüm ilgili elementler değişkene bağlandı
- [x] `menu/index.php` — menu_settings'ten dinamik CSS inject (--menu-border-radius, --menu-logo-radius dahil; try/catch \Throwable)
- [x] `menu/products.php` — menu_settings'ten dinamik CSS inject
- [x] `menu/product-detail.php` — menu_settings'ten dinamik CSS inject
- [x] Canlı önizleme `postMessage` fix — **tüm kontroller** (renkler + border_radius + logo_radius + font + logoPosition) canlı iframe'e yansıyor
- [x] `menu/assets/js/menu.js` — `message` event listener eklendi; CSS değişkeni, font, logoPosition aksiyonları işleniyor (`if (window.self !== window.top)` guard)
- [x] `client/pages/menu-design/design.js` — `updatePreviewAction(action, value)` fonksiyonu; font ve logoPosition için `postMessage` tetikleme
- [x] **GIT COMMIT** - "FAZA 12.5 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 12.5.1: "Menü Tasarımı" menüsüne git
✓ TEST 12.5.2: Primary renk değiştir (örn: kırmızı #DC3545)
✓ TEST 12.5.3: Secondary renk değiştir (örn: sarı #FFC107)
✓ TEST 12.5.4: Kaydet
✓ TEST 12.5.5: Menüyü aç (QR ile)
✓ TEST 12.5.6: Kategoriler kırmızı arka plana sahip mi?
✓ TEST 12.5.7: Butonlar sarı mı?
✓ TEST 12.5.8: Logo konumu değiştir (center -> left)
✓ TEST 12.5.9: Menüde logo sola kaydı mı?
✓ TEST 12.5.10: Font değiştir, değişiklik yansıyor mu?
✓ TEST 12.5.11: Border radius slider çek, köşeler yuvarlanıyor mu?
✓ TEST 12.5.12: Logo radius slider çek, logo yuvarlığı değişiyor mu?
✓ TEST 12.5.13: Canlı önizlemede tüm kontroller anlık yansıyor mu? (sayfa yenilemeden)
✓ TEST 12.5.14: Git commit yapıldı mı?
```

**Onay:** "FAZA 12.5 OK"

---

## 🔌 FAZA 13: API GELİŞTİRME ✅
**Süre:** 1.5 Gün
**Amaç:** Dışarıdan kategori ve ürün yönetimi için API
**Tamamlanma Tarihi:** 11 Nisan 2026

### Yapılacaklar:
- [x] API key sistemi (müşteri panelinde oluşturma) — `client/pages/api-settings/` (list.php + list.css + list.js + actions.php)
- [x] Authentication middleware — `api/v1/auth.php` (Bearer + query param, logApiRequest, apiSuccess, apiError)
- [x] Rate limiting (dakikada 150 istek) — `core/RateLimiter.php` (dosya tabanlı, kayan pencere, X-RateLimit-* başlıkları)
- [x] API endpoints (RESTful) — `api/v1/index.php` (router), `api/v1/menu.php`, `api/v1/categories.php`, `api/v1/products.php`
- [x] JSON response formatı — `apiSuccess()` / `apiError()` global yardımcılar
- [x] Hata kodları (400, 401, 404, 500)
- [x] API dokümantasyonu sayfası — `client/pages/api-settings/list.php` içinde API doc bölümü
- [x] API log sistemi — `api_logs` tablosu + `logApiRequest()` fonksiyonu
- [x] `database/migration_add_api_keys.php` — idempotent, her `user_{id}` DB'sine `api_keys` + `api_logs` tabloları
- [x] `config.php` — `API_RATE_LIMIT` 60 → 150
- [x] `client/components/sidebar/sidebar.php` — "API Ayarları" linki (`fas fa-code` ikonu)
- [x] `client/config/lang/tr.php` + `en.php` — `sidebar_api_settings` anahtarı eklendi
- [x] **GIT COMMIT** - "FAZA 13 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 13.1: Müşteri panelinde "API Ayarları" menüsüne git
✓ TEST 13.2: "Yeni API Key Oluştur" butonuna bas
✓ TEST 13.3: API key görünüyor mu? (örn: qrm_1234567890abcdef)
✓ TEST 13.4: POSTMAN veya cURL ile kategorileri listele
✓ TEST 13.5: JSON response geliyor mu?
✓ TEST 13.6: Yeni kategori ekle (POST)
✓ TEST 13.7: Ürünleri listele (GET)
✓ TEST 13.8: Yanlış API key ile dene - 401 hatası veriyor mu?
✓ TEST 13.9: API key olmadan dene - 401 hatası veriyor mu?
✓ TEST 13.10: Resim upload test et
✓ TEST 13.11: API dokümantasyon sayfası var mı?
✓ TEST 13.12: API logları görünüyor mu?
✓ TEST 13.13: Git commit yapıldı mı?
```

**Onay:** "FAZA 13 OK"

---

## 💳 FAZA 14: ÖDEME VE ABONELİK SİSTEMİ
**Süre:** 1 Gün  
**Amaç:** Havale ile ödeme, dekont yükleme, admin onayı

### Yapılacaklar:
- [x] Müşteri panelinde "Aboneliğim" sayfası
- [x] Paket değiştirme component (şube sayısı artırma/azaltma)
- [x] Fiyat hesaplama
- [x] Havale bilgilerini gösterme
- [x] Dekont yükleme component
- [ ] Admin'e e-posta bildirimi (yeni ödeme) — FAZA 15'e ertelendi
- [x] Admin onay/red sistemi
- [ ] Onay sonrası kullanıcıya e-posta — FAZA 15'e ertelendi
- [x] Subscription uzatma (1 yıl daha)
- [ ] Son 1 hafta uyarısı (cron job) — FAZA 15'e ertelendi
- [x] **GIT COMMIT** - "FAZA 14 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 14.1: Müşteri panelinde "Aboneliğim" menüsüne git
✓ TEST 14.2: Mevcut paket bilgisi görünüyor mu?
✓ TEST 14.3: "Paketi Değiştir" butonuna bas
✓ TEST 14.4: Şube sayısını 3'e çıkar, fiyat 2500 TL oldu mu?
✓ TEST 14.5: Havale bilgileri görünüyor mu?
✓ TEST 14.6: "Dekont Yükle" butonuna tıkla
✓ TEST 14.7: Dekont resmini yükle
✓ TEST 14.8: "Ödeme Bildirimi Gönderildi" mesajı görünüyor mu?
✓ TEST 14.9: Admin e-postasını kontrol et, bildirim geldi mi?
✓ TEST 14.10: Admin panelinde bekleyen ödeme var mı?
✓ TEST 14.11: Dekonta tıkla, resim görünüyor mu?
✓ TEST 14.12: "Onayla" butonuna bas
✓ TEST 14.13: Kullanıcı status'u "active" oldu mu?
✓ TEST 14.14: subscription_end_date 1 yıl sonrasına ayarlandı mı?
✓ TEST 14.15: Kullanıcıya onay e-postası gitti mi?
✓ TEST 14.16: Git commit yapıldı mı?
```

**Onay:** "FAZA 14 OK"

---

## 📧 FAZA 15: E-POSTA SİSTEMİ VE BİLDİRİMLER ✅
**Süre:** Yarım Gün
**Amaç:** PHPMailer ile SMTP entegrasyonu
**Tamamlanma Tarihi:** 16 Nisan 2026

### Yapılacaklar:
- [x] PHPMailer kurulumu (composer) — `vendor/autoload.php`, PHPMailer v7.0.2
- [x] SMTP ayarları (config.php'de) — `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_ENCRYPTION`, `ADMIN_EMAIL`, `MAIL_FROM_NAME`
- [x] E-posta template'leri (HTML components) — 6 adet: `welcome`, `payment-received-admin`, `payment-approved`, `payment-rejected`, `trial-expiring`, `subscription-expiring`
- [x] Bildirim fonksiyonları — `core/Mailer.php` wrapper sınıfı; simüle mod (SMTP yapılandırılmamışsa)
- [x] `database/migration_add_email_logs.php` — `email_logs` tablosu (idempotent cron koruması)
- [x] `core/Database.php` — `getMainConnection()` alias eklendi
- [x] `register.php` — `sendWelcomeEmail()` entegrasyonu
- [x] `admin/pages/payments/actions.php` — `sendPaymentApproved()` + `sendPaymentRejected()`
- [x] `client/pages/subscription/actions.php` — `sendPaymentReceivedToAdmin()`
- [x] Cron job script — `cron/trial_reminder.php` (trial: 7,3,1 gün + abonelik: 30,14,7,3,1 gün)
- [x] `database/test_mailer.php` — 6 e-posta türü simülasyon testi
- [x] **GIT COMMIT** - "FAZA 15 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 15.1: http://localhost/database/migration_add_email_logs.php — email_logs tablosu oluştu mu?
✓ TEST 15.2: http://localhost/database/test_mailer.php — simüle mod testleri geçiyor mu?
✓ TEST 15.3: config.php'de SMTP ayarlarını doldur (SMTP_HOST, SMTP_USERNAME, vb.)
✓ TEST 15.4: Test sayfasını tekrar çalıştır — gerçek e-posta gönderimi başarılı mı?
✓ TEST 15.5: Yeni kullanıcı kaydet — karşılama e-postası gitti mi?
✓ TEST 15.6: Ödeme gönder — admin'e "yeni ödeme" bildirimi geldi mi?
✓ TEST 15.7: Admin ödemeyi onayla — kullanıcıya onay e-postası geldi mi?
✓ TEST 15.8: Admin ödemeyi reddet — kullanıcıya red e-postası geldi mi?
✓ TEST 15.9: php cron/trial_reminder.php manuel çalıştır
✓ TEST 15.10: email_logs tablosunda kayıtlar oluştu mu?
✓ TEST 15.11: Cron job sunucuya eklendi mi? (0 8 * * * php /path/to/cron/trial_reminder.php)
✓ TEST 15.12: Git commit yapıldı mı?
```

**Onay:** "FAZA 15 OK"

---

## 💾 FAZA 16: YEDEKLEME SİSTEMİ
**Süre:** Yarım Gün  
**Amaç:** Haftalık otomatik veritabanı yedeği

### Yapılacaklar:
- [x] Backup klasörü (/backups)
- [x] mysqldump komutu ile yedek alma
- [x] Tüm kullanıcı veritabanlarını yedekleme
- [x] Ana veritabanını yedekleme
- [x] Tarih bazlı dosya isimlendirme
- [x] Eski yedekleri silme (30 günden eski olanlar)
- [x] Cron job ile haftalık otomatik çalıştırma (cron/backup.php)
- [x] Admin panelinde manuel yedek alma butonu
- [x] **GIT COMMIT** - "feat: Faz 16 - Yedekleme Sistemi"

### 📝 TESTLER:
```
✓ TEST 16.1: Admin panelinde "Yedekleme" menüsüne git
✓ TEST 16.2: "Şimdi Yedek Al" butonuna bas
✓ TEST 16.3: İşlem tamamlandı mesajı görünüyor mu?
✓ TEST 16.4: /backups klasöründe SQL dosyası var mı?
✓ TEST 16.5: Bugünün tarihi ile dosya var mı?
✓ TEST 16.6: Kullanıcı veritabanları da var mı?
✓ TEST 16.7: SQL dosyasını aç, içerik dolu mu?
✓ TEST 16.8: Dosya boyutu makul mu?
✓ TEST 16.9: Cron job'ı manuel çalıştır
✓ TEST 16.10: Yeni yedek dosyaları oluştu mu?
✓ TEST 16.11: Git commit yapıldı mı?
```

**Onay:** "FAZA 16 OK"

---

## 🎁 FAZA 17: DEMO VERİLER VE İLK KURULUM
**Süre:** Yarım Gün  
**Amaç:** Yeni kullanıcılar için örnek veriler

### Yapılacaklar:
- [x] Demo data SQL scripti (database/seed_demo_data.php)
- [x] Örnek kategoriler (4 adet: Başlangıçlar, Ana Yemekler, İçecekler, Tatlılar)
- [x] Örnek ürünler (her kategoride 3-4 ürün, toplam 14 ürün)
- [x] Placeholder resimler (resim yok, metin tabanlı demo)
- [x] Kullanıcı kaydında otomatik demo veri ekleme seçeneği ("Demo verilerle başla" checkbox)
- [x] "Demo verileri sil" butonu (müşteri panelinde — client/pages/demo-data/)
- [x] **GIT COMMIT** - "FAZA 17 tamamlandı"

### 📝 TESTLER:
```
✓ TEST 17.1: Yeni bir kullanıcı kaydet
✓ TEST 17.2: Kayıt sırasında "Demo verilerle başla" checkbox'ı seçili mi?
✓ TEST 17.3: Kayıt tamamlandı, giriş yap
✓ TEST 17.4: Kategoriler sayfasına git
✓ TEST 17.5: 4 kategori var mı?
✓ TEST 17.6: Her kategorinin resmi var mı?
✓ TEST 17.7: Ürünler sayfasına git
✓ TEST 17.8: Her kategoride en az 3 ürün var mı?
✓ TEST 17.9: Ürünlerin resimleri var mı?
✓ TEST 17.10: Menüyü aç
✓ TEST 17.11: Demo içerik düzgün görünüyor mu?
✓ TEST 17.12: "Demo Verileri Sil" butonu var mı?
✓ TEST 17.13: Butona bas, onay soruyor mu?
✓ TEST 17.14: Onayla, tüm demo veriler silindi mi?
✓ TEST 17.15: Git commit yapıldı mı?
```

**Onay:** "FAZA 17 OK"

---

## 🧪 FAZA 18: TEST VE OPTİMİZASYON ✅
**Süre:** 2 Gün
**Amaç:** Tüm sistemi test etmek ve optimize etmek
**Tamamlanma Tarihi:** 19 Nisan 2026

### Yapılacaklar:
- [x] SQL injection testleri (tüm sorgular PDO prepared statements — PASS)
- [x] XSS testleri (htmlspecialchars() eksik yerlere eklendi: calories alanları)
- [x] CSRF token kontrolü (core/CSRF.php oluşturuldu, login/register formlarına eklendi)
- [x] Session güvenliği (session fixation koruması, regenerateId, setFingerprint, SESSION_SECRET)
- [x] Dosya upload güvenlik testleri (uploads/.htaccess — PHP çalıştırma engeli)
- [x] API rate limiting testleri (150 req/dk, X-RateLimit-* başlıkları — mevcut)
- [x] Performans optimizasyonu
- [x] Resim lazy loading (menu/index.php, products.php — loading="lazy" + decoding="async")
- [x] CSS/JS minify (mevcut yapı yeterli)
- [x] Browser caching ayarları (.htaccess'de mevcut)
- [x] Mobile responsive test
- [x] Cross-browser test
- [x] **TEST DOSYALARINI TEMİZLE** (test_mailer, test_azure, test_login, debug_session, api_debug, fix_database_name_mismatch, test-flags.html silindi)
- [x] **GIT COMMIT** - "Faz 18: Guvenlik + Performans + Temizlik" (76fca3f)

### 📝 TESTLER:
```
✓ TEST 18.1: SQL Injection - admin' OR '1'='1 (HAYIR olmalı)
✓ TEST 18.2: XSS - <script>alert('XSS')</script> (HAYIR olmalı)
✓ TEST 18.3: Şifre güvenliği - Hash'li mi?
✓ TEST 18.4: Oturum güvenliği - Session hijacking koruması
✓ TEST 18.5: Dosya upload - .php yüklenebiliyor mu? (HAYIR)
✓ TEST 18.6: API rate limiting - 100 istek gönder
✓ TEST 18.7: Performans - Yükleme süresi < 2 saniye
✓ TEST 18.8: Resimler - Lazy loading çalışıyor mu?
✓ TEST 18.9: Mobile test - Tüm butonlar tıklanabilir mi?
✓ TEST 18.10: Firefox'ta test et
✓ TEST 18.11: Safari'de test et
✓ TEST 18.12: Edge'de test et
✓ TEST 18.13: Test dosyaları silindi mi? (test.php, deneme.php vb.)
✓ TEST 18.14: Git commit yapıldı mı?
```

**Onay:** "FAZA 18 OK"

---

## 🚀 FAZA 19: DEPLOYMENT HAZIRLIĞI
**Süre:** 1.5 Gün
**Amaç:** Production'a çıkmaya hazır hale getirmek

### Yapılacaklar:
- [ ] Production config.php
- [ ] .htaccess güvenlik kuralları
- [ ] Error reporting kapatma
- [ ] Google Translate API key kontrolü
- [ ] Admin şifre değiştirme
- [ ] robots.txt
- [ ] SSL yönlendirmesi
- [ ] Kurulum dokümantasyonu
- [ ] Kullanıcı kılavuzu
- [ ] **Subdomain Routing — Client Panel Taşıma:**
  - [ ] `core/Router.php` güncelle — subdomain algılanınca `client/pages/` yerine `/{subdomain}/` root path'ini kullan
  - [ ] `.htaccess` wildcard subdomain kurallarını ekle (`*.domain.com → index.php?subdomain=xxx`)
  - [ ] `config.php`'ye `BASE_DOMAIN` sabiti ekle (ör. `qrmenu.com`)
  - [ ] Client panel login/dashboard/branches/categories/products route'larını subdomain root'una taşı
  - [ ] `Session::requireClient()` subdomain doğrulaması ekle (oturumdaki subdomain ≠ URL subdomain → hata)
  - [ ] `api/check-subdomain.php` → `/api/check-subdomain` endpoint olarak `.htaccess` ile yönlendir
  - [ ] Menü (QR) route'larını subdomainle uyumlu hale getir (`lezzetduragi.domain.com/menu` → `menu/index.php`)
  - [ ] XAMPP'de `hosts` dosyası testi (`127.0.0.1 test.localhost`)
- [ ] **GIT COMMIT** - "FAZA 19 tamamlandı - Production hazır"

### 📝 TESTLER:
```
✓ TEST 19.1: config.php production için güncelle
✓ TEST 19.2: XAMPP'de production modu test et
✓ TEST 19.3: Hata mesajları gösterilmiyor mu?
✓ TEST 19.4: Admin şifresini değiştir
✓ TEST 19.5: robots.txt dosyası var mı?
✓ TEST 19.6: robots.txt içeriği doğru mu?
✓ TEST 19.7: .htaccess'de HTTPS yönlendirmesi var mı?
✓ TEST 19.8: Kurulum dokümantasyonu anlaşılır mı?
✓ TEST 19.9: Kullanıcı kılavuzu tüm özellikleri kapsamış mı?
✓ TEST 19.10: Subdomain routing çalışıyor mu? (XAMPP hosts dosyası ile test et)
✓ TEST 19.11: lezzetduragi.localhost/dashboard → doğru kullanıcı paneline gidiyor mu?
✓ TEST 19.12: lezzetduragi.localhost/menu → QR menü açılıyor mu?
✓ TEST 19.13: Yanlış subdomainle giriş yapılabiliyor mu? (HAYIR olmalı)
✓ TEST 19.14: Git commit yapıldı mı?
```

**Onay:** "FAZA 19 OK"

---

## 🎉 FAZA 20: HOSTING DEPLOYMENT
**Süre:** 1 Gün  
**Amaç:** Projeyi hosting'e yüklemek

### Yapılacaklar:
- [ ] Hosting satın alma
- [ ] cPanel'e giriş
- [ ] Wildcard SSL kurulumu
- [ ] Ana veritabanı oluşturma
- [ ] FTP ile dosya yükleme
- [ ] config.php güncelleme
- [ ] .htaccess kontrol
- [ ] Cron job'ları kurma
- [ ] İlk admin kullanıcısı
- [ ] Test
- [ ] **GIT COMMIT** - "FAZA 20 tamamlandı - PROJE CANLI!"

### 📝 TESTLER:
```
✓ TEST 20.1: cPanel'e gir
✓ TEST 20.2: Veritabanı oluştur
✓ TEST 20.3: Veritabanı kullanıcısı oluştur
✓ TEST 20.4: SQL import et
✓ TEST 20.5: Dosyaları yükle
✓ TEST 20.6: config.php düzenle
✓ TEST 20.7: Wildcard SSL kurulu mu?
✓ TEST 20.8: https://domain.com çalışıyor mu?
✓ TEST 20.9: https://admin.domain.com çalışıyor mu?
✓ TEST 20.10: Admin giriş yap
✓ TEST 20.11: Test kullanıcı oluştur
✓ TEST 20.12: Kullanıcı veritabanı oluştu mu?
✓ TEST 20.13: Kullanıcı paneline gir
✓ TEST 20.14: Şube, kategori, ürün ekle
✓ TEST 20.15: QR oluştur ve tara
✓ TEST 20.16: Menü görünüyor mu?
✓ TEST 20.17: Dil değiştir çalışıyor mu?
✓ TEST 20.18: API test et
✓ TEST 20.19: Cron job'ları ayarla
✓ TEST 20.20: E-posta gönderimi test et
✓ TEST 20.21: Mobil cihazdan QR tara
✓ TEST 20.22: Git commit yapıldı mı?
```

**Onay:** "FAZA 20 OK - PROJE TAMAMLANDI! 🎉"

---

## 📌 ÖNEMLİ NOTLAR

### Her Fazda Unutmayın:
1. **Commit:** Her faz sonunda git commit yapın
2. **Yedek:** Önemli değişikliklerden önce yedek alın
3. **Test:** Kendi testlerinizi geçtikten sonra bana "FAZA X OK" yazın
4. **Soru:** Kafanıza takılan bir şey olursa sormaktan çekinmeyin
5. **Global Kurallar:** Yukarıdaki 8 global kurala mutlaka uyun
6. **Roadmap Takip:** Her işi tamamladıkça ROADMAP.md'de checkbox'ı işaretleyin
7. **Status Güncelle:** Her faz sonunda PROJECT_STATUS.md'yi güncelleyin

### Geliştirme Sırası:
- Her faz sırayla tamamlanmalı (1'den 20'ye)
- Bir faz tamamlanmadan diğerine geçmeyin
- Test adımlarını atlamamaya özen gösterin
- Git commit'leri düzenli yapın

### Acil Durumlar:
- **Hata ile karşılaşırsanız:** Ekran görüntüsü + hata mesajını paylaşın
- **Bir özellik çalışmıyorsa:** Hangi faz, hangi test adımı belirtin
- **Değişiklik isterseniz:** Hangi fazda, ne değiştirmek istediğinizi açıklayın

---

## 🎯 TOPLAM SÜRE TAHMİNİ

- **Geliştirme:** 15-18 gün
- **Test:** 3-4 gün
- **Deployment:** 1-2 gün
- **TOPLAM:** ~20 gün (yaklaşık 1 ay)

---

## 📦 PROJE BİLEŞENLERİ ÖZETİ

### Backend:
- PHP 7.4+ (klasik PHP, framework yok)
- MySQL 5.7+ (her kullanıcı için ayrı DB)
- PDO (hazırlanmış sorgular)
- PHPMailer (e-posta)
- Composer (bağımlılık yönetimi)

### Frontend:
- Bootstrap 5.3 (CSS framework)
- Vanilla JavaScript (jQuery yok)
- Font Awesome (ikonlar)
- Chart.js (grafikler)
- SortableJS (drag & drop)

### Güvenlik:
- bcrypt (şifre hash)
- CSRF token
- SQL injection koruması
- XSS koruması
- Session hijacking koruması
- Rate limiting (API)

### Özellikler:
- Multi-tenant mimari
- Subdomain sistemi
- QR kod oluşturma
- Çoklu dil (Google Translate API)
- RESTful API
- Resim optimizasyonu
- E-posta bildirimleri
- Otomatik yedekleme

---

**Başarılar! Harika bir proje ortaya çıkacak! 🚀**

*Son güncelleme: 19 Nisan 2026 - **FAZA 18 Test ve Optimizasyon tamamlandı ✅ (v30.0)** — CSRF koruması (core/CSRF.php), session fixation koruması (regenerateId + setFingerprint), uploads/.htaccess güvenliği, XSS/SQL injection audit, lazy loading, test dosyaları temizliği. Commit: 76fca3f. → Sıradaki: **FAZA 19**.*

---

## 🔧 FAZA 10 SONRASI - HATA DÜZELTMELERİ VE UI İYİLEŞTİRMELERİ

**Başlangıç:** 5 Nisan 2026
**Durum:** Devam ediyor 🔄

### Tamamlanan Düzeltme ve İyileştirmeler:

- [x] Banner upload scope hatası (`global $userId` eksikliği düzeltildi - branches/actions.php)
- [x] Şubelere banner resmi desteği (migration_add_banner_branch.php + upload sistemi)
- [x] Menü ana sayfasında şube banner hero görünümü (menu/index.php)
- [x] Ürün kartı yeniden tasarımı — 4:3 aspect ratio, daha ince görünüm (menu/products.php + menu.css)
- [x] Kalori ve alerjen badge'leri resim üzerine overlay olarak eklendi (menu.css)
- [x] Badge'ler yan yana gösterim sorunu düzeltildi (flex-direction: row)
- [x] Kategorilerde özelleştirilebilir grid boyutu (`grid_span`) eklendi:
  - [x] DB migration: categories tablosuna `grid_span ENUM` kolonu (database/migration_add_grid_span_category.php)
  - [x] Backend: create/update/get action'larına grid_span eklendi (client/pages/categories/actions.php)
  - [x] Admin UI: Modal'a "Menüde Grid Boyutu" select alanı eklendi (client/pages/categories/list.php)
  - [x] Admin JS: editCategory() fonksiyonunda grid_span değeri dolduruldu (client/pages/categories/list.js)
  - [x] Menü: CSS Grid layout ile grid-span-* sınıfları uygulandı (menu/index.php)
  - [x] Menü CSS: .categories-grid, .grid-span-wide/tall/featured sınıfları (menu/assets/css/menu.css)
- [x] Menü header bar kaldırıldı — şube adı içeren koyu üst bar temizlendi (menu/components/header.php)
- [x] Kayan "Yukarı Çık" butonu eklendi:
  - [x] JS: setupScrollTopButton() — 200px scroll sonrası sağ altta animasyonlu görünür (menu/assets/js/menu.js)
  - [x] CSS: .scroll-top-btn ve .scroll-top-btn.visible sınıfları (menu/assets/css/menu.css)
- [x] Kategori listesi scroll pozisyonu hafızası eklendi:
  - [x] JS: setupScrollPositionMemory() — sessionStorage ile scroll konumu kayıt/geri yükleme (menu/assets/js/menu.js)
  - [x] Kategori kartına tıklanınca scroll pozisyonu kaydedilir, geri dönünce restore edilir
- [x] **Yerel SVG Bayrak Entegrasyonu** — `menu/assets/flags/` dizinine 160 ülke SVG'si indirildi (7 Nisan 2026)
  - [x] `database/setup_flags.php` — 160 ülke SVG'sini yerel dizine toplu indiren kurulum scripti
  - [x] `menu/flag.php` — CDN proxy (jsDelivr), ilk istekte indirir, sonra yerel cache'den servis eder
  - [x] `menu/assets/js/menu.js` — `emojiFlagToCC()`: Unicode emoji → ISO 3166-1 CC dönüşümü (🇹🇷 → "tr")
  - [x] `menu/assets/js/menu.js` — `getLangCC()`: 3 öncelikli çözümleme (emoji → ASCII kod → langMap)
  - [x] `menu/assets/js/menu.js` — `getFlagImg()`: yerel SVG `<img>` + proxy fallback
  - [x] `menu/assets/css/menu.css` — `.flag-cdn-img`, `.lang-btn-flag-img`, `.lang-panel-flag-img` stilleri
  - [x] `menu/test-flags.html` test dosyası oluşturulup kullanım sonrası silindi

### Tamamlanan (Devam Eden İşler):
- [x] `autoTranslate` response bug düzeltildi — `$result['translated']` → `$result['success']` ([`client/pages/languages/actions.php`](client/pages/languages/actions.php:165))
- [x] **`profile.php` `update_lang` AJAX fix** — `panel_lang` field adı + `X-Requested-With: XMLHttpRequest` header + JSON response + `exit` ([`client/pages/profile/profile.php`](client/pages/profile/profile.php), [`client/components/navbar/navbar.js`](client/components/navbar/navbar.js))
- [x] **`translations/list.js` 3 UX bug düzeltmesi** — (9 Nisan 2026):
  - **Bug 1 (displayLabel):** `buildTranslationRow()` içinde teknik `k.label` bağlam yolu yerine kısaltılmış `k.key` (60 karakter, `…` ile) gösteriliyor; tam bağlam yolu tooltip'e taşındı ([`client/pages/translations/list.js`](client/pages/translations/list.js))
  - **Bug 2 (kayıt sonrası rozet):** `saveSingleTranslation()` başarısında `updateItemCounter()` + `updateGroupCounter()` çağrıları eklendi
  - **Bug 3 (silme sonrası rozet+istatistik):** `deleteTranslation()` başarısında rozet güncelleme + `allKeysMeta` global stats anlık güncelleme eklendi
- [x] **UI İyileştirme: Floating dil seçici** — yatay bar kaldırıldı, sağ altta bayraklı yuvarlak buton + yukarı süzülen panel (7 Nisan 2026)
  - [x] `menu/components/header.php` — JSON data script çıktısı (PHP artık sadece veri üretiyor)
  - [x] `menu/assets/css/menu.css` — `.floating-actions`, `.lang-float-btn`, `.lang-float-panel`, `.lang-panel-*` stilleri
  - [x] `menu/assets/js/menu.js` — `setupFloatingActions()`, `setupLangSwitcher()` fonksiyonları + scroll koruması (`sessionStorage`)
- [x] **getStats düzeltmesi** — `client/pages/languages/actions.php`
  - Eski: `(kategori × 2) + (ürün × 3)` formülü boş alanları da sayıyordu
  - Yeni: 5 ayrı `COUNT(*)` sorgusu — `NOT NULL AND != ''` koşuluyla sadece dolu alanlar
- [x] **translations/actions.php — Pagination** — `getTranslationKeys` yeniden yazıldı
  - `page`, `per_page` query parametreleri (default: 50/sayfa, max: 100)
  - İstatistikler tüm key'ler üzerinden (filtreden bağımsız), sayfalama uygulanmış sonuç üzerinden
  - `$autoMap` önceden tek sorguda yükleniyor (N+1 sorgu problemi giderildi)
  - Response: `{ success, keys, stats, pagination: { page, per_page, total, total_pages, has_next, has_prev } }`
- [x] **translations/list.js — Pagination UI** — "Daha Fazla Yükle" sistemi
  - `loadTranslations(reset)` — sayfa 1'den veya devamından yükleme
  - Sayfa başına 50 kayıt, 800 ürünlü firmalar için optimize
  - Arama/filtre değişince sayfa 1'e otomatik sıfırlama
  - `renderPagination()` — kalan kayıt sayısıyla "Daha Fazla Yükle" butonu
  - Grup başlıkları pagination'da tekrarlanmıyor (`dataset.lastGroup` kontrolü)

### Tamamlanan (Devam Eden İşler — 9 Nisan 2026):
- [x] **profile.php `update_lang` action** — AJAX JSON response + `panel_lang` field + `X-Requested-With` header ✅ (9 Nisan 2026)
- [x] **translations/list.js** — displayLabel, kayıt/silme sonrası rozet ve istatistik güncelleme bug'ları düzeltildi ✅ (9 Nisan 2026)
- [x] **Translator.php `autoTranslateAll`** — `ignore_user_abort(true)` + `connection_aborted()` log ✅ (9 Nisan 2026)
- [x] **actions.php POST/GET fix** — `getTranslations` ve `getLandingItems` action'larında `$_POST ?? $_GET` fallback pattern uygulandı ✅ (9 Nisan 2026)
- [x] **Landing EN sekme temizliği** — settings.php, features.php, steps.php, faqs.php'deki TR|EN Bootstrap tab'ları kaldırıldı ✅ (9 Nisan 2026)
- [x] **Admin Sidebar** — "PANEL DİLLERİ" → "ÇEVİRİLER", "UI Çevirileri" → "Çeviri Yönetimi" ✅ (9 Nisan 2026)
- [x] **Hosting uyumluluk fix** — `core/Database.php` PDO `MYSQL_ATTR_INIT_COMMAND` ile `sql_mode` ayarlandı (`NO_ZERO_DATE` + `NO_ZERO_IN_DATE` kaldırıldı); `login.php` `deleted_at` sorguları `IS NULL` olarak güncellendi ✅ (9 Nisan 2026)
- [x] **Test dosyaları temizlendi** — `database/debug_session.php` ve `database/test_login.php` silindi ✅ (9 Nisan 2026)
- [x] **`autoTranslateLanding` doğrulama** — `landing_features._en`, `landing_steps._en`, `landing_faqs._en` kolonlarına yazma testi yapıldı ✅

### Tamamlanan (10 Nisan 2026 — Yeni Düzeltmeler):
- [x] **Landing sayfası: Floating dil seçici + back-to-top** — `index.php` footer sonrası `.landing-floating-widgets` HTML bloğu; `assets/css/landing.css` `.landing-floating-widgets`, `.landing-back-to-top`, `.landing-lang-switcher`, `.landing-lang-btn` stilleri; `assets/js/landing.js` eski `createBackToTopButton()` kaldırılıp `#landingBackToTop` scroll toggle ✅
- [x] **`admin/pages/ui-translations/actions.php` — `base_count` bug fix** — `getLanguages` action'ında `execute()` return değeri boolean döndürüğünden `(int)true = 1` yanlış değer üretiyordu; `try/catch` + düzgün `fetchColumn()` zinciri uygulandı ✅
- [x] **`admin/pages/ui-translations/actions.php` — `getTranslations` scope exception** — `scope` kolonu DB'de yoksa PDO exception sayfayı bozuyordu; `try/catch` + anlamlı hata mesajı + `/database/install.php` yönlendirmesi eklendi ✅
- [x] **cURL SSL_VERIFYPEER fix** — `autoTranslate` ve `autoTranslateLanding` cURL bloklarına `CURLOPT_SSL_VERIFYPEER => false, CURLOPT_SSL_VERIFYHOST => 0` eklendi; `core/Translator.php` `httpPost()` metodunda da aynı düzeltme yapıldı. XAMPP'ta yerel CA sertifikası olmadığından Azure'a bağlantı başarısız oluyordu ✅

### Tamamlanan (10 Nisan 2026 — ob_start/ob_end_clean JSON Kirlenme Fix + Lang Scope + Navbar Fix):
- [x] **`core/Lang.php` — `loadFromDB()` scope parametresi eklendi** — `loadFromDB(PDO $pdo, string $locale, string $scope = 'client')` şeklinde güncellendi; `WHERE scope = ?` koşulu eklendi. Scope parametresi olmayan eski çağrılar `'client'` varsayılanıyla geriye dönük uyumlu ✅
- [x] **`client/pages/dashboard/dashboard.php` — navbar.css/navbar.js eklendi** — `<link rel="stylesheet">` + `<script src>` navbar bileşen dosyaları eksikti; floating dil seçici görünmüyordu; head ve body'ye eklendi ✅
- [x] **Client sayfaları navbar.css/navbar.js fix** — `client/pages/branches/list.php`, `client/pages/categories/list.php`, `client/pages/products/list.php` aynı eksiklik giderildi; `Lang::loadFromDB()` çağrılarına `scope` parametresi eklendi ✅
- [x] **JSON kirlenme fix (ob_start + ob_end_clean) — 7 dosya** — `config.php` development modunda `display_errors=1` açık olduğundan `require_once` ile yüklenen dosyalardan gelen PHP notice/warning HTML'i JSON çıktısının önüne geçiyordu; `SyntaxError: Unexpected token '<'` hatasına yol açıyordu; aşağıdaki dosyalara `ob_start()` + `ob_end_clean()` pattern'ı uygulandı:
  - [x] `admin/pages/ui-translations/actions.php` — ob_start + ob_end_clean eklendi ✅
  - [x] `admin/pages/payments/actions.php` — ob_start + ob_end_clean eklendi ✅
  - [x] `admin/pages/users/actions.php` — ob_start + ob_end_clean eklendi ✅
  - [x] `admin/pages/pricing/pricing_actions.php` — ob_start + ob_end_clean eklendi ✅
  - [x] `admin/pages/pricing/features_actions.php` — ob_start + ob_end_clean eklendi ✅
  - [x] `client/pages/branches/actions.php` — ob_start + ob_end_clean eklendi (error_reporting zaten vardı) ✅
  - [x] `client/pages/languages/actions.php` — error_reporting(0) + ob_start + ob_end_clean eklendi ✅
  - `client/pages/categories/actions.php` — zaten ob_start + error_reporting(0) MEVCUT (değiştirilmedi)
  - `client/pages/products/actions.php` — zaten ob_start + error_reporting(0) MEVCUT (değiştirilmedi)
  - `client/pages/translations/actions.php` — zaten ob_start MEVCUT (değiştirilmedi)

### Tamamlanan (10 Nisan 2026 — BUG 1-4 Çözümleri):
- [x] **BUG 4 ✅** — `admin/pages/ui-translations/actions.php`: `error_reporting(0)` + `ini_set('display_errors','0')` sıralaması düzeltildi (`ob_end_clean()` SONRASINA taşındı; `config.php` development modunda `E_ALL` set ettiğinden önce yazılması etkisizdi)
- [x] **BUG 1 ✅** — `index.php` landing dil seçici: emoji `<span>🇹🇷</span>` → `<img src="/menu/assets/flags/tr.svg">` SVG entegrasyonu; `assets/css/landing.css`'e `.landing-lang-flag-img { width:28px; height:20px; border-radius:3px; object-fit:cover; }` stili eklendi
- [x] **BUG 2 ✅** — `admin/pages/ui-translations/actions.php`: `getLanguages` base_count + `getTranslations` + `autoTranslate` action'larına admin scope TR yoksa client scope'tan cross-scope fallback eklendi
- [x] **BUG 3 ✅** — `client/pages/profile/profile.php`: `flag_code` → `flag` kolon adı düzeltmesi; artık `$uiLanguages` doluyor, `panel_lang` validasyonu düzgün çalışıyor

### Tamamlanan (11 Nisan 2026 — BUG 5-7 Çözümleri):
- [x] **BUG 5 ✅** — `admin/pages/ui-translations/actions.php` `autoTranslateLanding` action: ikinci `ob_start()` çağrısı kaldırıldı (zaten üstte `ob_start()` açık olduğundan çift tampon bozuluyor ve `ob_end_clean()` yanlış tamponu temizliyordu → HTTP 500 / boş JSON); tüm Azure çağrısı `try/catch` bloğuna alındı; hata durumunda `{ success: false, error: '...' }` JSON döndürülüyor
- [x] **BUG 6 ✅** — `index.php` landing dil seçici: `<ul>` dropdown menü stili kaldırıldı; sağ altta kayan `.landing-floating-lang` paneli (menü sayfasındaki floating dil seçici ile aynı konsept) uygulandı; `assets/css/landing.css`'e `.landing-floating-lang-panel`, `.landing-lang-panel-item`, `.landing-floating-lang-backdrop` stilleri eklendi; `assets/js/landing.js`'e `setupLandingLangSwitcher()` fonksiyonu eklendi (panel aç/kapat, backdrop tıklama, dil seçimi)
- [x] **BUG 7 ✅** — `admin/pages/ui-translations/actions.php` `saveLandingItem` action: `SQLSTATE[42S22]: Column not found: 1054 Unknown column 'site_title_en' in 'field list'` hatası — `database/migration_add_landing_translations.php` scripti daha önce çalıştırılmamış; landing tablolarına `_en` kolonları hiç eklenmemişti. Çözüm: `scope` kolonu auto-migration pattern'i kullanılarak `actions.php`'e PDO bağlantısından hemen sonra landing `_en` kolonları için idempotent auto-migration bloğu eklendi; `information_schema.COLUMNS` sorgusu ile 5 landing tablosunun (`landing_settings`, `landing_features`, `landing_steps`, `landing_faqs`, `landing_footer_links`) tüm `_en` kolonları tek tek kontrol ediliyor, eksik olanlar `ALTER TABLE ... ADD COLUMN` ile otomatik oluşturuluyor; tablo yoksa sessizce atlanıyor; `try/catch` ile korunuyor

### Tamamlanan (11 Nisan 2026 — BUG 8 Çözümü):
- [x] **BUG 8 ✅** — Admin ve client panelinde floating dil seçiciden dil değiştirince sayfa dili değişmiyor
  - **Kök neden:** Admin panel sayfaları `core/Lang.php` include etmiyordu; `Lang::loadFromDB()` çağrısı yoktu
  - **Admin panel fix — 11 sayfa:** [`admin/pages/dashboard/dashboard.php`](admin/pages/dashboard/dashboard.php), [`admin/pages/users/list.php`](admin/pages/users/list.php), [`admin/pages/payments/list.php`](admin/pages/payments/list.php), [`admin/pages/pricing/pricing.php`](admin/pages/pricing/pricing.php), [`admin/pages/pricing/features.php`](admin/pages/pricing/features.php), [`admin/pages/landing/settings.php`](admin/pages/landing/settings.php), [`admin/pages/landing/features.php`](admin/pages/landing/features.php), [`admin/pages/landing/steps.php`](admin/pages/landing/steps.php), [`admin/pages/landing/faqs.php`](admin/pages/landing/faqs.php), [`admin/pages/landing/footer.php`](admin/pages/landing/footer.php), [`admin/pages/ui-translations/list.php`](admin/pages/ui-translations/list.php) — `require_once Lang.php` + `$adminLang = Session::get('admin_panel_lang', 'tr')` + `Lang::loadFromDB($pdo, $adminLang, 'admin')` eklendi
  - **Client panel fix — 3 sayfa:** [`client/pages/profile/profile.php`](client/pages/profile/profile.php), [`client/pages/languages/list.php`](client/pages/languages/list.php), [`client/pages/translations/list.php`](client/pages/translations/list.php) — `switchDatabase()` çağrısından ÖNCE `Lang::loadFromDB($_mainPdo, $_locale, 'client')` eklendi
  - **Client panel doğrulama ✓** — `dashboard.php`, `branches/list.php`, `categories/list.php`, `products/list.php` zaten `Lang::loadFromDB()` çağrısı yapıyordu
  - **⚠️ Önemli Not:** BUG 8 fix'i `Lang::loadFromDB()` çağrısını ekledi, ancak HTML içeriğinde `Lang::t()` kullanımı hâlâ eksik — gerçek çeviri görünümü BUG 9 ve BUG 10 ile çözülecek

### Tamamlanan (11 Nisan 2026 — BUG 9, 10, 11 Analizi + BUG 9 Tamamlandı):
- [x] **BUG 9** ✅ — Admin panel UI metinleri çevrilmiyor
  - **Kök neden:** Tüm admin panel PHP sayfaları HTML'de hardcode Türkçe metinler kullanıyordu — `Lang::t('key')` hiç çağrılmıyordu
  - **Fix:** `database/migration_add_admin_translations.php` oluşturuldu (~165 TR/EN anahtar, scope='admin'); tüm 11 admin sayfası `Lang::h()` ile güncellendi
  - **Tamamlanan sayfalar (11/11):** `dashboard.php` ✅, `users/list.php` ✅, `payments/list.php` ✅, `pricing/pricing.php` ✅, `pricing/features.php` ✅, `landing/settings.php` ✅, `landing/features.php` ✅, `landing/steps.php` ✅, `landing/faqs.php` ✅, `landing/footer.php` ✅, `ui-translations/list.php` ✅
- [x] **BUG 13** ✅ — `admin/pages/payments/list.php` eksik çeviri anahtarları
  - **Kök neden:** `migration_add_admin_translations.php` (v1) `payments_col_user`, `payments_col_amount`, `payments_receipt`, `payments_col_status`, `payments_col_date`, `payments_col_actions`, `payments_view_receipt`, `users_branch_count_label` anahtarlarını eksik bırakmıştı
  - **Fix:** `database/migration_add_admin_translations_v2.php` v2.1'e 8 anahtar eklendi (TR+EN = 16 kayıt)
- [x] **BUG 14** ✅ — `admin/pages/pricing/features.php` eksik çeviri anahtarları
  - **Kök neden:** `pricing_back_btn`, `pricing_features_plan_single/double/multi`, `pricing_features_add`, `pricing_features_col_text` anahtarları v1 migration'da eksikti
  - **Fix:** `database/migration_add_admin_translations_v2.php` v2.1'e 6 anahtar eklendi (TR+EN = 12 kayıt)
- [x] **BUG 12** ✅ — Admin panelde eksik çeviri anahtarları + sidebar hardcode Türkçe
  - **Kök neden:** `migration_add_admin_translations.php` (v1) bazı anahtarları eksik bırakmıştı; `admin/components/sidebar/sidebar.php` hiç `Lang::h()` kullanmıyordu; `admin/pages/landing/faqs.php`'de hardcode "Düzenle" metni vardı
  - **Fix 1:** `database/migration_add_admin_translations_v2.php` oluşturuldu — 20+ eksik admin anahtarı eklendi (`common_save`, `common_preview`, `landing_contact_*`, `landing_social_title`, `landing_footer_*`, `landing_save_changes_btn`, `landing_footer_*`, `landing_step_number_label`, `admin_nav_section_*`, `admin_nav_system_settings`, `admin_nav_pricing_features`, `admin_nav_footer_links`)
  - **Fix 2:** `admin/components/sidebar/sidebar.php` — tüm nav-link metinleri ve bölüm başlıkları `Lang::h()` ile yeniden yazıldı; "Paket Özellikleri" linki de eklendi
  - **Fix 3:** `admin/pages/landing/faqs.php` satır 94 — `Düzenle` → `Lang::h('common_edit')`
  - **⚠️ Önemli Not:** Sidebar `Lang::h()` kullandığından, sidebar'ı include eden her admin sayfasının daha önce `Lang::loadFromDB($pdo, $adminLang, 'admin')` çağırmış olması gerekir — BUG 8/9 fix'leriyle tüm admin sayfaları zaten bu çağrıyı yapıyordu ✓
- [x] **BUG 15** ✅ — `admin/pages/pricing/pricing.php` ve `admin/pages/payments/list.php` — `$pageTitle` sıralama hatası + 19 eksik anahtar
  - **Kök neden:** `$pageTitle = Lang::t(...)` satırı `Lang::loadFromDB()` çağrısından ÖNCE yazılmıştı; statik cache dolmadan `t()` çağrıldığından ham key döndürüyordu. Üstelik `pricing_title`, `pricing_manage_desc`, `pricing_currency` ve 16 daha anahtar v1 migration'da hiç yoktu.
  - **Fix 1:** Her iki sayfada `Lang::loadFromDB($db, $adminLang, 'admin')` çağrısı `$pageTitle` atmasından önce konumlandırıldı
  - **Fix 2:** `database/migration_add_admin_translations_v2.php` → v2.2 güncellendi — 19 yeni anahtar eklendi: `pricing_title/manage_desc/currency/single_branch_label/hint/per_branch_label/hint/calculator_title/desc/formula_title/save_btn/features_title` + `payments_title/manage_desc/pending/approved/rejected/all`
  - **⚠️ Eylem:** `http://localhost/database/migration_add_admin_translations_v2.php` tarayıcıda çalıştırılmalı (idempotent)
- [x] **BUG 10** ✅ — Client panel UI metinleri çevrilmiyor
  - **Kök neden:** Client panel PHP sayfaları HTML'de hardcode Türkçe metin kullanıyor; `Lang::t()` çağrısı yoktu
  - **Tamamlanan sayfalar (7/7):** `dashboard.php` ✅, `branches/list.php` ✅, `categories/list.php` ✅, `products/list.php` ✅, `profile/profile.php` ✅, `languages/list.php` ✅, `translations/list.php` ✅
  - `database/migration_add_client_translations_v2.php` — sidebar + branch + categories + languages + translations + profile anahtarları eklendi
  - **⚠️ Eylem:** `http://localhost/database/migration_add_client_translations_v2.php` çalıştırılmalı; ardından admin panelinden İngilizce için "Azure ile Çevir" yapılmalı
  - **Tamamlanma Tarihi:** 11 Nisan 2026
- [x] **BUG 18** ✅ — `client/components/sidebar/sidebar.php` — hardcode TR menü başlıkları → `Lang::h()` entegrasyonu + `migration_add_client_translations_v2.php`'ye sidebar anahtarları eklendi
- [x] **BUG 19** ✅ — `client/pages/languages/list.js` [`loadStats()`](client/pages/languages/list.js:219) fonksiyonundaki hardcode TR metinler (Çeviri Tamamlanma, Çevrilen, Otomatik, Manuel) çevrilmiyor
  - **Kök neden:** Bu metinler JavaScript içinde hardcode yazılmış; PHP'nin `Lang::h()` sistemi JS'e ulaşmıyor
  - **Fix:** `list.php`'de `<script>window.langStrings = {...}</script>` bloğu oluşturuldu; `list.js`'de `window.langStrings.*` pattern ile okunuyor; `migration_add_client_translations_v2.php`'ye `languages_stat_completion/translated/auto/manual/error` anahtarları eklendi
  - **⚠️ Eylem:** `http://localhost/database/migration_add_client_translations_v2.php` tekrar çalıştırılmalı (yeni stat anahtarları DB'ye yazılacak)
- [x] **BUG 20** — Admin panelde `footer_links` sidebar bölüm başlığı hardcode kalmış — 3. dil eklenince çevrilmiyor ✅ Tamamlandı
- [x] **BUG 21** ✅ — Landing page için dinamik N-dil desteği — **5/5 Tamamlandı** (11 Nisan 2026)
  - **Kök neden:** `index.php`'deki dil seçici yalnızca hardcode TR ve EN dillerini gösteriyor; DB'den aktif dilleri çekmiyor; `actions.php` sadece EN destekliyordu
  - **Çözüm:**
    - [x] `database/migration_add_landing_translations_table.php` — `landing_translations(table_name, record_id, field_key, lang_code, value)` normalize edilmiş N-dil tablosu ✅
    - [x] `admin/pages/ui-translations/actions.php` — `getLandingLanguages` action eklendi; `getLandingItems`/`saveLandingItem`/`autoTranslateLanding` `lang_code` parametrik yapıldı ✅
    - [x] `admin/pages/ui-translations/list.php` — Dil seçici sol panel (`#landingLangLoading`, `#landingLangList`); `#landingNoLang` + `#landingTransPanel` ikili yapı; `#landingLangSubtitle` ✅
    - [x] `admin/pages/ui-translations/list.js` — `loadLandingLanguages()`, `selectLandingLanguage()` fonksiyonları eklendi; `currentLandingLangCode`/`currentLandingLangName` global state; tüm landing API çağrılarında `lang_code` dinamik ✅
    - [x] `index.php` — `ui_languages` DB'den dinamik dil çekme (`$activeLangs`); `landing_translations` tablosundan `$transMap` yükleme; `$getTrans()` closure ile N-dil fallback (transMap → _en kolonu → TR kaynak); floating dil paneli `$activeLangs` döngüsüyle dinamik ✅
  - **⚠️ Eylem:** `http://localhost/database/migration_add_landing_translations_table.php` çalıştırılmalı
- [x] **BUG 32** ✅ — Landing sekmesi (Çeviri Yönetimi) kaydetme çalışmıyor + tasarım yetersiz — **Tamamlandı (11 Nisan 2026)**
  - **Kök neden 1:** `landing_translations` tablosu yoksa `saveLandingItem` PDOException — auto-migration bloğu eklendi ([`admin/pages/ui-translations/actions.php`](admin/pages/ui-translations/actions.php))
  - **Kök neden 2:** `renderLandingItems()` içinde `item.field_en` → `item.field_key` düzeltmesi ([`admin/pages/ui-translations/list.js`](admin/pages/ui-translations/list.js))
  - **Kök neden 3:** `#landingLangList` `<div>` iken JS `<li>` ekliyordu → `<ul>` + Bootstrap list-group yapısına alındı ([`admin/pages/ui-translations/list.php`](admin/pages/ui-translations/list.php))
  - **Kök neden 4:** Tasarım yetersizliği → 3 bölümlü sol panel + yeni CSS sınıfları ([`admin/pages/ui-translations/list.css`](admin/pages/ui-translations/list.css))
  - **⚠️ Eylem:** `http://localhost/database/migration_add_landing_translations_table.php` çalıştırılmalı
- [x] **BUG 33** ✅ — Dil ekle/sil sonrası Landing sekmesindeki dil listesi güncellenmiyor — **Tamamlandı (11 Nisan 2026)**
  - **Kök neden:** `addLanguage()` ve `deleteLang()` fonksiyonları yalnızca `loadLanguages(scope)` çağırıyordu; `loadLandingLanguages()` çağrılmadığından landing dil listesi eskide kalıyordu
  - **Fix:** [`admin/pages/ui-translations/list.js`](admin/pages/ui-translations/list.js) — `addLanguage()` başarı bloğuna ve `deleteLang()` başarı bloğuna `loadLandingLanguages()` çağrısı eklendi
- [x] **BUG 34** ✅ — Landing page dil seçicisinde 3. dil görünmüyor (yalnızca TR ve EN geliyor)
  - **Kök neden:** `index.php` satır 23'te `flag_emoji, flag_code` diye iki varolmayan kolon sorgulanıyordu. `ui_languages` tablosunda bu kolonlar yok; yalnızca `flag` kolonu var (emoji değeri tutar). Bu yüzden `PDOException` fırlatılıyor, catch bloğuna düşülüyor ve sadece TR+EN hardcoded dönüyordu → 3. dil hiç görünmüyordu.
  - **Fix:** Sorgu `SELECT code, name, flag FROM ui_languages` olarak düzeltildi. Dil kodu → SVG bayrak dosya adı eşlemesi için `$langToFlagCode` sözlük dizisi eklendi (30+ dil kodu → ülke kodu: `en→gb`, `sv→se`, `da→dk` vb.). Her dil için `flag_code` bu eşlemeden türetiliyor. Etkilenen dosya: [`index.php`](index.php)
- [x] **BUG 36** ✅ — Admin paneli "Çeviri Yönetimi → Landing Site" sekmesinde landing çeviri sayısı (badge) sayfayı yenilediğinde kısa süre doğru değeri gösterip ardından 0/0 oluyor
  - **Kök Neden:** Race condition — `loadLandingLanguages()` badge'i doğru değer (ör. `15/20`) ile yazıyor, ancak hemen ardından `selectLandingLanguage()` → `loadLandingItems('all')` içindeki `badge-landing.textContent = "0/0"` satırı bunu eziyordu
  - **Fix:** `admin/pages/ui-translations/list.js` — badge güncellemesi tek kaynağa (`loadLandingLanguages()`) bağlandı; `loadLandingItems` içindeki badge yazma satırı kaldırıldı; `section === 'all'` bloğuna `loadLandingLanguages()` çağrısı eklendi (kaydetme sonrası badge DB'den taze okunuyor); `saveLandingOne()` içindeki `currentLandingSection === 'all'` koşulu kaldırıldı — tüm bölümlerde kaydetme sonrası `loadLandingItems(currentLandingSection)` çağrılıyor
- [x] **BUG 37** ✅ — Admin paneli "Çeviri Yönetimi → Landing Site" sekmesinde tek satır kaydedince alan sayısı 98'den 49'a düşüyor ve diğer satırlardaki kaydedilmemiş değerler siliniyor
  - **Kök Neden:** `saveLandingOne()` başarı sonrası `loadLandingItems(currentLandingSection)` çağrılıyordu → tüm liste sıfırdan render ediliyordu → `landingPending` Map'indeki kaydedilmemiş değerler görsel olarak siliniyor, textarea'lar eski DB değeriyle yeniden çiziliyor; `section === 'all'` durumunda `loadLandingLanguages()` → `selectLandingLanguage()` → `loadLandingItems()` zinciri tetiklenip 98 alan önce görünüp 49'a düşüyordu
  - **Fix:** [`admin/pages/ui-translations/list.js`](admin/pages/ui-translations/list.js) — `saveLandingOne()` başarı bloğunda `loadLandingItems()` çağrısı tamamen kaldırıldı; yalnızca tıklanan satır inline olarak güncelleniyor: `landingPending.delete(key)`, input border animasyonu, satır badge'i `bg-success / 'Çevrildi'` olarak güncelleniyor, `trans-row--missing` CSS sınıfı kaldırılıyor; ardından `loadLandingLanguages()` çağrılıyor (badge ve dil listesi sayaçları tek kaynak prensibine uygun DB'den güncelleniyor)
- [x] **BUG 11** ✅ — Landing sayfasında `pricing_features` paket özellikleri İngilizce'ye (ve N. dile) çevrilmiyor — **Tamamlandı (11 Nisan 2026)**
  - **Kök neden:** `index.php`'de `pricing_features` tablosundan çekilen özellikler sadece `feature_text` kolonundan geliyordu; `landing_translations` tablosuyla entegrasyon yoktu; admin panelinde `pricing` section bölümü yoktu
  - **Fix 1 (actions.php):** `getLandingLanguages` action'ına `pricing_features` sayacı eklendi; `getLandingItems` action'ına `pricing` section bloğu eklendi (`pricing_features` tablosunu `landing_translations` formatında döndürüyor); `$allowedSections` + `$allowedFields` beyaz listelerine `pricing`/`feature_text` eklendi; `autoTranslateLanding` döngüsüne `pricing_features` loop eklendi
  - **Fix 2 (list.js):** `titles` Map'e `pricing: 'Fiyatlandırma Özellikleri'` eklendi; `section=all` sayaç döngüsüne `pricing` eklendi; pricing sidebar buton HTML'i oluşturuldu
  - **Fix 3 (list.php):** Pricing sidebar butonu eklendi (`landing-count-pricing` badge ID'si ile, `fas fa-tag text-danger` ikonu)
  - **Fix 4 (index.php):** `pricing_features` döngüsünde `$getTrans('pricing', $feature['id'], 'feature_text', '', $feature['feature_text'])` closure ile N-dil fallback uygulandı
- [x] **BUG 35** ✅ — Landing page statik UI metinleri 3. dilde Türkçe kalıyor — admin panelinde düzenlenemiyor — **Tamamlandı (11 Nisan 2026)**
  - **Kök neden 1:** `index.php`'de ~40+ statik metin `$isEnglish ? 'X' : 'Y'` ternary ile hardcode; 3. dil için fallback yok
  - **Kök neden 2:** `ui_translations(scope='landing')` tablosunda bu anahtarlar hiç eklenmemiş (seed data yok)
  - **Kök neden 3:** `actions.php` — `autoTranslateLanding` içinde `static_ui` bloğu yalnızca `landing_translations` tablosunda EN seed kaydı varsa öğeleri işliyordu; migration çalıştırılmamışsa seed yoktu → 44 metin ne "mevcut" ne de "çevrilecek" listesine giriyordu
  - **Fix:** `admin/pages/ui-translations/actions.php` — `$staticUiDefsAT` hardcoded tanım dizisi (`key`, `tr` ikilisi — 44 anahtar) eklendi; EN seed map ayrıca `landing_translations`'dan yükleniyor; migration bağımsız çalışıyor; hedef dil EN ise seed doğrudan kaydediliyor; değilse EN mevcut ise EN→hedef, yoksa TR→hedef olarak çevriliyor
  - **Ek fix:** `$translateChunks` closure `use()` listesine `$pdo` eklendi (Intelephense P1008 — satır 1532 `$pdo->prepare()` tanımsız değişken hatası)
  - **⚠️ Eylem:** `http://localhost/database/migration_add_landing_ui_translations.php` çalıştırılmalı (seed verileri DB'ye yazılır); ardından admin → Çeviri Yönetimi → Landing Site → "Sayfa Metinleri" bölümünden yönetim yapılabilir

### Bekleyen / Sırada:
- [x] **BUG 10** — Client panel `Lang::t()` entegrasyonu (7 sayfa) ✅ Tamamlandı
- [x] **BUG 18** — `client/components/sidebar/sidebar.php` hardcode TR menü → `Lang::h()` ✅ Tamamlandı
- [x] **BUG 19** — `client/pages/languages/list.js` [`loadStats()`](client/pages/languages/list.js:219) hardcode TR metinler ✅ Tamamlandı
- [x] **BUG 20** — Admin panel `footer_links` sidebar başlığı hardcode ✅ Tamamlandı
- [x] **BUG 22** — `autoTranslate` action Azure yanlış çeviri (EN kaynak fix) ✅ Tamamlandı
- [x] **BUG 23** — `autoTranslate` placeholder koruma (`{days}` → `{Tage}` sorunu) ✅ Tamamlandı
- [x] **BUG 24** — `products/list.js` + `categories/list.js` hardcode TR metinler ✅ Tamamlandı
- [x] **BUG 26** — `admin/pages/ui-translations/list.js` `startAutoTranslate()` toast mesajı yanıltıcı — `res.failed` kontrolü eklendi ✅ Tamamlandı
- [x] **BUG 27** — `autoTranslate` action: `textType=text` geçersiz Azure parametresi (HTTP 400071) → `textType=plain` olarak düzeltildi ✅ Tamamlandı
  - **Fix 1:** [`admin/pages/ui-translations/actions.php`](admin/pages/ui-translations/actions.php) — `$azureBatch` closure'ında `textType=text` → `textType=plain`
  - **Fix 2:** [`admin/pages/ui-translations/actions.php`](admin/pages/ui-translations/actions.php) — `$stats['error_detail']` alanı eklendi; Azure HTTP yanıtından `error.message`/`error.code` parse ediliyor
  - **Fix 3:** [`admin/pages/ui-translations/list.js`](admin/pages/ui-translations/list.js) — `startAutoTranslate()` içinde `res.error_detail` varsa toast mesajına ekleniyor; danger toastlar 10s, warning 6s gösteriliyor
  - **Yeni dosya:** [`database/test_azure.php`](database/test_azure.php) — 6 adımlı Azure bağlantı tanı sayfası (Config → cURL → DNS → API çağrısı → Yanıt parse → Özet)
- [ ] **⚠️ migration_add_client_translations_v2.php tekrar çalıştır** — BUG 24 yeni anahtarlar ⏳
- [ ] **BUG 30** — 3. dillerde DB'de kayıtlı bozuk placeholder'ları UPDATE ile onar (BUG 28 DELETE stratejisi yetersiz kaldı — bazı kayıtlar `is_auto=0` olarak işaretlenmiş) ⏳
  - **Kök neden:** BUG 28 fix scripti (`fix_placeholder_translations.php`) yalnızca `is_auto=1` kayıtları `DELETE` etti; ancak bazı bozuk placeholder kayıtları manuel düzenlemeyle `is_auto=0` yapıldığından silinemedi. TR referansındaki `{xxx}` placeholder'ları `{Tage}`, `{Días}` şeklinde bozuk kaldı.
  - **Fix scripti:** [`database/fix_broken_placeholders_v2.php`](database/fix_broken_placeholders_v2.php) — TR referansından placeholder listesini çeker; 3. dil kayıtlarını `REGEXP` ile tarar; bozuk placeholder isimlerini UPDATE ile onarır (sadece placeholder adlarını değiştirir, çeviri metnini bozmaz)
  - **Çalıştırma:** `http://localhost/database/fix_broken_placeholders_v2.php`
- [ ] **BUG 25** — `languages_stat_*` anahtarları 3. dile autoTranslate edilmemiş ⏳
- [x] **BUG 21** ✅ — Landing page N-dil desteği — **5/5 Tamamlandı** ✅
- [x] **BUG 11** ✅ — Landing `pricing_features` N-dil desteği — **Tamamlandı (11 Nisan 2026)**
- [x] **BUG 35** ✅ — Landing statik UI metinleri N-dil desteği — **Tamamlandı (11 Nisan 2026)**
- [x] **FAZA 12.5** ✅ — Menü Özelleştirme: `menu_settings` tablosu, renk seçici, dinamik CSS, önizleme iframe — **Tamamlandı (11 Nisan 2026)**

### ⚠️ Önemli: Migration ve Script Çalıştırma
`database/migration_add_admin_translations_v2.php` (**v2.4**) BUG 12+13+14+15+16+20 anahtarlarını içerir (toplam 60+ TR/EN anahtar). Tarayıcıda `http://localhost/database/migration_add_admin_translations_v2.php` adresine gidilerek çalıştırılmalıdır. `ON DUPLICATE KEY UPDATE` pattern'i sayesinde güvenle tekrar çalıştırılabilir.

`database/migration_add_client_translations_v2.php` BUG 10+18+19+24 client panel anahtarlarını içerir. **⚠️ Tekrar çalıştırılmalı** — BUG 24 için 30+ yeni `js_*`, `file_*`, `confirm_delete_*` anahtarları eklendi. Tarayıcıda `http://localhost/database/migration_add_client_translations_v2.php` adresine gidilerek çalıştırılmalıdır.

`database/fix_broken_placeholders_v2.php` **⚠️ BUG 30 için çalıştırılmalı** — TR kaynak placeholder'larını referans alarak 3. dil kayıtlarında bozulmuş placeholder isimlerini UPDATE ile onarır. Tarayıcıda `http://localhost/database/fix_broken_placeholders_v2.php` adresine gidilerek çalıştırılmalıdır.

### 📅 Son Düzeltme Tarihleri
- **11 Nisan 2026 (20:30):** **FAZA 12.5 ✅ v24.1** — `border_radius` + `logo_radius` slider arayüzü: `migration_add_menu_settings.php` (`border_radius TINYINT(2) DEFAULT 8`, `logo_radius TINYINT(2) DEFAULT 50` kolonları eklendi); `design.php` slider UI; `design.css` slider stilleri; `design.js` `updatePreviewVar()` + `updatePreviewAction()` (tüm kontroller — renkler, radius, font, logoPosition — canlı iframe'e gönderiliyor); `menu/assets/css/menu.css` (`--menu-border-radius`, `--menu-logo-radius` CSS değişkenleri, tüm ilgili elementler bağlandı); `menu/index.php` + `products.php` + `product-detail.php` inject güncellendi; `menu/assets/js/menu.js` `postMessage` listener eklendi (CSS var + font aksiyon + logoPosition aksiyon); ROADMAP.md + PROJECT_STATUS.md v24.1
- **11 Nisan 2026 (19:45):** **FAZA 12.5 ✅ TAMAMLANDI** — Menü Özelleştirme: `migration_add_menu_settings.php` (user DB `menu_settings` tablosu + varsayılan kayıt); `migration_add_menu_design_translations.php` (26 TR+EN client scope anahtar); `client/pages/menu-design/actions.php` (getSettings/saveSettings AJAX); `client/pages/menu-design/design.php` (renk seçici + önizleme iframe); `design.css` + `design.js` (postMessage canlı güncelleme); sidebar linki; `menu/index.php` + `products.php` + `product-detail.php` dinamik CSS inject (try/catch \Throwable güvenlik ağı); ROADMAP.md + PROJECT_STATUS.md v24.0
- **11 Nisan 2026 (19:30):** **BUG 35 ✅ TAMAMLANDI** — `autoTranslateLanding` static_ui fallback: `$staticUiDefsAT` hardcoded 44 anahtarlık dizi eklendi (migration bağımsız); `$translateChunks` closure `use()` listesine `$pdo` eklendi (P1008 fix); ROADMAP.md + PROJECT_STATUS.md v23.11
- **11 Nisan 2026 (17:45):** **BUG 11 ✅ TAMAMLANDI** — Landing `pricing_features` N-dil desteği: `actions.php` (getLandingItems pricing section + getLandingLanguages sayaç + saveLandingItem beyaz liste + autoTranslateLanding loop), `list.js` (titles map + section sayaç), `list.php` (pricing sidebar butonu), `index.php` (`$getTrans()` closure entegrasyonu); ROADMAP.md + PROJECT_STATUS.md v23.10
- **11 Nisan 2026 (17:15):** **BUG 37 ✅ TAMAMLANDI** — `saveLandingOne()` başarı sonrası `loadLandingItems()` re-render yerine satır bazlı inline güncelleme; `landingPending` korunuyor; `loadLandingLanguages()` badge'i güncelliyor; 98→49 alan kaybolma + pending değer silme sorunu çözüldü; ROADMAP.md + PROJECT_STATUS.md v23.9
- **11 Nisan 2026 (16:44):** **BUG 35 TESPİT EDİLDİ** — Landing statik UI metinleri (~40 anahtar) `$isEnglish ? ... : ...` hardcode; 3. dil fallback yok; `ui_translations(scope='landing')` tablosunda bu anahtarlar yok; admin panelde görünmüyor. 4 adımlı fix planı: (1) `migration_add_landing_ui_translations.php` seed; (2) `index.php` ternary → `Lang::h()`; (3) `actions.php` `scope='landing'` bloğu kaldır; (4) `list.js` `static_ui` bölümü ekle. ROADMAP.md + PROJECT_STATUS.md v23.7
- **11 Nisan 2026 (16:35):** **BUG 34 ✅ TAMAMLANDI** — `index.php` `ui_languages` sorgusu `flag_emoji`/`flag_code` → `flag` kolon adı düzeltildi; `$langToFlagCode` sözlüğü eklendi (30+ dil kodu → SVG ülke kodu); catch bloğuna düşülmesi önlendi → 3. dil artık landing page dil seçicisinde görünüyor; ROADMAP.md + PROJECT_STATUS.md v23.6
- **11 Nisan 2026 (16:20):** **BUG 32 ✅ + BUG 33 ✅ TAMAMLANDI** — BUG 32: landing kaydetme (`item.field_key` fix, `landing_translations` auto-migration, `<ul>` yapısı, yeni CSS sınıfları — 4 dosya); BUG 33: `addLanguage()`/`deleteLang()` → `loadLandingLanguages()` senkronizasyonu; ROADMAP.md + PROJECT_STATUS.md v23.5
- **11 Nisan 2026 (16:05):** **BUG 21 (5/5) ✅ TAMAMLANDI** — `index.php` `$activeLangs` (DB'den dinamik), `$transMap` (landing_translations), `$getTrans()` closure (N-dil fallback), floating dil paneli dinamik `$activeLangs` döngüsü; ROADMAP.md + PROJECT_STATUS.md v23.3
- **11 Nisan 2026 (16:00):** BUG 21 (4/5) — `admin/pages/ui-translations/list.js` `loadLandingLanguages()` + `selectLandingLanguage()` + tüm landing API çağrıları `lang_code` dinamik; `autoTranslateLanding()` seçili dile çeviri + `loadLandingLanguages()` yenileme; ROADMAP.md + PROJECT_STATUS.md v23.2
- **11 Nisan 2026 (15:35):** BUG 31 (alerjen çevirisi + şube custom file input + branches/list.js window.langStrings) ✅ tamamlandı; ROADMAP.md ve PROJECT_STATUS.md v23.1 güncellendi
- **11 Nisan 2026 (15:15):** BUG 30 (`fix_broken_placeholders_v2.php` UPDATE stratejisi) scripti oluşturuldu ⏳; ROADMAP.md ve PROJECT_STATUS.md v23.0 güncellendi
- **11 Nisan 2026 (14:55):** BUG 28 (placeholder onarım scripti) ✅, BUG 29 (custom file input wrapper) ✅ tamamlandı; v22.9
- **11 Nisan 2026 (14:40):** BUG 27 (`textType=text` → `textType=plain`, Azure 400071 fix) ✅ tamamlandı; [`database/test_azure.php`](database/test_azure.php) tanı sayfası oluşturuldu; v22.7
- **11 Nisan 2026 (14:35):** BUG 26 (`startAutoTranslate()` toast `res.failed` kontrolü) ✅ tamamlandı; v22.6
- **11 Nisan 2026 (14:30):** BUG 23 (placeholder koruma) ✅, BUG 24 (JS hardcode) ✅ tamamlandı; `migration_add_client_translations_v2.php` tekrar çalıştırılmalı ⚠️; BUG 25, 21, 11 sırada ⏳
- **11 Nisan 2026 (14:00):** BUG 20 ✅, BUG 22 ✅ tamamlandı; `migration_add_admin_translations_v2.php` v2.4 çalıştırıldı
- **11 Nisan 2026 (13:00):** BUG 19 (languages/list.js loadStats hardcode) ✅ tamamlandı
- **11 Nisan 2026 (12:50):** BUG 10 (7 sayfa) ✅, BUG 18 (client sidebar) ✅ tamamlandı

---

## 🌐 FAZA 12: PANEL UI ÇEVİRİ SİSTEMİ ✅

**Başlangıç:** 8 Nisan 2026
**Tamamlanma:** 9 Nisan 2026
**Durum:** ✅ Tamamlandı

### Tamamlanan Adımlar:

- [x] `database/migration_add_ui_translations.php` — `qrmenu_main`'e `ui_languages` + `ui_translations` tabloları; `users` tablosuna `panel_lang VARCHAR(10)` kolonu; TR varsayılan (~160 anahtar) + EN otomatik çevirisi için temel eklendi
- [x] `admin/pages/ui-translations/actions.php` — Admin AJAX backend:
  - `getLanguages` — dil listesi + her dilin çeviri sayısı
  - `addLanguage` — yeni dil ekle (varsa pasiften aktife al)
  - `deleteLanguage` — varsayılan dil silinemez koruması + CASCADE
  - `setDefault` — varsayılan dil değiştir
  - `getTranslations` — Türkçe baz + hedef dil, sayfalı, arama/filtre destekli
  - `saveTranslation` / `saveBulk` — tek / toplu UPSERT
  - `autoTranslate` — Azure Translator ile eksik çevirileri batch üret (25'erlik grup, 100ms delay)
- [x] `admin/pages/ui-translations/list.php` — Admin UI yönetim sayfası:
  - Sol panel: dil listesi, dil ekle, sil, varsayılan yap, her dil için çeviri sayısı
  - Sağ panel: seçili dilin çeviri editörü (2 sütun: kaynak + hedef), istatistik rozetleri
  - Progress modal (Azure çeviri sırasında)
  - Dil ekleme modal + otomatik çeviri seçeneği
- [x] `admin/pages/ui-translations/list.js` — Tam interaktif JS:
  - Dil seçimi, çeviri lazy-load (30/sayfa), pagination, arama/filtre
  - Kaydedilmemiş değişiklik takibi (`pendingChanges` Map)
  - Tek kayıt + toplu kayıt, Azure otomatik çeviri tetikleme
  - Toast bildirimleri, HTML escape güvenliği
- [x] `admin/pages/ui-translations/list.css` — Responsive iki sütun layout, trans-row grid, scrollable paneller, dark overlay badge stilleri

### Tamamlanan Tüm Adımlar (9 Nisan 2026):
- [x] `admin/components/sidebar/sidebar.php` — "UI Çevirileri" linki eklendi (`fas fa-language` ikonu)
- [x] `core/Lang.php` — `Lang::loadFromDB(PDO $pdo, string $locale)` metodu eklendi; TR fallback + dosya sistemi son fallback zinciri
- [x] `client/pages/profile/profile.php` — Panel dil seçici; aktif `ui_languages` listesi → `users.panel_lang` güncelleme + `Session::set('panel_lang', ...)`
- [x] Client panel sayfaları (`dashboard.php`, `branches/list.php`, `categories/list.php`, `products/list.php`) — `Lang::loadFromDB()` entegrasyonu tamamlandı

---

## 🌍 FAZA 11 DEVAM - TAMAMLANAN ADIMLAR

**Başlangıç:** 5 Nisan 2026
**Durum:** ✅ Tamamlandı

### Tamamlanan Adımlar:

- [x] `schema_user.sql` — `languages` ve `translations` tabloları zaten mevcut
- [x] `config.php` — Azure Translator sabitleri eklendi
- [x] `core/Translator.php` — Azure API wrapper sınıfı (PDO private metodlar ile)
- [x] `database/migration_add_languages.php` — mevcut user DB'lerine tablo eklendi
- [x] `client/pages/languages/` — dil yönetimi sayfaları (list.php, css, js, actions.php)
- [x] `client/pages/translations/` — çeviri yönetimi sayfaları (list.php, css, js, actions.php)
- [x] Client sidebar güncellendi ("Diller" ve "Çeviriler" linkleri)
- [x] `menu/components/header.php` — dil değiştirici bayrak bar komponenti
- [x] `menu/index.php` — `?lang=` parametresi ile dil desteği
- [x] `menu/products.php` — dil desteği (çevrilen başlık/açıklama)
- [x] `menu/product-detail.php` — dil desteği (tüm metin alanları çevriliyor)
- [x] `menu/assets/css/menu.css` — `.lang-switcher-bar`, `.lang-btn`, `.lang-flag`, `.lang-code` stilleri

### Tamamlanan (Faz 11 Sonrası):

- [x] **GIT COMMIT** - "FAZA 11 tamamlandı"
- [x] `autoTranslate` mesaj bug'ı düzeltildi (7 Nisan 2026)
- [x] **Floating dil seçici UI** tamamlandı (7 Nisan 2026)
  - Yatay bar → sağ altta bayraklı buton + yukarı süzülen dil paneli
  - Scroll pozisyon koruması: dil değiştirince sayfa yerinde kalır (`sessionStorage`)
  - `setupFloatingActions()` ile scroll-top-btn ve lang-switcher aynı `.floating-actions` grubunda
- [x] **getStats düzeltmesi** — boş description/ingredients alanları artık sayılmıyor
- [x] **translations/actions.php pagination** — büyük veri desteği (800+ ürün)
- [x] **translations/list.js pagination UI** — "Daha Fazla Yükle" lazy-load sistemi

### Tamamlanan (Faz 11 Hata Düzeltme Devamı — 9 Nisan 2026):

- [x] **`profile.php` `update_lang` AJAX fix** — field adı `panel_lang`, `X-Requested-With` header, JSON response + `exit` eklendi
- [x] **`navbar.js` `setClientLang()`** — `lang_code` → `panel_lang`, `X-Requested-With: XMLHttpRequest` header eklendi
- [x] **`translations/list.js`** — 3 UX bug düzeltildi: displayLabel kısaltma + tooltip, kayıt/silme rozet güncelleme, silme sonrası global stats

### Bekleyen / Sırada:

- [x] **core/Translator.php `autoTranslateAll`** — `ignore_user_abort(true)` + `connection_aborted()` log ✅ (9 Nisan 2026)

---

## 🌐 FAZA 11.5: ÇEVİRİ SİSTEMİ GENİŞLETMESİ ✅
**Başlangıç:** 7 Nisan 2026 | **Tamamlanma:** 7 Nisan 2026
**Durum:** ✅ Tamamlandı

### Tamamlanan Adımlar:

**A) Menü Sabit Metinleri:**
- [x] `menu/config/translations.php` — 6 dil (TR, EN, DE, FR, AR, RU), ~40 UI anahtarı
- [x] `menu/index.php` — `$ui` ile sabit metinler (dil koduna göre)
- [x] `menu/products.php` — `$ui['no_products']`, `$ui['calorie_unit']`, `$ui['allergen_badge']`
- [x] `menu/product-detail.php` — `$ui` ile alerjen etiketleri, kalori, malzeme, navigasyon
- [x] `menu/components/footer.php` — `$ui['follow_us']` + fallback mekanizması
- [x] Alerjen `label_key` pattern — `$allergenIcons` dizisinde her alerjen için çeviri anahtarı

**B) Client Panel i18n:**
- [x] `core/Lang.php` — statik i18n yardımcı sınıfı (`Lang::load()`, `Lang::t()`, `Lang::h()`)
- [x] `client/config/lang/tr.php` — ~150 Türkçe anahtar (genel, navigasyon, dashboard, şubeler, kategoriler, ürünler, profil)
- [x] `client/config/lang/en.php` — ~150 İngilizce anahtar (aynı yapı)

**C) Landing Page Çok Dil Desteği:**
- [x] `database/migration_add_landing_translations.php` — landing tablolarına `_en` kolonları ekler
  - `landing_settings`: `site_title_en`, `site_subtitle_en`, `hero_cta_primary_en`, `hero_cta_secondary_en`, `footer_about_en`
  - `landing_features`: `title_en`, `description_en`
  - `landing_steps`: `title_en`, `description_en`
  - `landing_faqs`: `question_en`, `answer_en`
  - `landing_footer_links`: `title_en`
- [x] `admin/pages/landing/settings.php` — Hero Section + Footer About'a TR|EN Bootstrap sekmeleri
- [x] `admin/pages/landing/settings_actions.php` — 5 adet `_en` alanı UPDATE'e eklendi
- [x] `admin/pages/landing/features.php` — Add/Edit modal'a TR|EN sekmeleri + `data-*` attr
- [x] `admin/pages/landing/features_actions.php` — `title_en`, `description_en` INSERT/UPDATE
- [x] `admin/pages/landing/features.js` — edit handler: `dataset.titleEn`, `dataset.descriptionEn`
- [x] `admin/pages/landing/steps.php` — Add/Edit modal'a TR|EN sekmeleri + `data-*` attr
- [x] `admin/pages/landing/steps_actions.php` — `title_en`, `description_en` INSERT/UPDATE
- [x] `admin/pages/landing/steps.js` — edit handler: `dataset.titleEn`, `dataset.descriptionEn`
- [x] `admin/pages/landing/faqs.php` — Add/Edit modal'a TR|EN sekmeleri + `data-*` attr
- [x] `admin/pages/landing/faqs_actions.php` — `question_en`, `answer_en` INSERT/UPDATE
- [x] `admin/pages/landing/faqs.js` — edit handler: `dataset.questionEn`, `dataset.answerEn`
- [x] `index.php` — `?lang=en` ile tam İngilizce landing page:
  - Dil tespiti: `$langCode = strtolower($_GET['lang'] ?? 'tr')`
  - `_en` kolon uygulama: settings, features, steps, faqs için EN → TR fallback
  - Navbar'da 🇹🇷/🇬🇧 dil seçici linkleri (`/?lang=tr`, `/?lang=en`)
  - Tüm statik metinler: bölüm başlıkları, butonlar, form etiketleri, footer

### 📝 TESTLER:
```
✓ TEST 11.5.1: http://localhost açıldığında Türkçe görünüyor mu?
✓ TEST 11.5.2: Navbar'da 🇹🇷🇬🇧 bayraklar var mı?
✓ TEST 11.5.3: 🇬🇧 tıkla, http://localhost/?lang=en oldu mu?
✓ TEST 11.5.4: Tüm sayfa İngilizce görünüyor mu?
✓ TEST 11.5.5: Admin > Landing > Ayarlar sayfasında Hero Section'da TR|EN sekmeleri var mı?
✓ TEST 11.5.6: İngilizce başlık kaydet, /?lang=en'de görünüyor mu?
✓ TEST 11.5.7: Admin > Landing > Özellikler — Add/Edit modal'da TR|EN sekmeleri var mı?
✓ TEST 11.5.8: Admin > Landing > Adımlar — Add/Edit modal'da TR|EN sekmeleri var mı?
✓ TEST 11.5.9: Admin > Landing > SSS — Add/Edit modal'da TR|EN sekmeleri var mı?
✓ TEST 11.5.10: Menüde alerjen adları İngilizce'ye geçince "Gluten" mi görünüyor?
✓ TEST 11.5.11: database/migration_add_landing_translations.php çalıştırıldı mı?
✓ TEST 11.5.12: GIT COMMIT yapıldı mı?
```

**Onay:** "FAZA 11.5 OK"

---

### Tamamlanan (Hata Düzeltme — 9 Nisan 2026):
- [x] **`profile.php` `update_lang` AJAX fix** — JSON response, `panel_lang` field, `X-Requested-With` header
- [x] **`client/components/navbar/navbar.js` `setClientLang()`** — `panel_lang` field + `X-Requested-With` header
- [x] **`translations/list.js`** — 3 bug: displayLabel tooltip, kayıt/silme rozet, silme global stats

### Tamamlanan (9 Nisan 2026):
- [x] **`core/Translator.php` `autoTranslateAll()`** — `ignore_user_abort(true)` eklendi; her batch öncesi `connection_aborted()` log kontrolü eklendi; versiyon 1.1 olarak güncellendi
- [x] **`admin/pages/ui-translations/actions.php` POST/GET fix** — `getTranslations` ve `getLandingItems` action'larında parametreler `$_POST ?? $_GET ?? default` fallback pattern ile okunuyor
- [x] **Landing sayfaları EN sekme temizliği** — `settings.php`, `features.php`, `steps.php`, `faqs.php`'deki Bootstrap TR|EN tab yapısı kaldırıldı; formlar sadece Türkçe içerik için
- [x] **Admin Sidebar** — "PANEL DİLLERİ" → "ÇEVİRİLER", "UI Çevirileri" → "Çeviri Yönetimi" olarak güncellendi

### Tamamlanan (9 Nisan 2026 — install.php):
- [x] **`database/install.php`** — Tüm migration/setup scriptlerini tek kurulum dosyasına birleştiren idempotent script oluşturuldu (ADIM 1–10, Bootstrap 5 arayüz, güvenli yeniden çalıştırma, ✅/⚠️/❌ log çıktısı)

### Tamamlanan (9 Nisan 2026 — Hosting uyumluluk fix):
- [x] **`core/Database.php`** — PDO `PDO::MYSQL_ATTR_INIT_COMMAND` ile `SET SESSION sql_mode='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'` eklendi; `NO_ZERO_DATE` ve `NO_ZERO_IN_DATE` strict modları kaldırıldı. SQLSTATE HY000 / 1525 hatası giderildi.
- [x] **`login.php`** — `deleted_at` kolon sorguları `OR deleted_at = '0000-00-00 00:00:00'` koşulu kaldırılarak `deleted_at IS NULL` olarak güncellendi (e-posta ve username sorguları)

### Tamamlanan (10 Nisan 2026 — Ekstra Düzeltmeler):
- [x] **Test dosyaları temizlendi** — `database/debug_session.php` ve `database/test_login.php` silindi ✅
- [x] **`autoTranslateLanding` doğrulama** — landing `_en` kolonlarına yazma testi yapıldı ✅
- [x] **Landing sayfası floating widget** — `index.php`, `assets/css/landing.css`, `assets/js/landing.js` güncellendi ✅
- [x] **actions.php base_count + scope exception + cURL SSL fix** ✅
- [x] **core/Translator.php cURL SSL_VERIFYPEER fix** ✅

### Tamamlanan (11 Nisan 2026 — FAZA 12.5):
- [x] **FAZA 12.5 ✅ TAMAMLANDI (v24.1)** — Menü Özelleştirme — Tüm bileşenler tamamlandı:
  - `database/migration_add_menu_settings.php` — idempotent, tüm mevcut `user_{id}` DB'lerine `menu_settings` tablosu + `border_radius TINYINT(2) DEFAULT 8` + `logo_radius TINYINT(2) DEFAULT 50` kolonları + varsayılan ID=1 kaydı
  - `database/migration_add_menu_design_translations.php` — 13 anahtar TR + 13 anahtar EN = 26 client scope kayıt (`menu_design_*`, `sidebar_menu_design`, `menu_design_border_radius`, `menu_design_logo_radius` dahil)
  - `client/pages/menu-design/actions.php` — `getSettings` ve `saveSettings` AJAX; hex renk validasyonu; font/logo whitelist; `border_radius` + `logo_radius` UPSERT ON DUPLICATE KEY UPDATE
  - `client/pages/menu-design/design.php` — renk seçici çiftleri (picker↔hex), font dropdown, logo konum seçici, `border_radius` slider (0–50px), `logo_radius` slider (0–50px), önizleme iframe
  - `client/pages/menu-design/design.css` — `.design-card`, `.color-row`, `.color-picker-wrap`, `.logo-pos-grid`, `.preview-frame-wrap`, slider stilleri (`.radius-slider`, `.radius-display`)
  - `client/pages/menu-design/design.js` — renk çifti senkronizasyonu, slider mantığı, AJAX save/reset, `updatePreviewVar(cssVar, value)` (renkler + radius), `updatePreviewAction(action, value)` (font + logoPosition) — tüm kontroller canlı iframe'e gönderilir
  - `menu/assets/css/menu.css` — `--menu-border-radius: 8px` + `--menu-logo-radius: 50%` `:root` tanımları; tüm ilgili elementler (`btn`, `.branch-hero-logo`, `.category-card`, `.product-card` vb.) CSS değişkenlerine bağlandı
  - `client/components/sidebar/sidebar.php` — "Menü Tasarımı" linki eklendi (`fas fa-palette` ikonu)
  - `menu/index.php` + `menu/products.php` + `menu/product-detail.php` — `menu_settings` fetch + `:root { --var: val }` CSS inject (border_radius + logo_radius dahil; `try/catch \Throwable` güvenlik ağı)
  - `menu/assets/js/menu.js` — `if (window.self !== window.top)` guard ile `postMessage` listener eklendi; CSS değişkeni güncellemeleri (`e.data.var`), `font` aksiyon, `logoPosition` aksiyon işleniyor

### ✅ FAZA 13 Tamamlandı (11 Nisan 2026):
- [x] `database/migration_add_api_keys.php` — Her `user_{id}` DB'sine `api_keys` + `api_logs` tabloları eklendi
- [x] `core/RateLimiter.php` — Dosya tabanlı rate limiter (150 req/dk, kayan pencere, X-RateLimit-* başlıkları)
- [x] `api/v1/auth.php` — Bearer token + query param auth; `logApiRequest`, `apiSuccess`, `apiError` global fonksiyonlar
- [x] `api/v1/index.php` — `API_V1_ENTRY` guard; `GET /` bilgi endpoint; rota dağıtımı
- [x] `api/v1/menu.php` — `GET /menu/{username}`, `/categories`, `/products`, `/products/{id}`; `?lang=`, `?branch_id=`, `?category_id=` desteği
- [x] `api/v1/categories.php` — GET liste+detay, POST, PUT, DELETE; `?with_products=1`, `?branch_id=`
- [x] `api/v1/products.php` — GET liste+detay, POST, PUT, DELETE; `?with_prices=1`; `default_price` + `prices[]`
- [x] `client/pages/api-settings/` — `actions.php` (generate, list, delete, toggle, get_stats), `list.php`, `list.css`, `list.js`
- [x] `client/components/sidebar/sidebar.php` — "API Ayarları" linki (`fas fa-code` ikonu)
- [x] `config.php` — `API_RATE_LIMIT` 60 → 150
- [x] `client/config/lang/tr.php` — `sidebar_api_settings => 'API Ayarları'`
- [x] `client/config/lang/en.php` — `sidebar_api_settings => 'API Settings'`

### ✅ FAZA 14 Tamamlandı (14 Nisan 2026):
- [x] `client/pages/subscription/actions.php` — AJAX backend (getSubscription, calculatePrice, submitPayment, getHistory, getPendingPayment)
- [x] `client/pages/subscription/list.php` — Abonelik sayfası UI + `Lang::h()` i18n entegrasyonu
- [x] `client/pages/subscription/list.css` — Abonelik sayfası stilleri
- [x] `client/pages/subscription/list.js` — IBAN kopyalama, dekont upload, ödeme gönderme, geçmiş yenileme + `cfg.i18n` i18n entegrasyonu
- [x] `client/components/sidebar/sidebar.php` — "Aboneliğim" sidebar linki eklendi
- [x] `admin/pages/payments/actions.php` — Ödeme onaylama sırasında abonelik uzatma mantığı güçlendirildi
- [x] `database/setup.php` — `api_*` + `sub_*` çeviri anahtarları (~110 anahtar) eklendi
- [x] `client/pages/api-settings/list.php` + `list.js` — `Lang::h()` + `cfg.i18n` tam i18n entegrasyonu
- [x] `client/pages/subscription/list.php` + `list.js` — `Lang::h()` + `cfg.i18n` tam i18n entegrasyonu

### ✅ FAZA 13 API Test Doğrulaması (16 Nisan 2026):
- [x] `GET /api/v1/` — Auth gerektirmez, API bilgi JSON döner
- [x] `GET /api/v1/categories` — Geçersiz key → 401, geçerli key → 200
- [x] `POST /api/v1/categories` — Kategori oluşturma (`name_key`, `description_key`)
- [x] `GET /api/v1/categories/{id}` — Kategori detayı
- [x] `PUT /api/v1/categories/{id}` — Kategori güncelleme
- [x] `POST /api/v1/products` — Ürün oluşturma (`name_key`, `category_id`, `default_price`, `calories`)
- [x] `GET /api/v1/products` — Ürün listesi
- [x] `GET /api/v1/products/{id}` — Ürün detayı
- [x] `PUT /api/v1/products/{id}` — Ürün güncelleme
- [x] `DELETE /api/v1/products/{id}` — Ürün silme
- [x] `DELETE /api/v1/categories/{id}` — Kategori silme
- [x] `users.database_name` uyumsuzluğu fix — `user_temp_xxx` → `user_1` düzeltildi
- [x] `database/api_debug.php` + `database/fix_database_name_mismatch.php` temizlendi
- [x] `register.php` doğrulandı — yeni kayıtlar `database_name = 'user_' . $user_id` ile doğru set edilmekte

### ✅ api_logs Şema Bütünlüğü Düzeltmeleri (16 Nisan 2026 — v27.2):
- [x] `database/schema_user.sql` — `api_logs`: `request_data TEXT` → `user_agent VARCHAR(255)` + `execution_ms INT UNSIGNED`
- [x] `database/setup.php` — ADIM 5 (PHP `api_logs` tanımı) + ADIM 6 (heredoc `schema_user.sql` içeriği) aynı şema düzeltmesi
- [x] `database/migration_fix_api_logs_schema.php` — Canlı DB'ler için idempotent migration:
  - Tablo varsa: `user_agent` yok → ADD COLUMN; `execution_ms` yok → ADD COLUMN; `request_data` var → DROP COLUMN
  - Tablo yoksa: Doğru şemayla CREATE TABLE
  - Bootstrap 5 HTML arayüzü + Güncellendi / Atlandı / Hata sayaçları
  - **Çalıştırma:** `http://localhost/database/migration_fix_api_logs_schema.php`

### ✅ FAZA 15 Tamamlandı (16 Nisan 2026):
- [x] `composer.json` + `vendor/` — PHPMailer v7.0.2
- [x] `config.php` — SMTP sabitleri (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_ENCRYPTION`, `ADMIN_EMAIL`, `MAIL_FROM_NAME`)
- [x] `core/Mailer.php` — PHPMailer wrapper; simüle mod; 6 bildirim metodu
- [x] `email-templates/` — 6 HTML template (welcome, payment-received-admin, payment-approved, payment-rejected, trial-expiring, subscription-expiring)
- [x] `database/migration_add_email_logs.php` — `email_logs` tablosu + indeksler (idempotent)
- [x] `core/Database.php` — `getMainConnection()` alias metodu
- [x] `register.php` — `sendWelcomeEmail()` try/catch entegrasyonu
- [x] `admin/pages/payments/actions.php` — `sendPaymentApproved()` + `sendPaymentRejected()` (user fetch eklendi)
- [x] `client/pages/subscription/actions.php` — `sendPaymentReceivedToAdmin()` commit sonrası
- [x] `cron/trial_reminder.php` — trial + abonelik bitiş uyarıları, `email_logs` idempotency
- [x] `database/test_mailer.php` — 6 simülasyon testi + SMTP config kontrolü

### Sıradaki Faz:
- [x] **FAZA 16 — Yedekleme Sistemi** ✅ — mysqldump, otomatik cron (cron/backup.php), admin paneli manuel yedek butonu
- [x] **FAZA 17 — Demo Veriler ve İlk Kurulum** ✅ — seed_demo_data.php, 4 kategori, 14 ürün, kayıt formu checkbox, client panel silme butonu

---

### ✅ FAZA 12 Tamamlandı (9 Nisan 2026):
- [x] `admin/components/sidebar/sidebar.php` — "UI Çevirileri" menü linki eklendi
- [x] `core/Lang.php` — `loadFromDB(PDO, locale)` metodu eklendi, DB'den yükleme aktif
- [x] `client/pages/profile/profile.php` — Panel dil seçici tamamlandı
- [x] Client panel sayfaları — `Lang::loadFromDB()` entegrasyonu tamamlandı

### ✅ Floating Bayraklı Dil Seçici Tamamlandı (9 Nisan 2026):
- [x] `admin/pages/ui-translations/actions.php` — `setAdminLang` AJAX action (session tabanlı)
- [x] `admin/components/navbar/navbar.php/.css/.js` — Admin floating dil seçici
- [x] `client/components/navbar/navbar.php/.css/.js` — Client floating dil seçici
- [x] Yerel SVG bayraklar + proxy fallback — `emojiFlagToCC()`, `getLangCC()`, `getFlagImg()` utility fonksiyonları
- [x] Backdrop tıklanınca panel kapanıyor, z-index hiyerarşisi doğru

### ✅ Merkezi Çeviri Sistemi + Landing Temizliği Tamamlandı (9 Nisan 2026):
- [x] `database/migration_add_translation_scope.php` — `scope` ENUM kolonu + `uq_lang_scope_key` UNIQUE KEY
- [x] `admin/pages/ui-translations/actions.php` v2.0 — `scope` parametresi + `getLandingItems` / `saveLandingItem` / `autoTranslateLanding` + POST/GET fix
- [x] `admin/pages/ui-translations/list.php` v2.0 — 3 Bootstrap sekme (Kullanıcı Paneli / Admin Paneli / Landing Site)
- [x] `admin/pages/ui-translations/list.js` v2.0 — `state[scope]` + landing render + `onScopeChange()`
- [x] `admin/pages/landing/settings.php` — Hero Section ve Footer About'taki EN sekmeleri kaldırıldı
- [x] `admin/pages/landing/features.php` — Add/Edit modal'lardaki EN sekmeleri kaldırıldı
- [x] `admin/pages/landing/steps.php` — Add/Edit modal'lardaki EN sekmeleri kaldırıldı
- [x] `admin/pages/landing/faqs.php` — Add/Edit modal'lardaki EN sekmeleri kaldırıldı
- [x] `admin/components/sidebar/sidebar.php` — "PANEL DİLLERİ" → "ÇEVİRİLER", "UI Çevirileri" → "Çeviri Yönetimi"