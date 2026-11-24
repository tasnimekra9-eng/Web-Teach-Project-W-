// Render Shopping Cart & Checkout Form on cart.html
function renderCart() {
  const container = document.getElementById("cartContainer");
  if (!container) return;

  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const cart = JSON.parse(localStorage.getItem("pq_cart")) || [];

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="form-box" style="max-width: 100%;">
        <p>Your cart is currently empty. <a href="index.html">Browse Medicines</a></p>
      </div>
    `;
    return;
  }

  let subtotal = 0;
  let requiresDoctor = false;

  const rowsHtml = cart.map((item, index) => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    if (item.rxRequired) requiresDoctor = true;

    return `
      <tr>
        <td style="padding: 12px 10px;">
          ${item.name}
          ${item.rxRequired ? `<span class="rx-badge">Rx Required</span>` : ""}
        </td>
        <td style="padding: 12px 10px; white-space: nowrap;">৳ ${item.price}</td>
        <td style="padding: 12px 10px; white-space: nowrap;">
          <button class="btn btn-secondary" style="padding:4px 10px;" onclick="updateCartQty(${index}, -1)">-</button>
          <span style="margin:0 10px; font-weight:bold;">${item.qty}</span>
          <button class="btn btn-secondary" style="padding:4px 10px;" onclick="updateCartQty(${index}, 1)">+</button>
        </td>
        <td style="padding: 12px 10px; white-space: nowrap;">৳ ${itemTotal}</td>
        <td style="padding: 12px 10px;">
          <button class="btn btn-danger" style="padding:5px 12px;" onclick="removeCartItem(${index})">Remove</button>
        </td>
      </tr>
    `;
  }).join("");

  const deliveryFee = 60;
  const grandTotal = subtotal + deliveryFee;

  const doctorNameHtml = requiresDoctor ? `
    <div class="form-group" style="background:#fff3cd; padding:12px; border-radius:6px; border:1px solid #ffeeba;">
      <label for="doctorName"><strong>Doctor Name Required*</strong></label>
      <input type="text" id="doctorName" required placeholder="Enter prescribing doctor's full name (e.g., Dr. Mahmudul Hasan)">
      <small style="color:#856404; display:block; margin-top:4px;">Your cart contains prescription medicine(s). Please provide the prescribing doctor's name.</small>
    </div>
  ` : "";

  container.innerHTML = `
    <div class="form-box" style="max-width: 100%; width: 100%; margin-bottom: 25px;">
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <thead>
          <tr style="border-bottom:2px solid #eee;">
            <th style="padding:12px 10px;">Medicine / Item</th>
            <th style="padding:12px 10px;">Unit Price</th>
            <th style="padding:12px 10px;">Quantity</th>
            <th style="padding:12px 10px;">Total</th>
            <th style="padding:12px 10px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="text-align:right; margin-top:20px; font-size:16px;">
        <p><strong>Subtotal:</strong> ৳ ${subtotal}</p>
        <p><strong>Home Delivery Charge:</strong> ৳ ${deliveryFee}</p>
        <p style="font-size:20px; margin-top:6px;"><strong>Grand Total:</strong> ৳ ${grandTotal}</p>
      </div>
    </div>

    <div class="form-box" style="max-width: 100%; width: 100%;">
      <h3>Delivery & Checkout Details</h3>
      <form onsubmit="return placeOrder(event, ${grandTotal}, ${requiresDoctor})">
        <div class="form-group">
          <label for="deliveryPhone">Contact Phone Number*</label>
          <input type="text" id="deliveryPhone" required placeholder="e.g., 017XXXXXXXX">
        </div>
        <div class="form-group">
          <label for="deliveryAddress">Full Delivery Address*</label>
          <input type="text" id="deliveryAddress" required placeholder="House, Road, Area, City">
        </div>
        ${doctorNameHtml}
        <button type="submit" class="btn btn-success" style="width:100%; margin-top:10px;">
          Confirm Order (Cash on Delivery – ৳ ${grandTotal})
        </button>
      </form>
    </div>
  `;
}

// Increase or decrease item quantity
function updateCartQty(index, change) {
  let cart = JSON.parse(localStorage.getItem("pq_cart")) || [];
  const products = JSON.parse(localStorage.getItem("pq_products")) || [];
  const item = cart[index];
  if (!item) return;

  const product = products.find(p => p.id === item.id);
  const newQty = item.qty + change;

  if (newQty <= 0) {
    cart.splice(index, 1);
  } else if (product && newQty > product.stock) {
    alert("Maximum available stock reached.");
    return;
  } else {
    item.qty = newQty;
  }

  localStorage.setItem("pq_cart", JSON.stringify(cart));
  updateNavbar();
  renderCart();
}

// Remove item completely from cart
function removeCartItem(index) {
  let cart = JSON.parse(localStorage.getItem("pq_cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("pq_cart", JSON.stringify(cart));
  updateNavbar();
  renderCart();
}

// Place Order, Deduct Stock & Save to Order History
function placeOrder(event, grandTotal, requiresDoctor) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return false;
  }

  const phone = document.getElementById("deliveryPhone").value.trim();
  const address = document.getElementById("deliveryAddress").value.trim();
  let doctorName = "";

  if (requiresDoctor) {
    const docInput = document.getElementById("doctorName");
    if (!docInput || docInput.value.trim() === "") {
      alert("Please enter the prescribing doctor's name to proceed.");
      return false;
    }
    doctorName = docInput.value.trim();
  }

  const cart = JSON.parse(localStorage.getItem("pq_cart")) || [];
  if (cart.length === 0) return false;

  // Deduct ordered quantities from product inventory
  let products = JSON.parse(localStorage.getItem("pq_products")) || [];
  cart.forEach(cartItem => {
    const prod = products.find(p => p.id === cartItem.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - cartItem.qty);
    }
  });
  localStorage.setItem("pq_products", JSON.stringify(products));

  // Save order record
  const orders = JSON.parse(localStorage.getItem("pq_orders")) || [];
  const newOrder = {
    orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
    userEmail: user.email,
    userName: user.name,
    phone: phone,
    address: address,
    doctorName: doctorName,
    items: cart,
    total: grandTotal,
    status: "Pending",
    date: new Date().toLocaleDateString()
  };

  orders.push(newOrder);
  localStorage.setItem("pq_orders", JSON.stringify(orders));

  // Clear cart and redirect to dashboard
  localStorage.removeItem("pq_cart");
  alert(`Order ${newOrder.orderId} placed successfully!`);
  window.location.href = "dashboard.html";
  return true;
}

document.addEventListener("DOMContentLoaded", renderCart);