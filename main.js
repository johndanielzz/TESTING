// =========================
// MATRIX MARKETPLACE MAIN.JS
// =========================

// -------------------------
// Backend API base
// -------------------------
const API_BASE = "http://localhost:4000/api"; // change to live URL when online

// -------------------------
// Authentication helpers
// -------------------------
function getToken() {
    return localStorage.getItem("mm_token");
}

async function requireAuth(role) {
    const token = getToken();
    if (!token) {
        window.location.href = "login.html";
        return;
    }
    if (!role) return;

    const res = await fetch(`${API_BASE}/auth/me`, { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) {
        window.location.href = "login.html";
        return;
    }
    const data = await res.json();
    if (role && data.role !== role) {
        alert("Unauthorized access");
        window.location.href = "index.html";
    }
}

// -------------------------
// Generic API request
// -------------------------
async function apiRequest(endpoint, method = "GET", body) {
    const token = getToken();
    const res = await fetch(API_BASE + endpoint, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error((await res.json()).message || 'API Error');
    return res.json();
}

// -------------------------
// Alert helper
// -------------------------
function showAlert(msg) {
    alert(msg);
}

// -------------------------
// Helper: format currency
// -------------------------
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GM', { style: 'currency', currency: 'GMD' }).format(amount);
}

// -------------------------
// Page detection
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;

    switch(page) {
        case "index":
            loadShop();
            break;
        case "login":
            // login.html
            break;
        case "register":
            // register.html
            break;
        case "dashboard-admin":
            loadAdminDashboard();
            break;
        case "admin-users":
            loadAdminUsers();
            break;
        case "admin-sellers":
            loadAdminSellers();
            break;
        case "admin-edit-user-seller":
            loadAdminEditUsersSellers();
            break;
        case "admin-accept-payment":
        case "payment-accept-decline-users":
            loadAdminPayments();
            break;
        case "seller-dashboard":
            loadSellerDashboard();
            break;
        case "seller-product":
            loadSellerProducts();
            break;
        case "cart":
            loadCart();
            break;
        case "checkout":
            loadCheckout();
            break;
        case "confirm-payment":
            loadConfirmPayment();
            break;
        case "payment-status-sellers":
            loadSellerPayments();
            break;
        case "shop":
            loadShop();
            break;
        case "chat":
            initChat();
            break;
        case "buyers-orders":
            loadBuyerOrders();
            break;
        case "subscription":
            loadSubscriptions();
            break;
        case "setting":
            loadSettings();
            break;
        default:
            break;
    }
});

// -------------------------
// Page Functions
// -------------------------

// INDEX / SHOP PAGE
async function loadShop() {
    await requireAuth();
    const container = document.getElementById("product-list");
    if (!container) return;
    const products = await apiRequest("/products");
    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.title}">
            <h3>${p.title}</h3>
            <p>${formatCurrency(p.price)}</p>
            <button onclick="addToCart('${p._id}')">Add to Cart</button>
        </div>
    `).join('');
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    showAlert("Product added to cart!");
}

// ADMIN DASHBOARD
async function loadAdminDashboard() {
    await requireAuth("admin");
    const overview = await apiRequest("/admin/overview");
    document.getElementById("totalUsers").textContent = overview.usersCount;
    document.getElementById("totalSellers").textContent = overview.sellersCount;
    document.getElementById("totalProducts").textContent = overview.productsCount;

    renderRecentTable("recentSellers", overview.recentProducts.slice(-5).reverse(), "Seller");
    renderRecentTable("recentUsers", overview.recentUsers.slice(-5).reverse(), "User");
}

function renderRecentTable(tableId, list, type) {
    const table = document.getElementById(tableId);
    if (!table) return;
    table.innerHTML = `<tr><th>${type} Name</th><th>Email</th><th>Status</th><th>Country</th></tr>`;
    if (list.length === 0) {
        table.innerHTML += `<tr><td colspan="4">No ${type.toLowerCase()} records found.</td></tr>`;
        return;
    }
    list.forEach(item => {
        const statusClass = item.status === "Approved" ? "approved" : item.status === "Declined" ? "declined" : "pending";
        table.innerHTML += `<tr>
            <td>${item.name || "N/A"}</td>
            <td>${item.email || "N/A"}</td>
            <td class="${statusClass}">${item.status || "Pending"}</td>
            <td>${item.country || "Unknown"}</td>
        </tr>`;
    });
}

// ADMIN USERS
async function loadAdminUsers() {
    await requireAuth("admin");
    const users = await apiRequest("/admin/users");
    const table = document.getElementById("usersTable");
    if (!table) return;
    table.innerHTML = `<tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr>`;
    users.forEach(u => {
        table.innerHTML += `<tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>
                <button onclick="updateUserRole('${u._id}','admin')">Make Admin</button>
                <button onclick="updateUserRole('${u._id}','buyer')">Make Buyer</button>
                <button onclick="updateUserRole('${u._id}','seller')">Make Seller</button>
            </td>
        </tr>`;
    });
}

async function updateUserRole(id, role) {
    await apiRequest(`/admin/user/${id}/role`, "PUT", { role });
    showAlert("Role updated successfully!");
    location.reload();
}

// ADMIN SELLERS
async function loadAdminSellers() {
    await requireAuth("admin");
    const sellers = await apiRequest("/admin/products");
    const table = document.getElementById("sellerTable");
    if (!table) return;
    table.innerHTML = `<tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr>`;
    sellers.forEach(s => {
        const statusClass = s.status === "Approved" ? "approved" : s.status === "Declined" ? "declined" : "pending";
        table.innerHTML += `<tr>
            <td>${s.name}</td><td>${s.email}</td><td class="${statusClass}">${s.status}</td>
            <td>
                <button onclick="updateSellerStatus('${s._id}','Approved')">Approve</button>
                <button onclick="updateSellerStatus('${s._id}','Declined')">Decline</button>
            </td>
        </tr>`;
    });
}

async function updateSellerStatus(id, status) {
    await apiRequest(`/admin/seller/${id}/status`, "PUT", { status });
    showAlert("Seller status updated!");
    location.reload();
}

// ADMIN PAYMENTS
async function loadAdminPayments() {
    await requireAuth("admin");
    const payments = await apiRequest("/admin/payments");
    const table = document.getElementById("paymentBody");
    if (!table) return;
    table.innerHTML = "";
    payments.forEach(p => {
        const statusClass = p.status.toLowerCase();
        table.innerHTML += `<tr>
            <td>${p.name}</td>
            <td>${p.email}</td>
            <td>${p.amount}</td>
            <td>${p.method}</td>
            <td>${p.date}</td>
            <td><span class="status ${statusClass}">${p.status}</span></td>
            <td>
                ${p.status === "Pending"
                    ? `<button onclick="updatePayment('${p._id}','Approved')">Accept</button>
                       <button onclick="updatePayment('${p._id}','Declined')">Decline</button>`
                    : "-"
                }
            </td>
        </tr>`;
    });
}

async function updatePayment(id, status) {
    await apiRequest(`/admin/payment/${id}/status`, "PUT", { status });
    showAlert("Payment status updated!");
    location.reload();
}

// -------------------------
// SELLER DASHBOARD
// -------------------------
async function loadSellerDashboard() {
    await requireAuth("seller");
    const products = await apiRequest(`/products/seller/me`);
    renderSellerProducts(products);
}

function renderSellerProducts(products) {
    const table = document.getElementById("sellerProductTable");
    if (!table) return;
    table.innerHTML = `<tr><th>Title</th><th>Price</th><th>Status</th></tr>`;
    products.forEach(p => {
        table.innerHTML += `<tr>
            <td>${p.title}</td>
            <td>${formatCurrency(p.price)}</td>
            <td>${p.status}</td>
        </tr>`;
    });
}

// SELLER PAYMENTS
async function loadSellerPayments() {
    await requireAuth("seller");
    const payments = await apiRequest("/seller/payments");
    const table = document.getElementById("paymentBody");
    if (!table) return;
    table.innerHTML = "";
    payments.forEach(p => {
        table.innerHTML += `<tr>
            <td>${p.name}</td>
            <td>${p.amount}</td>
            <td>${p.status}</td>
        </tr>`;
    });
}

// -------------------------
// CART / CHECKOUT
// -------------------------
function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const container = document.getElementById("cartItems");
    if (!container) return;
    container.innerHTML = cart.map(id => `<div>Product ID: ${id}</div>`).join('');
}

function loadCheckout() {
    loadCart();
}

function loadConfirmPayment() {
    showAlert("Payment confirmed!");
}

// -------------------------
// ORDERS
// -------------------------
async function loadBuyerOrders() {
    await requireAuth();
    const orders = await apiRequest(`/orders`);
    const table = document.getElementById("ordersTable");
    if (!table) return;
    table.innerHTML = `<tr><th>Order ID</th><th>Status</th><th>Total</th></tr>`;
    orders.forEach(o => {
        table.innerHTML += `<tr>
            <td>${o._id}</td>
            <td>${o.status}</td>
            <td>${formatCurrency(o.total)}</td>
        </tr>`;
    });
}

// -------------------------
// CHAT
// -------------------------
function initChat() {
    console.log("Chat initialized (implement socket.io or API)");
}

// -------------------------
// SUBSCRIPTIONS / SETTINGS
// -------------------------
async function loadSubscriptions() {
    await requireAuth();
    console.log("Load subscriptions (implement API)");
}

async function loadSettings() {
    await requireAuth();
    console.log("Load user settings");
}
