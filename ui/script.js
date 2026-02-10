document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/invoice')
        .then(resp => resp.json())
        .then(data => {
            let html = '<table><thead><tr><th>Item</th><th>Price</th></tr></thead><tbody>';
            let total = 0;
            data.items.forEach(item => {
                html += `<tr><td>${item.name}</td><td class="price">$${item.price.toFixed(2)}</td></tr>`;
                total += item.price;
            });
            html += `
                <tr class="total-row">
                    <td>Total</td>
                    <td class="price">$${total.toFixed(2)}</td>
                </tr>
            </tbody></table>
            <div style="text-align: center; margin-top: 20px;">
                <button id="add-item-btn">Add New Item</button>
            </div>
            `;
            document.getElementById('invoice-container').innerHTML = html;

            // Modal Logic
            const modal = document.getElementById("add-item-modal");
            const btn = document.getElementById("add-item-btn");
            const span = document.getElementsByClassName("close")[0];
            const saveBtn = document.getElementById("save-item-btn");

            btn.onclick = function() {
                modal.style.display = "block";
            }

            span.onclick = function() {
                modal.style.display = "none";
            }

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }

            saveBtn.onclick = function() {
                const name = document.getElementById("new-item-name").value;
                const price = document.getElementById("new-item-price").value;

                if(name && price) {
                    fetch('/api/invoice/items', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name: name, price: parseFloat(price) }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Success:', data);
                        modal.style.display = "none";
                        
                        // Dynamic DOM Update (No Reload)
                        const tableBody = document.querySelector("#invoice-container tbody");
                        const totalRow = document.querySelector(".total-row");
                        
                        // Create new row
                        const newRow = document.createElement("tr");
                        newRow.innerHTML = `<td>${data.name}</td><td class="price">$${parseFloat(data.price).toFixed(2)}</td>`;
                        
                        // Insert before total row
                        tableBody.insertBefore(newRow, totalRow);

                        // Update Total
                        const currentTotalText = totalRow.querySelector(".price").innerText.replace('$', '');
                        const currentTotal = parseFloat(currentTotalText);
                        const newTotal = currentTotal + parseFloat(data.price);
                        totalRow.querySelector(".price").innerText = `$${newTotal.toFixed(2)}`;

                        // Clear inputs
                        document.getElementById("new-item-name").value = "";
                        document.getElementById("new-item-price").value = "";
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                } else {
                    alert("Please enter both name and price");
                }
            }

        })
        .catch(error => console.error("Failed to load invoice:", error));

    document.getElementById('download-btn').addEventListener('click', () => {
        window.print();
    });
});
