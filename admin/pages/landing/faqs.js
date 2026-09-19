document.addEventListener('DOMContentLoaded', function() {
    // Sortable
    const accordion = document.getElementById('faqAccordion');
    if (accordion) {
        new Sortable(accordion, {
            handle: '.handle',
            animation: 150,
            onEnd: function() {
                const order = Array.from(accordion.querySelectorAll('.accordion-item')).map(item => item.dataset.id);
                fetch('faqs_actions.php?action=reorder', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(order)
                });
            }
        });
    }
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('edit_id').value        = this.dataset.id;
            document.getElementById('edit_question').value  = this.dataset.question;
            document.getElementById('edit_answer').value    = this.dataset.answer;
            // İngilizce alanları doldur (TR|EN sekmeli modal)
            document.getElementById('edit_question_en').value = this.dataset.questionEn || '';
            document.getElementById('edit_answer_en').value   = this.dataset.answerEn   || '';
            // İlk açılışta Türkçe sekmesini aktif et
            const trTab = document.querySelector('#editModal .nav-link[data-bs-target="#edit-tab-tr"]');
            if (trTab) { bootstrap.Tab.getOrCreateInstance(trTab).show(); }
            new bootstrap.Modal(document.getElementById('editModal')).show();
        });
    });
    
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Durumu değiştirmek istediğinizden emin misiniz?')) {
                window.location.href = 'faqs_actions.php?action=toggle&id=' + this.dataset.id;
            }
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Bu soruyu silmek istediğinizden emin misiniz?')) {
                window.location.href = 'faqs_actions.php?action=delete&id=' + this.dataset.id;
            }
        });
    });
});