// MAIN.JS — online-first, real-time frontend
const API_BASE = (location.hostname === 'localhost') ? 'http://localhost:4000/api' : 'https://your-live-domain.com/api';
let socket = null;

// store token in sessionStorage (not localStorage)
function saveToken(token) { sessionStorage.setItem('mm_token', token); }
function getToken() { return sessionStorage.getItem('mm_token'); }
function clearToken() { sessionStorage.removeItem('mm_token'); }

async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  saveToken(data.token);
  return data.user;
}
async function register(payload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Register failed');
  saveToken(data.token);
  return data.user;
}

async function me() {
  const token = getToken();
  if (!token) { window.location.href = '/login.html'; return null; }
  const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok) { clearToken(); window.location.href = '/login.html'; return null; }
  return res.json();
}

async function apiRequest(endpoint, method='GET', body=null) {
  const token = getToken();
  const opts = { method, headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + token } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(API_BASE + endpoint, opts);
  const data = await res.json().catch(()=>null);
  if (!res.ok) throw new Error(data?.message || res.statusText);
  return data;
}

// initialize socket.io connection
function initSocket() {
  if (!window.io) return;
  const base = API_BASE.replace('/api','');
  socket = io(base, { auth: { token: getToken() } });
  socket.on('connect', () => console.log('socket connected', socket.id));
  socket.on('paymentUpdate', () => { if (typeof onPaymentUpdate === 'function') onPaymentUpdate(); });
  socket.on('sellerUpdate', () => { if (typeof onSellerUpdate === 'function') onSellerUpdate(); });
  socket.on('userUpdate', () => { if (typeof onUserUpdate === 'function') onUserUpdate(); });
  socket.on('cartUpdate', () => { if (typeof onCartUpdate === 'function') onCartUpdate(); });
  socket.on('orderCreated', () => { if (typeof onOrderCreated === 'function') onOrderCreated(); });
}

// utility helpers
function showAlert(msg) { alert(msg); }
function formatCurrency(amount){ return new Intl.NumberFormat('en-GM', { style: 'currency', currency: 'GMD' }).format(amount); }

// PAGE-BASED AUTO RUN
document.addEventListener('DOMContentLoaded', async () => {
  initSocket();
  const page = document.body.dataset.page || '';

  try {
    switch(page) {
      case 'index': await runIndex(); break;
      case 'login': runLogin(); break;
      case 'register': runRegister(); break;
      case 'dashboard-admin': await runAdminDashboard(); break;
      case 'admin-sellers': await runAdminSellers(); break;
      case 'admin-accept-payment': await runAdminPayments(); break;
      case 'shop': await runShop(); break;
      case 'cart': await runCart(); break;
      case 'checkout': await runCheckout(); break;
      case 'seller-dashboard': await runSellerDashboard(); break;
      case 'buyers-orders': await runBuyerOrders(); break;
      // add other pages similarly
      default: break;
    }
  } catch (err) {
    console.error(err);
    showAlert(err.message || 'Error');
  }
});

// ---- INDEX / SHOP ----
async function runIndex(){ await runShop(); }
async function runShop(){
  const products = await apiRequest('/products');
  const container = document.getElementById('product-list');
  if(!container) return;
  container.innerHTML = products.map(p => `
    <div class="product-card">
      <img src="${p.image||''}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p>${formatCurrency(p.price)}</p>
      <button onclick="addToCart('${p._id}')">Add to Cart</button>
    </div>
  `).join('');
}

// ---- AUTH PAGES ----
function runLogin(){
  const form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = form.email.value, password = form.password.value;
    try { await login(email, password); initSocket(); window.location.href='/'; } catch(err){ showAlert(err.message); }
  });
}
function runRegister(){
  const form = document.getElementById('registerForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const payload = { name: form.name.value, email: form.email.value, password: form.password.value, role: form.role?.value || 'buyer' };
    try { await register(payload); initSocket(); window.location.href='/'; } catch(err){ showAlert(err.message); }
  });
}

// ---- CART ----
async function addToCart(productId){
  await apiRequest('/cart/add','POST',{ productId, quantity:1 });
  showAlert('Added to cart', 'success');
  if(socket) socket.emit('cartChanged');
}
async function runCart(){
  const cart = await apiRequest('/cart');
  const container = document.getElementById('cartItems');
  if(!container) return;
  container.innerHTML = cart.items.map(i => `
    <div>
      ${i.product.title} x ${i.quantity} — ${formatCurrency(i.product.price)}
      <button onclick="removeFromCart('${i.product._id}')">Remove</button>
    </div>
  `).join('');
}
async function removeFromCart(productId){
  await apiRequest('/cart/remove','POST',{ productId });
  showAlert('Removed', 'success');
  if(socket) socket.emit('cartChanged');
}

// ---- CHECKOUT / ORDERS ----
async function runCheckout(){
  const btn = document.getElementById('btnCheckout');
  if(!btn) return;
  btn.addEventListener('click', async ()=>{
    try {
      const order = await apiRequest('/orders','POST');
      showAlert('Order placed');
      if(socket) socket.emit('orderCreated', { orderId: order._id });
      window.location.href = '/order-accepted.html';
    } catch(err){ showAlert(err.message); }
  });
}
async function runBuyerOrders(){
  const orders = await apiRequest('/orders');
  const table = document.getElementById('ordersTable');
  if(!table) return;
  table.innerHTML = orders.map(o => `<tr><td>${o._id}</td><td>${o.status}</td><td>${formatCurrency(o.total)}</td></tr>`).join('');
}

// ---- ADMIN DASHBOARD / SELLERS / PAYMENTS ----
async function runAdminDashboard(){
  const meUser = await apiRequest('/auth/me'); // will error if not auth
  if(meUser.role !== 'admin'){ showAlert('Access denied'); window.location.href='/'; return; }
  const overview = await apiRequest('/admin/overview');
  document.getElementById('totalUsers').textContent = overview.usersCount;
  document.getElementById('totalSellers').textContent = overview.sellersCount;
  document.getElementById('totalProducts').textContent = overview.productsCount;
}
async function runAdminSellers(){
  await apiRequest('/auth/me'); // ensure token valid
  const sellers = await apiRequest('/admin/sellers');
  const table = document.getElementById('sellerTable');
  if(!table) return;
  table.innerHTML = sellers.map(s => `
    <tr><td>${s.name}</td><td>${s.email}</td><td>${s.status}</td>
    <td>
      <button onclick="adminUpdateSeller('${s._id}','Approved')">Approve</button>
      <button onclick="adminUpdateSeller('${s._id}','Declined')">Decline</button>
    </td></tr>
  `).join('');
}
async function adminUpdateSeller(id,status){
  await apiRequest(`/admin/sellers/${id}/status`,'PUT',{ status });
  showAlert('Seller updated');
  if(socket) socket.emit('sellerChanged');
  await runAdminSellers();
}
async function runAdminPayments(){
  await apiRequest('/auth/me');
  const payments = await apiRequest('/admin/payments');
  const table = document.getElementById('paymentBody');
  if(!table) return;
  table.innerHTML = payments.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.email}</td>
      <td>${formatCurrency(p.amount)}</td>
      <td>${p.method}</td>
      <td>${new Date(p.date).toLocaleString()}</td>
      <td>${p.status}</td>
      <td>${p.status === 'Pending' ? `<button onclick="adminUpdatePayment('${p._id}','Approved')">Accept</button><button onclick="adminUpdatePayment('${p._id}','Declined')">Decline</button>` : '-'}</td>
    </tr>
  `).join('');
}
async function adminUpdatePayment(id,status){
  await apiRequest(`/admin/payments/${id}/status`,'PUT',{ status });
  showAlert('Payment updated');
  if(socket) socket.emit('paymentChanged');
  await runAdminPayments();
}

// ---- SELLER DASHBOARD ----
async function runSellerDashboard(){
  const me = await apiRequest('/auth/me');
  if(me.role !== 'seller'){ showAlert('Access denied'); return; }
  const res = await apiRequest('/products?seller=' + me._id);
  const table = document.getElementById('sellerProductTable');
  if(!table) return;
  table.innerHTML = res.map(p => `<tr><td>${p.title}</td><td>${formatCurrency(p.price)}</td><td>${p.status}</td></tr>`).join('');
}

// ---- handlers used by socket events can be defined globally if needed ----
window.onPaymentUpdate = runAdminPayments;
window.onSellerUpdate = runAdminSellers;
window.onUserUpdate = () => { /* optional: refresh admin users */ };
window.onCartUpdate = runCart;
window.onOrderCreated = () => { /* optional: notify admin */ };

// expose a small API for buttons
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.adminUpdatePayment = adminUpdatePayment;
window.adminUpdateSeller = adminUpdateSeller;
window.login = login;
window.register = register;
window.logout = () => { clearToken(); window.location.href = '/login.html'; };
  












  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBZpLELrmplsK66YNPycGLO2Aab9jvxa9k",
    authDomain: "matrixmarketpace.firebaseapp.com",
    projectId: "matrixmarketpace",
    storageBucket: "matrixmarketpace.firebasestorage.app",
    messagingSenderId: "200867795667",
    appId: "1:200867795667:web:64de1ece48ddc07fa4ba26",
    measurementId: "G-10TFPP3LDD"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);




