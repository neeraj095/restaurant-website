
    const MENU_DATA = {
      vegetarian: [
        { name: "Paneer Tikka Masala", price: 280 },
        { name: "Dal Makhani", price: 220 },
        { name: "Veg Biryani", price: 260 },
        { name: "Aloo Gobi", price: 180 },
        { name: "Palak Paneer", price: 250 },
        { name: "Veg Manchurian", price: 210 },
        { name: "Mushroom Masala", price: 240 }
      ],
      nonvegetarian: [
        { name: "Chicken Tikka Masala", price: 350 },
        { name: "Butter Chicken", price: 320 },
        { name: "Chicken Biryani", price: 300 },
        { name: "Mutton Rogan Josh", price: 420 },
        { name: "Fish Curry", price: 380 },
        { name: "Chicken 65", price: 290 },
        { name: "Prawn Masala", price: 450 }
      ]
    };

    // Store each selected dish's quantity by its unique menu key.
    const order = {};

    const money = amount => `₹${amount.toLocaleString("en-IN")}`;

    function renderMenu() {
      const container = document.getElementById("menuCategories");
      const sections = [
        { key: "vegetarian", title: "Vegetarian", className: "veg-title", symbol: "🟩" },
        { key: "nonvegetarian", title: "Non-vegetarian", className: "nonveg-title", symbol: "🟥" }
      ];

      container.innerHTML = sections.map(section => {
        const items = MENU_DATA[section.key].map((item, index) => {
          const key = `${section.key}-${index}`;
          return `
            <div class="menu-item">
              <div>
                <h3 class="item-name">${item.name}</h3>
                <div class="item-price">${money(item.price)}</div>
              </div>
              <div class="quantity" aria-label="Quantity for ${item.name}">
                <button class="qty-btn" type="button" data-key="${key}" data-change="-1" aria-label="Remove one ${item.name}">−</button>
                <span class="qty-value" id="qty-${key}">0</span>
                <button class="qty-btn" type="button" data-key="${key}" data-change="1" aria-label="Add one ${item.name}">+</button>
              </div>
            </div>`;
        }).join("");

        return `
          <section class="menu-category">
            <h3 class="category-title ${section.className}">
              <span class="food-dot" aria-hidden="true"></span>
              ${section.title} <span class="muted-light">(${MENU_DATA[section.key].length})</span>
            </h3>
            ${items}
          </section>`;
      }).join("");
    }

    function getSelectedItems() {
      return Object.entries(order)
        .filter(([, quantity]) => quantity > 0)
        .map(([key, quantity]) => {
          const [category, index] = key.split("-");
          const dish = MENU_DATA[category][Number(index)];
          return { ...dish, quantity, total: dish.price * quantity };
        });
    }

    function updateQuantity(key, change) {
      order[key] = Math.max(0, (order[key] || 0) + change);
      document.getElementById(`qty-${key}`).textContent = order[key];
      document.getElementById("statusMessage").textContent = "";
      document.querySelector(".print-btn").style.display = "none";
      updateBill();
    }

    function updateBill() {
      const items = getSelectedItems();
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const quantityTotal = items.reduce((sum, item) => sum + item.quantity, 0);
      const gst = Math.round(subtotal * 0.05);

      document.getElementById("billItemsList").innerHTML = items.length
        ? items.map(item => `
            <div class="bill-row">
              <span>${item.name} × ${item.quantity}</span>
              <span>${money(item.total)}</span>
            </div>`).join("")
        : '<p class="empty-state">Your order is empty. Add a dish to begin.</p>';

      document.getElementById("itemCount").textContent = items.length;
      document.getElementById("totalQuantity").textContent = quantityTotal;
      document.getElementById("subtotalAmount").textContent = money(subtotal);
      document.getElementById("gstAmount").textContent = money(gst);
      document.getElementById("grandTotal").textContent = money(subtotal + gst);
    }

    function generateBill() {
      if (getSelectedItems().length === 0) {
        document.getElementById("statusMessage").textContent = "Please add at least one dish first.";
        return;
      }

      document.getElementById("statusMessage").textContent = "Bill is ready to print.";
      document.getElementById("printBill").style.display = "block";
    }

    function printReceipt() {
      const customerName = document.getElementById("customerName").value.trim() || "Walk-in customer";
      const tableNo = document.getElementById("tableNo").value.trim() || "N/A";
      const items = getSelectedItems();
      if (!items.length) {
        document.getElementById("statusMessage").textContent = "Please add at least one dish first.";
        return;
      }

      const receiptRows = items.map(item =>
        `<tr><td>${item.name} × ${item.quantity}</td><td>${money(item.total)}</td></tr>`
      ).join("");
      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const gst = Math.round(subtotal * 0.05);

      const receipt = `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>The Grand Table - Receipt</title>
          <style>
            body{max-width:420px;margin:24px auto;padding:16px;font:14px Arial,sans-serif;color:#222}
            h1{text-align:center;font-family:Georgia,serif;margin-bottom:4px}
            .center{text-align:center;color:#555}
            table{width:100%;border-collapse:collapse;margin:22px 0}
            td{padding:9px 0;border-bottom:1px solid #ddd}
            td:last-child{text-align:right;white-space:nowrap}
            .total{font-weight:bold;font-size:17px;border-top:2px solid #333;padding-top:12px}
          </style>
        </head>
        <body>
          <h1>The Grand Table</h1>
          <p class="center">Good food, shared well</p>
          <hr>
          <p>Customer: ${escapeHTML(customerName)}</p>
          <p>Table / Order: ${escapeHTML(tableNo)}</p>
          <p>Date: ${new Date().toLocaleString("en-IN")}</p>
          <table>${receiptRows}</table>
          <p>Subtotal: <strong>${money(subtotal)}</strong></p>
          <p>GST (5%): <strong>${money(gst)}</strong></p>
          <p class="total">Grand total: ${money(subtotal + gst)}</p>
          <p class="center">Thank you for dining with us.</p>
          <script>window.onload = () => window.print();<\/script>
        </body>
        </html>`;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        document.getElementById("statusMessage").textContent = "Allow pop-ups to print the receipt.";
        return;
      }
      printWindow.document.open();
      printWindow.document.write(receipt);
      printWindow.document.close();
    }

    function escapeHTML(value) {
      return value.replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[character]);
    }

    document.getElementById("menuCategories").addEventListener("click", event => {
      const button = event.target.closest("button[data-key]");
      if (button) updateQuantity(button.dataset.key, Number(button.dataset.change));
    });

    document.getElementById("generateBill").addEventListener("click", generateBill);
    document.getElementById("printBill").addEventListener("click", printReceipt);

    renderMenu();
    updateBill();
