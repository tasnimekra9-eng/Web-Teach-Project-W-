// Get currently logged-in user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("pq_currentUser"));
}

// Helper: Add pending medicine to cart if user clicked "Add to Cart" before logging in
function processPendingCartItem() {
  const pending = JSON.parse(localStorage.getItem("pq_pending_cart"));
  if (!pending) return false;

  const products = JSON.parse(localStorage.getItem("pq_products")) || [];
  const product = products.find(p => p.id === pending.productId);
  if (product && product.stock >= pending.qty) {
    let cart = JSON.parse(localStorage.getItem("pq_cart")) || [];
    const existing = cart.find(item => item.id === pending.productId);
    if (existing) {
      existing.qty = Math.min(product.stock, existing.qty + pending.qty);
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        rxRequired: product.rxRequired,
        qty: pending.qty
      });
    }
    localStorage.setItem("pq_cart", JSON.stringify(cart));
  }
  localStorage.removeItem("pq_pending_cart");
  return true;
}

// Update Navbar Links and Cart Counter across all pages
function updateNavbar() {
  const user = getCurrentUser();
  const authNav = document.getElementById("authNav");
  const cartCountEl = document.getElementById("cartCount");

  if (cartCountEl) {
    const cart = JSON.parse(localStorage.getItem("pq_cart")) || [];
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.innerText = totalQty;
  }

  if (authNav) {
    if (user) {
      let roleLink = user.role === "admin"
        ? `<a href="admin.html">Admin Panel</a>`
        : `<a href="dashboard.html">My Dashboard</a>`;

      authNav.innerHTML = `
        ${roleLink}
        <a href="#" onclick="logoutUser()">Logout (${user.name.split(" ")[0]})</a>
      `;
    } else {
      authNav.innerHTML = `<a href="login.html">Login / Register</a>`;
    }
  }
}

// Handle Login Form Submission with DOM Validation
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const errorBox = document.getElementById("loginError");

  if (email === "" || password === "") {
    errorBox.innerText = "Email and password are required.";
    return false;
  }

  const users = JSON.parse(localStorage.getItem("pq_users")) || [];
  const matchedUser = users.find(u => u.email === email && u.password === password);

  if (!matchedUser) {
    errorBox.innerText = "Invalid email or password.";
    return false;
  }

  localStorage.setItem("pq_currentUser", JSON.stringify(matchedUser));
  const hasPendingItem = processPendingCartItem();

  if (matchedUser.role === "admin") {
    window.location.href = "admin.html";
  } else if (hasPendingItem) {
    window.location.href = "index.html";
  } else {
    window.location.href = "dashboard.html";
  }
  return true;
}

// Handle Registration Form Submission
function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const errorBox = document.getElementById("regError");

  if (name.length < 3) {
    errorBox.innerText = "Full name must be at least 3 characters.";
    return false;
  }
  if (!email.includes("@")) {
    errorBox.innerText = "Please enter a valid email address.";
    return false;
  }
  if (password.length < 3) {
    errorBox.innerText = "Password must be at least 3 characters.";
    return false;
  }

  const users = JSON.parse(localStorage.getItem("pq_users")) || [];
  if (users.some(u => u.email === email)) {
    errorBox.innerText = "This email is already registered.";
    return false;
  }

  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    role: "customer"
  };

  users.push(newUser);
  localStorage.setItem("pq_users", JSON.stringify(users));
  localStorage.setItem("pq_currentUser", JSON.stringify(newUser));
  const hasPendingItem = processPendingCartItem();

  alert("Registration successful!");
  window.location.href = hasPendingItem ? "index.html" : "dashboard.html";
  return true;
}

// Logout User
function logoutUser() {
  localStorage.removeItem("pq_currentUser");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", updateNavbar);