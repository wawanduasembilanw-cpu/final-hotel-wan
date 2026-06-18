/* js/auth.js — Auth helper: token, user, guard, navbar */

function getUser()   { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }
function getToken()  { return localStorage.getItem('token'); }
function isLoggedIn(){ return !!getToken(); }
function isAdmin()   { const u = getUser(); return u && u.role === 'admin'; }
function isCustomer(){ const u = getUser(); return u && u.role === 'customer'; }

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

/* Guard: call at top of protected customer pages */
function requireAuth() {
  if (!isLoggedIn()) {
    sessionStorage.setItem('redirect_after_login', window.location.href);
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

/* Guard: call at top of admin pages */
function requireAdmin() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  if (!isAdmin()) {
    showToast('Akses ditolak. Halaman ini hanya untuk admin.', 'error');
    setTimeout(() => window.location.href = '/index.html', 1500);
    return false;
  }
  return true;
}

/* Render navbar user section */
function updateNavbar() {
  const el = document.getElementById('nav-auth');
  if (!el) return;
  const user = getUser();
  if (!user) {
    el.innerHTML = `
      <a href="/login.html" class="btn btn-outline-primary me-2" style="border-radius:8px;font-weight:600;">Masuk</a>
      <a href="/register.html" class="btn btn-wan-primary">Daftar</a>`;
    return;
  }
  const adminLink = user.role === 'admin'
    ? `<li><a class="dropdown-item" href="/admin/dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Dashboard Admin</a></li>`
    : `<li><a class="dropdown-item" href="/profile.html"><i class="bi bi-person me-2"></i>Profil Saya</a></li>
       <li><a class="dropdown-item" href="/booking-history.html"><i class="bi bi-clock-history me-2"></i>Riwayat Booking</a></li>`;
  el.innerHTML = `
    <div class="dropdown">
      <button class="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" style="border-radius:8px;font-weight:600;">
        <i class="bi bi-person-circle"></i>${user.name || user.username}
      </button>
      <ul class="dropdown-menu dropdown-menu-end shadow border-0" style="border-radius:10px;min-width:200px;">
        ${adminLink}
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Keluar</button></li>
      </ul>
    </div>`;
}

/* Render admin topbar user section */
function updateAdminTopbar() {
  const el = document.getElementById('admin-user-info');
  if (!el) return;
  const user = getUser();
  if (!user) return;
  el.innerHTML = `
    <div class="dropdown">
      <button class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown" style="border-radius:8px;">
        <i class="bi bi-person-circle"></i>${user.name || user.username}
      </button>
      <ul class="dropdown-menu dropdown-menu-end shadow border-0">
        <li><span class="dropdown-item-text text-muted small">${user.email || ''}</span></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" onclick="logout()"><i class="bi bi-box-arrow-right me-2"></i>Keluar</button></li>
      </ul>
    </div>`;
}

/* Mark active sidebar link */
function setActiveSidebarLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar-link').forEach(link => {
    if (link.getAttribute('href') && path.endsWith(link.getAttribute('href').replace('/admin/', ''))) {
      link.classList.add('active');
    }
  });
}
