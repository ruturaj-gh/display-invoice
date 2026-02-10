
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/invoice')
        .then(resp => resp.json())
        .then(data => {
            let html = '<ul>';
            data.items.forEach(item => {
                html += `<li>${item.name} - $${item.price}</li>`;
            });
            html += '</ul>';
            document.getElementById('invoice-container').innerHTML = html;
        })
        .catch(error => console.error("Failed to load invoice:", error));

    document.getElementById('download-btn').addEventListener('click', () => {
        window.print();
    });
});
