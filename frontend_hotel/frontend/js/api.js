/* js/api.js — Helper fetch ke backend API */
const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  const headers = { ...options.headers };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Terjadi kesalahan pada server.');
  return data;
}

const api = {
  get: (url) => apiRequest(url, { method: 'GET' }),
  post: (url, body) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => apiRequest(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => apiRequest(url, { method: 'DELETE' }),
  upload: (url, formData) => apiRequest(url, { method: 'POST', body: formData }),
};

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

function diffDays(d1, d2) {
  return Math.max(1, Math.ceil((new Date(d2) - new Date(d1)) / 86400000));
}

function getStatusBadge(status, type = 'booking') {
  const map = {
    available: ['s-available', 'Available'],
    booked: ['s-booked', 'Booked'],
    pending: ['s-pending', 'Pending'],
    paid: ['s-paid', 'Paid'],
    confirmed: ['s-confirmed', 'Confirmed'],
    cancelled: ['s-cancelled', 'Cancelled'],
    checked_out: ['s-checked_out', 'Checked Out'],
  };
  const [cls, label] = map[status?.toLowerCase()] || ['s-pending', status];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container') || (() => {
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;min-width:280px;';
    document.body.appendChild(div);
    return div;
  })();

  const colors = { success: '#16A34A', error: '#DC2626', warning: '#CA8A04', info: '#2563EB' };
  const icons = { success: 'check-circle', error: 'x-circle', warning: 'exclamation-triangle', info: 'info-circle' };
  const id = 'toast-' + Date.now();

  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" style="
      background:#fff;
      border-left:4px solid ${colors[type]};
      border-radius:8px;
      box-shadow:0 4px 20px rgba(0,0,0,0.12);
      padding:14px 16px;
      margin-bottom:10px;
      display:flex;
      align-items:center;
      gap:10px;
      animation:slideIn 0.3s ease;
      font-family:'Inter',sans-serif;
      font-size:0.875rem;
    ">
      <i class="bi bi-${icons[type]}" style="color:${colors[type]};font-size:1.1rem;flex-shrink:0;"></i>
      <span style="flex:1;">${message}</span>
      <button onclick="document.getElementById('${id}').remove()" style="background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:1rem;padding:0;">×</button>
    </div>
  `);

  setTimeout(() => document.getElementById(id)?.remove(), 4000);
}

function showLoading(show = true) {
  let overlay = document.getElementById('loading-overlay');
  if (show) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.75);display:flex;align-items:center;justify-content:center;z-index:9998;';
      overlay.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  } else {
    if (overlay) overlay.style.display = 'none';
  }
}
