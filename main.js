// ===========================
//  GLOBAL MATRIX MARKETPLACE JS
// ===========================

const API_BASE = "http://localhost:4000/api"; 
// Change to your live URL when deployed
// const API_BASE = "https://your-backend-domain.com/api";

// ===== TOKEN MANAGEMENT =====
function getToken() {
  return localStorage.getItem("mm_token");
}

function saveToken(token) {
  localStorage.setItem("mm_token", token);
}

function logout() {
  localStorage.removeItem("mm_token");
  window.location.href = "login.html";
}

// ===== PROTECTED ROUTE CHECK =====
async function requireAuth(role) {
  const token = getToken();
  if (!token) {
    alert("Please log in first!");
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(`${API_BASE}/auth/verify`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!res.ok) {
    alert("Session expired. Please login again.");
    logout();
  } else {
    const user = await res.json();
    if (role && user.role !== role) {
      alert("Access denied.");
      window.location.href = "index.html";
    }
    window.currentUser = user;
  }
}

// ===== UNIVERSAL FETCH HELPER =====
async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + getToken()
  };

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  return res.json();
}

// ==============================
// MATRIX MARKETPLACE UNIVERSAL JS
// ==============================

// 🔗 Change this to your backend URL
const API_BASE = "http://localhost:4000/api";
// const API_BASE = "https://your-live-backend.com/api";

// ==============================
// TOKEN MANAGEMENT
// ==============================
function getToken() {
    return localStorage.getItem("mm_token");
}

function saveToken(token) {
    localStorage.setItem("mm_token", token);
}

function logout() {
    localStorage.removeItem("mm_token");
    window.location.href = "login.html";
}

// ==============================
// UNIVERSAL API REQUEST
// ==============================
async function apiRequest(endpoint, method = "GET", body = null) {
    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
    };
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || "API request failed");
    }
    return await res.json();
}

// ==============================
// ROLE-BASED ACCESS CONTROL
// ==============================
async function requireAuth(role = null) {
    const token = getToken();
    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    try {
        const user = await apiRequest("/auth/verify"); // verify token route
        window.currentUser = user;

        if (role && user.role !== role) {
            alert("Access denied!");
            if (user.role === "admin") window.location.href = "dashboard-admin.html";
            else if (user.role === "seller") window.location.href = "seller-dashboard.html";
            else window.location.href = "shop.html";
        }
        return user;
    } catch (err) {
        alert("Session expired. Please login again.");
        logout();
    }
}

// ==============================
// LOGIN & REGISTER
// ==============================
async function login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    saveToken(data.token);
    redirectByRole(data.role);
}

async function register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    saveToken(data.token);
    redirectByRole(data.role);
}

// ==============================
// ROLE BASED REDIRECT
// ==============================
function redirectByRole(role) {
    if (role === "admin") window.location.href = "dashboard-admin.html";
    else if (role === "seller") window.location.href = "seller-dashboard.html";
    else window.location.href = "shop.html";
}

// ==============================
// SELLER / USER / ADMIN HELPERS
// ==============================
async function fetchUsers() {
    return apiRequest("/admin/users");
}

async function fetchSellers() {
    return apiRequest("/admin/sellers");
}

async function fetchAdminOverview() {
    return apiRequest("/admin/overview");
}

async function updateUserRole(userId, role) {
    return apiRequest(`/admin/user/${userId}/role`, "PUT", { role });
}

async function updateSellerStatus(sellerId, status) {
    return apiRequest(`/admin/seller/${sellerId}/status`, "PUT", { status });
}

// ==============================
// PAYMENT HELPERS
// ==============================
async function fetchPendingPayments() {
    return apiRequest("/admin/payments");
}

async function approvePayment(paymentId) {
    return apiRequest(`/admin/payments/${paymentId}`, "PUT", { status: "Approved" });
}

async function declinePayment(paymentId) {
    return apiRequest(`/admin/payments/${paymentId}`, "PUT", { status: "Declined" });
}

// ==============================
// UTILITY FUNCTIONS
// ==============================
function formatCurrency(amount, currency = "GMD") {
    return `${amount} ${currency}`;
}

function showAlert(msg) {
    alert(msg);
}

// ==============================
// EXPORT (optional if using modules)
// ==============================
// export { login, register, logout, requireAuth, apiRequest };
