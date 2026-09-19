# ENTEGRASYON UYGULAMASI GENİŞLETME PLANI

**Tarih:** 2026-04-28  
**Proje:** QR Menu Python Tkinter Entegrasyon Uygulaması  
**API:** `http://lokdo.com.tr/api/v1/`  
**Bearer Token:** `qrm_9a6aba8fab30bdadda8140d60b8b18aeeba6eff8ee04b29c`

---

## 1. MEVCUT DURUM ÖZETİ

### 1.1 Python Uygulaması Mevcut Mimarisi

| Dosya | Rol | İçerik |
|---|---|---|
| `main.py` | Ana UI | 4 sekme: Ayarlar, Veri Kaynağı, Resim Klasörü, Senkronizasyon |
| `api_client.py` | HTTP İstemci | Bearer auth, rate limiter 150 req/dk, CRUD + resim upload |
| `sync_engine.py` | Senkronizasyon Motoru | Slug düzeltme, ürün/kategori sync, skip-unchanged mantığı |
| `db_connector.py` | DB Bağlantısı | MSSQL via pyodbc + MySQL bağlantısı |
| `excel_reader.py` | Excel Okuyucu | openpyxl tabanlı Excel yükleme |
| `settings_manager.py` | Ayar Yönetimi | JSON tabanlı settings.json okuma/yazma |

### 1.2 Mevcut API Endpoint'leri

```
GET    /api/v1/categories                  — Kategori listesi (branch_id filtresi var)
GET    /api/v1/categories/{id}             — Kategori detayı (?with_products=1)
POST   /api/v1/categories                  — Yeni kategori (name_key, is_active)
PUT    /api/v1/categories/{id}             — Kategori güncelle (is_active DESTEKLENIYOR)
DELETE /api/v1/categories/{id}             — Kategori sil

GET    /api/v1/products                    — Ürün listesi (?branch_id, ?category_id, ?with_prices=1)
GET    /api/v1/products/{id}               — Ürün detayı
POST   /api/v1/products                    — Yeni ürün (name_key, category_id, calories, is_active)
PUT    /api/v1/products/{id}               — Ürün güncelle (is_active DESTEKLENIYOR, calories DESTEKLENIYOR)
DELETE /api/v1/products/{id}               — Ürün sil

POST   /api/v1/products/{id}/image         — Ürün resmi yükle
POST   /api/v1/categories/{id}/image       — Kategori resmi yükle
POST   /api/v1/categories/{id}/banner      — Kategori banner yükle
```

### 1.3 Veritabanı Tabloları (schema_user.sql özeti)

| Tablo | İlgili Kolonlar |
|---|---|
| `products` | id, name_key, category_id, calories, is_active, sort_order |
| `categories` | id, name_key, is_active, sort_order |
| `product_branches` | product_id, branch_id, price, is_active — UNIQUE(product_id, branch_id) |
| `category_branches` | category_id, branch_id, is_active — UNIQUE(category_id, branch_id) |
| `branches` | id, name, is_active, deleted_at |

---

## 2. API DURUM ANALİZİ — NE VAR, NE EKSİK

### 2.1 Ürün Aktif/Pasif Yönetimi

**DURUM: API MEVCUT — ekstra PHP endpoint GEREKMEZ**

`PUT /api/v1/products/{id}` body'sine `{"is_active": false}` göndermek yeterli.  
`products.php` satır 445-447'de `is_active` alanı tam destekleniyor.  
Python tarafında sadece yeni UI sekmesi + `api_client.toggle_product_active()` metodu eklenmeli.

### 2.2 Kategori Aktif/Pasif Yönetimi

**DURUM: API MEVCUT — ekstra PHP endpoint GEREKMEZ**

`PUT /api/v1/categories/{id}` body'sine `{"is_active": false}` göndermek yeterli.  
`categories.php` satır 326-328'de `is_active` alanı tam destekleniyor.  
Python tarafında sadece yeni UI sekmesi + `api_client.toggle_category_active()` metodu eklenmeli.

### 2.3 Excel Kalori Import

**DURUM: API MEVCUT — ekstra PHP endpoint GEREKMEZ**

`PUT /api/v1/products/{id}` body'sine `{"calories": 350}` göndermek yeterli.  
`products.php` satır 453-459'da `calories` alanı tam destekleniyor (0-10000 arası integer).  
Python tarafında yeni UI sekmesi + `calorie_importer.py` modülü gerekiyor.

### 2.4 Şube Ürün Yönetimi

**DURUM: KISMİ — 3 yeni PHP endpoint eklenmeli**

**Mevcut:**
- `GET /api/v1/products?with_prices=1` tüm ürünlerin şube fiyat/aktif durumunu döner.
- `PUT /api/v1/products/{id}` body'de `prices: [{branch_id, price, is_active}]` ile tüm şube kayıtları toplu güncellenir, **ancak bu önce DELETE sonra INSERT yapar** — tek şube toggle için tehlikelidir.

**Eksik:**
- `GET /api/v1/branches` — şube listesi endpoint'i yok (index.php'de kayıtlı değil)
- `PUT /api/v1/products/{product_id}/branches/{branch_id}` — tek şube UPSERT endpoint'i yok
- `PUT /api/v1/categories/{category_id}/branches/{branch_id}` — kategori-şube UPSERT endpoint'i yok

### 2.5 Eksik Endpoint Özeti

| Endpoint | Durum | Öncelik |
|---|---|---|
| `GET /api/v1/branches` | YOK — eklenmeli | YÜKSEK |
| `PUT /api/v1/products/{id}/branches/{bid}` | YOK — eklenmeli | YÜKSEK |
| `PUT /api/v1/categories/{id}/branches/{bid}` | YOK — eklenmeli | ORTA |

---

## 3. EKLENECEKLERİN DETAYLI TASARIMI

### 3.1 Yeni PHP Dosyası: api/v1/branches.php

```
GET /api/v1/branches
→ Auth gerekli (Bearer token)
→ SQL: SELECT id, name, is_active, created_at
        FROM branches
        WHERE deleted_at IS NULL
        ORDER BY id ASC
→ Yanıt: {"success": true, "branches": [{id, name, is_active, created_at}], "total": N}
```

### 3.2 Yeni PHP Dosyası: api/v1/branch_products.php

```
PUT /api/v1/products/{product_id}/branches/{branch_id}
→ Auth gerekli
→ Body: {"is_active": bool, "price": float}
→ SQL: INSERT INTO product_branches (product_id, branch_id, price, is_active, created_at)
        VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          is_active = VALUES(is_active),
          price = VALUES(price),
          updated_at = NOW()
→ Yanıt: {"success": true, "is_active": bool, "price": float, "message": "..."}
```

### 3.3 Yeni PHP Dosyası: api/v1/branch_categories.php

```
PUT /api/v1/categories/{category_id}/branches/{branch_id}
→ Auth gerekli
→ Body: {"is_active": bool}
→ SQL: INSERT INTO category_branches (category_id, branch_id, is_active, created_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
          is_active = VALUES(is_active)
→ Yanıt: {"success": true, "is_active": bool, "message": "..."}
```

### 3.4 api/v1/index.php Güncellemesi

Mevcut routing bloğuna 3 yeni rota eklenmeli:

```php
// GET /api/v1/branches
if (preg_match('#^/branches$#', $path)) {
    require_once __DIR__ . '/branches.php';
    exit;
}

// PUT /api/v1/products/{id}/branches/{branch_id}
if (preg_match('#^/products/\d+/branches/\d+$#', $path)) {
    require_once __DIR__ . '/branch_products.php';
    exit;
}

// PUT /api/v1/categories/{id}/branches/{branch_id}
if (preg_match('#^/categories/\d+/branches/\d+$#', $path)) {
    require_once __DIR__ . '/branch_categories.php';
    exit;
}
```

**Ekleme noktası:** Mevcut `/products` ve `/categories` regex bloklarından ÖNCE (daha spesifik pattern'ler önce eşleşmeli).

---

## 4. PYTHON UYGULAMASI — YENİ MODÜLLER VE METOTLAR

### 4.1 Yeni Python Dosyaları

| Dosya | Konum | İçerik |
|---|---|---|
| `calorie_importer.py` | Entegrasyon dizini | Excel kalori import motoru |
| `branch_manager.py` | Entegrasyon dizini | Şube-ürün yönetim önbelleği |

### 4.2 api_client.py'ye Eklenecek Metotlar

```python
def get_branches(self) -> list:
    """GET /api/v1/branches — Şube listesini döner."""
    result = self._get('/branches')
    if isinstance(result, dict):
        return result.get('branches', [])
    return []

def toggle_product_active(self, prod_id: int, is_active: bool) -> dict:
    """PUT /api/v1/products/{id} — Sadece is_active günceller."""
    return self._put(f'/products/{prod_id}', {'is_active': is_active})

def toggle_category_active(self, cat_id: int, is_active: bool) -> dict:
    """PUT /api/v1/categories/{id} — Sadece is_active günceller."""
    return self._put(f'/categories/{cat_id}', {'is_active': is_active})

def update_product_calorie(self, prod_id: int, calories: int) -> dict:
    """PUT /api/v1/products/{id} — Sadece calories günceller."""
    return self._put(f'/products/{prod_id}', {'calories': calories})

def get_products_with_prices(self, per_page: int = 500) -> list:
    """GET /api/v1/products?with_prices=1 — Şube fiyatlarıyla ürün listesi."""
    result = self._get('/products', params={'per_page': per_page, 'with_prices': '1'})
    if isinstance(result, dict):
        return result.get('products', result.get('data', []))
    return []

def toggle_product_branch(self, prod_id: int, branch_id: int,
                           is_active: bool, price: float = None) -> dict:
    """PUT /api/v1/products/{id}/branches/{bid} — Tek şube UPSERT."""
    data = {'is_active': is_active}
    if price is not None:
        data['price'] = price
    return self._put(f'/products/{prod_id}/branches/{branch_id}', data)

def toggle_category_branch(self, cat_id: int, branch_id: int, is_active: bool) -> dict:
    """PUT /api/v1/categories/{id}/branches/{bid} — Tek şube UPSERT."""
    return self._put(f'/categories/{cat_id}/branches/{branch_id}', {'is_active': is_active})
```

### 4.3 calorie_importer.py Tasarımı

```python
# calorie_importer.py — Excel kalori import motoru

import openpyxl

def load_excel(path: str, name_col_idx: int, calorie_col_idx: int) -> list:
    """Excel'den ürün adı + kalori satırlarını yükler.
    col_idx: 0-bazlı sütun indexi
    Döner: [{"name": str, "calories": int}, ...]
    """

def match_products(excel_rows: list, api_products: list) -> list:
    """Excel satırlarını API ürünleriyle eşleştirir.
    Eşleştirme: excel name.lower() == api product['name'].lower()
    Fallback:    excel name.lower() == api product['name_key'].lower()
    Döner: [{"excel_name": str, "calories": int,
              "matched": bool, "product_id": int|None,
              "api_name": str|None}, ...]
    """

def apply_calories(api_client, matched_rows: list,
                   log_callback=None, progress_callback=None) -> dict:
    """Eşleşen ürünlere kalori değerini PUT ile gönderir.
    Döner: {"updated": int, "skipped": int, "errors": int}
    """
```

### 4.4 branch_manager.py Tasarımı

```python
# branch_manager.py — Şube-ürün matris yönetimi

class BranchManager:
    def __init__(self, api_client):
        self.client = api_client
        self._branches = None       # önbellek
        self._products = None       # önbellek (with_prices=1)
        self._categories = None     # önbellek

    def get_branches(self, force_refresh=False) -> list:
        """Şube listesini önbellekten veya API'den döner."""

    def get_branch_product_matrix(self, branch_id: int) -> list:
        """Belirli şube için ürün listesi + is_active durumu.
        product_branches tablosundaki is_active değeri kullanılır.
        """

    def get_branch_category_matrix(self, branch_id: int) -> list:
        """Belirli şube için kategori listesi + is_active durumu."""

    def invalidate_cache(self):
        """Önbelleği temizler (değişiklik sonrası yenileme için)."""
```

---

## 5. MAIN.PY — YENİ SEKMELER

### 5.1 Sekme 5: Ürün Aktif/Pasif Yönetimi

```
Bileşenler:
- Üst bar: [API'den Yükle] [Aktif Yap] [Pasif Yap] [Seçili sayısı]
- Filtre: Kategori combobox (Tümü / seçili kategori)
- Treeview: ID | Ürün Adı | Kategori | Durum (Aktif/Pasif)
  - Çift tıklama: toggle
  - Ctrl+A: tümünü seç
- Alt bar: İşlem özeti
```

### 5.2 Sekme 6: Kategori Yönetimi

```
Bileşenler:
- Üst bar: [API'den Yükle] [Aktif Yap] [Pasif Yap]
- Treeview: ID | Kategori Adı | Sıra | Durum
- Seçili kategorinin ürün sayısı bilgisi
```

### 5.3 Sekme 7: Kalori Import

```
Bileşenler:
- Excel seçimi: path entry + gözat butonu
- Sütun eşleştirme: Ürün Adı Kolonu combobox + Kalori Kolonu combobox
- [Önizle] butonu → Treeview güncellenir
- Treeview: Excel Ürün Adı | Excel Kalori | API Eşleşme | API Mevcut Kalori
  - Renk: yeşil=eşleşti, kırmızı=bulunamadı
- Alt bar: [Eşleşenlere Kalori Uygula] + İstatistik
```

### 5.4 Sekme 8: Şube Yönetimi

```
Bileşenler:
- Şube seçimi: Combobox (API'den yüklenen şubeler)
- Görünüm radio: (●) Ürünler ( ) Kategoriler
- [Yükle] butonu
- Treeview: Ürün/Kategori Adı | Fiyat | Şubedeki Durum
- [Aktif Yap] [Pasif Yap] [Fiyat Düzenle] butonları
- Satır çift tıklama: toggle
```

---

## 6. EXCEL IMPORT FORMAT STANDARDI

### 6.1 Beklenen Excel Yapısı

Minimum 2 sütun gerekli. Sütun adları esnek — kullanıcı arayüzde eşleştirir:

| Ürün Adı | Kalori |
|---|---|
| Adana Kebap | 650 |
| Şiş Köfte | 480 |
| Ayran | 60 |

**Kurallar:**
- 1. satır başlık satırı (atlanır)
- Eşleştirme case-insensitive (`str.lower()` karşılaştırması)
- Kalori 0-10000 arası integer (API validasyonu ile uyumlu)
- Boş veya geçersiz kalori satırları atlanır, loglanır
- Eşleşmeyen ürünler işlem durdurulmadan loglanır
- `openpyxl` kullanılır (mevcut `requirements.txt`'e eklenmeli değilse)

---

## 7. UYGULAMA MİMARİSİ (YENİ DURUM)

```
main.py (8 Sekme)
├── Tab 1: Ayarlar          → settings_manager.py
├── Tab 2: Veri Kaynağı     → db_connector.py + excel_reader.py
├── Tab 3: Resim Klasörü    → sync_engine.IMAGE_EXTENSIONS
├── Tab 4: Senkronizasyon   → sync_engine.sync()
├── Tab 5: Ürün Aktif/Pasif → api_client.toggle_product_active()
├── Tab 6: Kategori Yönet.  → api_client.toggle_category_active()
├── Tab 7: Kalori Import    → calorie_importer.py + api_client.update_product_calorie()
└── Tab 8: Şube Yönetimi    → branch_manager.py + api_client.toggle_product_branch()

api_client.py
├── Mevcut: get_categories, create_category, update_category
├── Mevcut: get_products, create_product, update_product
├── Mevcut: upload_product_image, upload_category_image
├── YENİ:   get_branches
├── YENİ:   toggle_product_active, toggle_category_active
├── YENİ:   update_product_calorie
├── YENİ:   get_products_with_prices
├── YENİ:   toggle_product_branch
└── YENİ:   toggle_category_branch

API (lokdo.com.tr/api/v1/)
├── Mevcut: GET/POST/PUT/DELETE /categories
├── Mevcut: GET/POST/PUT/DELETE /products
├── Mevcut: POST /products/{id}/image
├── YENİ:   GET /branches                         → branches.php
├── YENİ:   PUT /products/{id}/branches/{bid}     → branch_products.php
└── YENİ:   PUT /categories/{id}/branches/{bid}   → branch_categories.php
```

---

## 8. ADIM ADIM İMPLEMENTASYON SIRASI

### FAZA A — API Genişletme [PHP] — Şube yönetimi için zorunlu

| Adım | Dosya | İşlem |
|---|---|---|
| A1 | `api/v1/branches.php` | YENİ — GET /branches endpoint yaz (auth gerekli) |
| A2 | `api/v1/branch_products.php` | YENİ — PUT /products/{id}/branches/{bid} UPSERT yaz |
| A3 | `api/v1/branch_categories.php` | YENİ — PUT /categories/{id}/branches/{bid} UPSERT yaz |
| A4 | `api/v1/index.php` | 3 yeni regex rota bloğu ekle (branches, product-branch, category-branch) |

### FAZA B — api_client.py Genişletme [Python]

| Adım | Metot | Endpoint |
|---|---|---|
| B1 | `get_branches()` | GET /branches |
| B2 | `toggle_product_active(prod_id, is_active)` | PUT /products/{id} |
| B3 | `toggle_category_active(cat_id, is_active)` | PUT /categories/{id} |
| B4 | `update_product_calorie(prod_id, calories)` | PUT /products/{id} |
| B5 | `get_products_with_prices()` | GET /products?with_prices=1 |
| B6 | `toggle_product_branch(prod_id, bid, is_active, price)` | PUT /products/{id}/branches/{bid} |
| B7 | `toggle_category_branch(cat_id, bid, is_active)` | PUT /categories/{id}/branches/{bid} |

### FAZA C — Yeni Python Modülleri

| Adım | Dosya | Bağımlılık |
|---|---|---|
| C1 | `calorie_importer.py` | B4 tamamlanmış olmalı |
| C2 | `branch_manager.py` | B1, B5, B6, B7 tamamlanmış olmalı |

### FAZA D — main.py Sekme Güncellemesi

| Adım | Sekme | Bağımlılık |
|---|---|---|
| D1 | Tab 5: Ürün Aktif/Pasif | B2 tamamlanmış |
| D2 | Tab 6: Kategori Yönetimi | B3 tamamlanmış |
| D3 | Tab 7: Kalori Import | C1 tamamlanmış |
| D4 | Tab 8: Şube Yönetimi | A1-A4 + C2 tamamlanmış |

---

## 9. RİSK VE ÖNEMLI NOTLAR

### 9.1 Şube Yönetimi — Kritik Uyarı

Mevcut `PUT /api/v1/products/{id}` endpoint'i body'de `prices` array gönderildiğinde
`product_branches` tablosunu tamamen siler ve yeniden yazar (`products.php` satır 529).
Bu nedenle **tek şube toggle için mevcut endpoint kullanılmamalıdır.**
`branch_products.php` UPSERT endpoint'i zorunludur.

### 9.2 Kalori Eşleştirme Stratejisi

API response'daki `name` alanı çeviri tablosuna göre dinamik üretilir.
Eşleştirme sırası: önce `name` (görünen ad), bulamazsa `name_key` (DB anahtarı).
Türkçe karakter normalizasyonu gerekebilir.

### 9.3 Rate Limiting

Mevcut `RateLimiter` (150 req/dk) tüm yeni API çağrıları için de geçerlidir.
Toplu kalori import'ta 500+ ürün için rate limiter otomatik yönetir — ek implementasyon gereksiz.

### 9.4 openpyxl Bağımlılığı

`excel_reader.py` zaten `openpyxl` kullanıyor. `calorie_importer.py` için ek kurulum gerekmeyebilir.
`requirements.txt` kontrol edilmeli.

---

## 10. ÖZET — NE VAR, NE EKSİK

| İstenen Özellik | API | PHP Değişikliği | Python Değişikliği |
|---|---|---|---|
| Ürün aktif/pasif | MEVCUT | Gerek yok | Tab 5 + 1 api_client metodu |
| Kategori aktif/pasif | MEVCUT | Gerek yok | Tab 6 + 1 api_client metodu |
| Excel kalori import | MEVCUT | Gerek yok | Tab 7 + calorie_importer.py |
| Şube ürün yönetimi | KISMİ | 3 yeni PHP dosyası + index.php | Tab 8 + branch_manager.py + 3 metot |

**Toplam:**
- PHP: 3 yeni dosya (`branches.php`, `branch_products.php`, `branch_categories.php`) + 1 güncelleme (`index.php`)
- Python: 2 yeni modül (`calorie_importer.py`, `branch_manager.py`) + 2 güncelleme (`api_client.py`, `main.py`)

---

*Bu plan sadece analiz ve tasarım aşamasıdır. Kod değişikliği yapılmamıştır.*  
*Implementasyon için Code moduna geçilebilir.*