document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('edit_id').value = this.dataset.id;
            document.getElementById('edit_section').value = this.dataset.section;
            document.getElementById('edit_title').value = this.dataset.title;
            document.getElementById('edit_url').value = this.dataset.url;
            new bootstrap.Modal(document.getElementById('editModal')).show();
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const msg = (window.langStrings && window.langStrings.footer_confirm_delete)
                ? window.langStrings.footer_confirm_delete
                : 'Bu linki silmek istediğinizden emin misiniz?';
            if (confirm(msg)) {
                window.location.href = 'footer_actions.php?action=delete&id=' + this.dataset.id;
            }
        });
    });
});