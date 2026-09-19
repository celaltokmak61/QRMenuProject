let featureModal;
document.addEventListener('DOMContentLoaded', function() {
    featureModal = new bootstrap.Modal(document.getElementById('featureModal'));
    document.getElementById('featureForm').addEventListener('submit', handleFormSubmit);
    initSortable('single');
    initSortable('double');
    initSortable('triple_plus');
});

function initSortable(packageType) {
    const container = document.getElementById(`${packageType}-features`);
    if (!container) return;
    new Sortable(container, {
        handle: '.feature-drag-handle',
        animation: 150,
        onEnd: () => updateOrder(packageType)
    });
}

function updateOrder(packageType) {
    const items = document.querySelectorAll(`#${packageType}-features .feature-item`);
    const orders = Array.from(items).map(item => item.getAttribute('data-id'));
    fetch('features_actions.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({action: 'update_order', orders: JSON.stringify(orders)})
    });
}

function openAddModal(packageType) {
    document.getElementById('modalTitle').textContent = 'Yeni Özellik Ekle';
    document.getElementById('featureForm').reset();
    document.getElementById('featureId').value = '';
    document.getElementById('packageType').value = packageType;
    featureModal.show();
}

function editFeature(id) {
    fetch(`features_actions.php?action=get&id=${id}`)
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                document.getElementById('modalTitle').textContent = 'Özellik Düzenle';
                document.getElementById('featureId').value = data.feature.id;
                document.getElementById('packageType').value = data.feature.package_type;
                document.getElementById('featureText').value = data.feature.feature_text;
                featureModal.show();
            }
        });
}

function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    formData.append('action', id ? 'update' : 'add');
    fetch('features_actions.php', {method: 'POST', body: formData})
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                featureModal.hide();
                location.reload();
            } else {
                alert(data.message);
            }
        });
}

function deleteFeature(id) {
    if (!confirm('Silmek istediğinizden emin misiniz?')) return;
    fetch('features_actions.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({action: 'delete', id: id})
    }).then(r => r.json()).then(data => {
        if (data.success) {
            alert(data.message);
            location.reload();
        }
    });
}
