// Update "Your Cart" visibility and item count on index.html
function updateStoreNavbar() {
  const currentUser = getCurrentUser();
  const yourCartLink = document.getElementById("yourCartLink");
  const cartCount = document.getElementById("cartCount");

  if (yourCartLink) {
    if (currentUser) {
      yourCartLink.style.display = "inline-block";
      const cart = JSON.parse(localStorage.getItem("pq_cart")) || [];
      const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
      if (cartCount) cartCount.textContent = totalItems;
    } else {
      yourCartLink.style.display = "none";
    }
  }
}

// Render Medicine Catalog on index.html (Publicly viewable & searchable)
function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const products = JSON.parse(localStorage.getItem("pq_products")) || [];
  const searchQuery = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const selectedCategory = document.getElementById("categoryFilter")?.value || "All";

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery) ||
                          p.manufacturer.toLowerCase().includes(searchQuery);
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<p>No medicines or healthcare items match your search.</p>`;
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const fallbackImg = getProductImage(product.image, product.name);
    const rxTag = product.rxRequired ? `<span class="rx-badge">Rx Required</span>` : "";
    const stockStatus = product.stock > 0
      ? `<small style="color:#198754;">In Stock (${product.stock})</small>`
      : `<small style="color:#dc3545;">Out of Stock</small>`;

    return `
      <div class="card">
        <div>
          <img src="${product.image}" onerror="this.onerror=null;this.src='${fallbackImg}';" alt="${product.name}">
          <span class="category-tag">${product.category}</span>${rxTag}
          <h3>${product.name}</h3>
          <p><small>By ${product.manufacturer}</small></p>
          ${stockStatus}
        </div>
        <div>
          <div class="price">৳ ${product.price}</div>
          <div class="btn-group">
            <a href="product.html?id=${product.id}" class="btn btn-secondary">Details</a>
            <button class="btn btn-primary" onclick="addToCart(${product.id})" ${product.stock <= 0 ? "disabled" : ""}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// Add Product to Cart (Requires Login or Registration first)
function addToCart(productId, qty = 1) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    localStorage.setItem("pq_pending_cart", JSON.stringify({ productId, qty }));
    alert("Please login or register first to add medicines to your cart.");
    window.location.href = "login.html";
    return;
  }

  const products = JSON.parse(localStorage.getItem("pq_products")) || [];
  const product = products.find(p => p.id === productId);
  if (!product || product.stock < qty) {
    alert("Sorry, requested stock is unavailable.");
    return;
  }

  let cart = JSON.parse(localStorage.getItem("pq_cart")) || [];
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    if (existing.qty + qty > product.stock) {
      alert("Maximum available stock reached.");
      return;
    }
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      rxRequired: product.rxRequired,
      qty: qty
    });
  }

  localStorage.setItem("pq_cart", JSON.stringify(cart));
  updateStoreNavbar();
  if (typeof updateNavbar === "function") updateNavbar();
  alert(`"${product.name}" added! Click "Your Cart" at the top to view your cart.`);
}

// Load Single Product Details on product.html
function loadProductDetail() {
  const detailContainer = document.getElementById("productDetailContainer");
  if (!detailContainer) return;

  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id"));
  const products = JSON.parse(localStorage.getItem("pq_products")) || [];
  const product = products.find(p => p.id === productId);

  if (!product) {
    detailContainer.innerHTML = `<p>Product not found. <a href="index.html">Return to Store</a></p>`;
    return;
  }

  const fallbackImg = getProductImage(product.image, product.name);
  const rxNotice = product.rxRequired
    ? `<p style="color:#856404; background:#fff3cd; padding:8px; border-radius:5px; margin:10px 0;">
         <strong>Prescription Notice:</strong> This medicine requires a valid doctor's prescription during checkout.
       </p>`
    : "";

  detailContainer.innerHTML = `
    <div class="detail-box">
      <img src="${product.image}" onerror="this.onerror=null;this.src='${fallbackImg}';" alt="${product.name}">
      <div class="detail-info">
        <span class="category-tag">${product.category}</span>
        <h2>${product.name}</h2>
        <p><strong>Manufacturer:</strong> ${product.manufacturer}</p>
        <p style="margin-top:10px;">${product.description}</p>
        ${rxNotice}
        <div class="price" style="font-size:24px;">৳ ${product.price}</div>
        <p><strong>Available Stock:</strong> ${product.stock} units</p>
        <div style="margin-top:15px; display:flex; gap:10px; align-items:center;">
          <input type="number" id="detailQty" value="1" min="1" max="${product.stock}" style="width:80px; padding:9px;">
          <button class="btn btn-success" onclick="addFromDetail(${product.id})">Add to Cart</button>
          <a href="index.html" class="btn btn-secondary">Back to Store</a>
        </div>
      </div>
    </div>
  `;
}

function addFromDetail(productId) {
  const qty = parseInt(document.getElementById("detailQty").value) || 1;
  addToCart(productId, qty);
}

document.addEventListener("DOMContentLoaded", () => {
  updateStoreNavbar();
  renderProducts();
  loadProductDetail();
});