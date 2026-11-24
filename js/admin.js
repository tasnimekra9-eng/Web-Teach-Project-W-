// Guard Admin Page Access
function checkAdminAuth() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin") {
    alert("Access Denied. Admins only.");
    window.location.href = "login.html";
  }
}

// Render Manage Medicine Stock Table (on manage-stock.html)
function renderAdminInventory() {
  const container = document.getElementById("adminInventoryTable");
  if (!container) return;

  const products = JSON.parse(localStorage.getItem("pq_products")) || [];

  if (products.length === 0) {
    container.innerHTML = `<div class="form-box" style="max-width:100%;"><p>No medicines in inventory.</p></div>`;
    return;
  }

  const rowsHtml = products.map(p => `
    <tr>
      <td style="padding:10px;">${p.id}</td>
      <td style="padding:10px;">${p.name} ${p.rxRequired ? '<span class="rx-badge">Rx</span>' : ''}</td>
      <td style="padding:10px;">${p.manufacturer || "-"}</td>
      <td style="padding:10px;">${p.category}</td>
      <td style="padding:10px;">৳ ${p.price}</td>
      <td style="padding:10px;">${p.stock}</td>
      <td style="padding:10px;">
        <button class="btn btn-danger" style="padding:5px 10px;" onclick="deleteProduct(${p.id})">Delete</button>
      </td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="form-box" style="max-width:100%; overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom:2px solid #eee;">
            <th style="padding:10px;">ID</th>
            <th style="padding:10px;">Medicine Name</th>
            <th style="padding:10px;">Manufacturer</th>
            <th style="padding:10px;">Category</th>
            <th style="padding:10px;">Price</th>
            <th style="padding:10px;">Stock</th>
            <th style="padding:10px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

// Render Customer Orders & Prescription Verification Table (on customer-orders.html)
function renderAdminOrders() {
  const container = document.getElementById("adminOrdersTable");
  if (!container) return;

  const orders = JSON.parse(localStorage.getItem("pq_orders")) || [];

  let rowsHtml = "";
  if (orders.length === 0) {
    rowsHtml = `<tr><td colspan="6" style="padding:15px; text-align:center;">No customer orders yet.</td></tr>`;
  } else {
    rowsHtml = orders.map((o, idx) => {
      const rxInfo = o.doctorName
        ? `<strong>Dr.</strong> ${o.doctorName}`
        : (o.prescriptionRef || o.prescriptionFile || "OTC (No Rx Needed)");

      return `
        <tr>
          <td style="padding:10px;"><strong>${o.orderId}</strong><br><small>${o.date}</small></td>
          <td style="padding:10px;">${o.userName}<br><small>${o.phone}</small><br><small>${o.address || ""}</small></td>
          <td style="padding:10px;">${o.items.map(i => `${i.name} (×${i.qty})`).join("<br>")}</td>
          <td style="padding:10px;">${rxInfo}</td>
          <td style="padding:10px;">৳ ${o.total}</td>
          <td style="padding:10px;">
            <select onchange="updateOrderStatus(${idx}, this.value)" style="padding:6px;">
              <option value="Pending" ${o.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="Approved & Dispatched" ${o.status === "Approved & Dispatched" ? "selected" : ""}>Approved & Dispatched</option>
              <option value="Delivered" ${o.status === "Delivered" ? "selected" : ""}>Delivered</option>
            </select>
          </td>
        </tr>
      `;
    }).join("");
  }

  container.innerHTML = `
    <div class="form-box" style="max-width:100%; overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom:2px solid #eee;">
            <th style="padding:10px;">Order ID</th>
            <th style="padding:10px;">Customer Details</th>
            <th style="padding:10px;">Ordered Items</th>
            <th style="padding:10px;">Doctor / Rx Verification</th>
            <th style="padding:10px;">Total</th>
            <th style="padding:10px;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

// Add New Medicine to Store (on admin.html)
function addNewProduct(event) {
  event.preventDefault();
  const name = document.getElementById("prodName").value.trim();
  const category = document.getElementById("prodCategory").value;
  const price = parseFloat(document.getElementById("prodPrice").value);
  const stock = parseInt(document.getElementById("prodStock").value);
  const manufacturerEl = document.getElementById("prodManufacturer") || document.getElementById("prodMfg");
  const manufacturer = manufacturerEl ? manufacturerEl.value.trim() : "";
  const rxEl = document.getElementById("prodRx");
  const rxRequired = rxEl ? (rxEl.value === "true" || rxEl.checked === true) : false;
  const description = document.getElementById("prodDesc").value.trim();

  if (!name || price <= 0 || stock < 0) {
    alert("Please enter valid product details.");
    return false;
  }

  const products = JSON.parse(localStorage.getItem("pq_products")) || [];
  const newProd = {
    id: Date.now(),
    name,
    category,
    price,
    stock,
    rxRequired,
    manufacturer: manufacturer || "pharmaceuticOnline Generic",
    image: "assets/images/default.png",
    description: description || "Quality healthcare product."
  };

  products.push(newProd);
  localStorage.setItem("pq_products", JSON.stringify(products));
  event.target.reset();
  renderAdminInventory();
  alert("Medicine added to inventory! View it in Manage Medicine Stock.");
  return true;
}

function deleteProduct(id) {
  if (!confirm("Remove this medicine from inventory?")) return;
  let products = JSON.parse(localStorage.getItem("pq_products")) || [];
  products = products.filter(p => p.id !== id);
  localStorage.setItem("pq_products", JSON.stringify(products));
  renderAdminInventory();
}

function updateOrderStatus(index, newStatus) {
  let orders = JSON.parse(localStorage.getItem("pq_orders")) || [];
  orders[index].status = newStatus;
  localStorage.setItem("pq_orders", JSON.stringify(orders));
  alert(`Order ${orders[index].orderId} updated to: ${newStatus}`);
}

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
  renderAdminInventory();
  renderAdminOrders();
});