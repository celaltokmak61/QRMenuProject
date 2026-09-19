document.addEventListener('DOMContentLoaded', function() {

    // ── Edit butonu ────────────────────────────────────────────────────────────
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = document.getElementById('editModal');
            if (!modal) return;

            // Temel alanları doldur
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val !== undefined ? val : '';
            };

            setVal('edit_id',              this.dataset.id);
            setVal('edit_step',            this.dataset.step);
            setVal('edit_title',           this.dataset.title);
            setVal('edit_description',     this.dataset.description);
            setVal('edit_icon',            this.dataset.icon);
            setVal('edit_title_en',        this.dataset.titleEn        || '');
            setVal('edit_description_en',  this.dataset.descriptionEn  || '');

            // Türkçe sekmesini aktif et
            const trTab = modal.querySelector('.nav-link[data-bs-target="#edit-tab-tr"]');
            if (trTab) {
                bootstrap.Tab.getOrCreateInstance(trTab).show();
            }

            bootstrap.Modal.getOrCreateInstance(modal).show();
        });
    });

    // ── Toggle butonu ──────────────────────────────────────────────────────────
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Durumu değiştirmek istediğinizden emin misiniz?')) {
                window.location.href = 'steps_actions.php?action=toggle&id=' + this.dataset.id;
            }
        });
    });

    // ── Sil butonu ─────────────────────────────────────────────────────────────
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Bu adımı silmek istediğinizden emin misiniz?')) {
                window.location.href = 'steps_actions.php?action=delete&id=' + this.dataset.id;
            }
        });
    });
});