document.addEventListener('DOMContentLoaded', function() {
    // Sortable
    const tbody = document.getElementById('sortableFeatures');
    if (tbody) {
        new Sortable(tbody, {
            handle: '.handle',
            animation: 150,
            onEnd: function() {
                const order = Array.from(tbody.querySelectorAll('tr')).map(tr => tr.dataset.id);
                fetch('features_actions.php?action=reorder', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(order)
                });
            }
        });
    }
    
    // Edit — data-* attribute'larından TR ve EN alanlarını doldur
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('edit_id').value           = this.dataset.id;
            document.getElementById('edit_title').value        = this.dataset.title        || '';
            document.getElementById('edit_description').value  = this.dataset.description  || '';
            document.getElementById('edit_icon').value         = this.dataset.icon         || '';
            document.getElementById('edit_title_en').value     = this.dataset.titleEn      || '';
            document.getElementById('edit_description_en').value = this.dataset.descriptionEn || '';
            new bootstrap.Modal(document.getElementById('editModal')).show();
        });
    });
    
    // Toggle
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Durumu değiştirmek istediğinizden emin misiniz?')) {
                window.location.href = 'features_actions.php?action=toggle&id=' + this.dataset.id;
            }
        });
    });
    
    // Delete
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Bu özelliği silmek istediğinizden emin misiniz?')) {
                window.location.href = 'features_actions.php?action=delete&id=' + this.dataset.id;
            }
        });
    });
});