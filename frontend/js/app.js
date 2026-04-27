// ============================================
// Gym Management System - Shared JavaScript
// ============================================

// --- Auth Guard ---
function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    // Skip auth for login pages and portals with their own auth
    const skipPages = ['login.html', 'staff-login.html', 'staff-dashboard.html', 'trainer-login.html', 'trainer-dashboard.html'];
    if (skipPages.includes(currentPage)) return;

    // Admin-only pages
    const adminOnlyPages = ['manage-staff.html', 'expenditure.html', 'admin-reports.html', 'index.html'];

    const adminUser = localStorage.getItem('gym_user');
    const staffUser = localStorage.getItem('gym_staff');
    const trainerUser = localStorage.getItem('gym_trainer');

    if (adminOnlyPages.includes(currentPage)) {
        if (!adminUser) {
            window.location.href = 'login.html';
        }
    } else {
        // Shared pages: allow admin, staff, or trainer
        if (!adminUser && !staffUser && !trainerUser) {
            window.location.href = 'login.html';
        }
    }
}

function logout() {
    localStorage.removeItem('gym_user');
    localStorage.removeItem('gym_staff');
    window.location.href = 'login.html';
}

function getLoggedInUser() {
    try {
        const admin = JSON.parse(localStorage.getItem('gym_user'));
        if (admin) return { ...admin, isAdmin: true };
        const staff = JSON.parse(localStorage.getItem('gym_staff'));
        if (staff) return { ...staff, isAdmin: false };
        return null;
    } catch {
        return null;
    }
}

function isStaffUser() {
    return !!localStorage.getItem('gym_staff') && !localStorage.getItem('gym_user');
}

// Run auth check immediately
checkAuth();

const API_BASE = window.location.origin + '/api';

// --- Fetch Helpers ---
async function apiGet(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.statusText}`);
    return res.json();
}

async function apiPost(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

async function apiPut(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

async function apiDelete(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, { method: 'DELETE' });
    return res.json();
}

// --- Toast Notifications ---
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Dynamic Sidebar for Staff ---
// When a staff user visits a shared page, replace the admin sidebar with a staff sidebar
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // If staff user is on a shared page (not staff-dashboard.html), update the sidebar
    if (isStaffUser() && currentPage !== 'staff-dashboard.html') {
        const sidebar = document.querySelector('.sidebar-nav');
        if (sidebar) {
            sidebar.innerHTML = `
                <div class="nav-section-title">Main</div>
                <a href="staff-dashboard.html" class="nav-link"><span class="icon">📊</span> Dashboard</a>

                <div class="nav-section-title">Members</div>
                <a href="add-member.html" class="nav-link"><span class="icon">➕</span> Add Member</a>
                <a href="view-members.html" class="nav-link"><span class="icon">👥</span> View Members</a>

                <div class="nav-section-title">Trainers</div>
                <a href="add-trainer.html" class="nav-link"><span class="icon">➕</span> Add Trainer</a>
                <a href="view-trainers.html" class="nav-link"><span class="icon">🏅</span> View Trainers</a>

                <div class="nav-section-title">Payments</div>
                <a href="add-payment.html" class="nav-link"><span class="icon">💳</span> Add Payment</a>
                <a href="payment-history.html" class="nav-link"><span class="icon">📋</span> Payment History</a>

                <div class="nav-section-title">Account</div>
                <a href="#" class="nav-link" onclick="staffLogout(); return false;"><span class="icon">🚪</span> Logout</a>
            `;

            // Update brand subtitle
            const brandSmall = document.querySelector('.sidebar-brand h2 small');
            if (brandSmall) brandSmall.textContent = 'Staff Portal';

            // Update brand icon gradient to blue
            const brandIcon = document.querySelector('.sidebar-brand .brand-icon');
            if (brandIcon) brandIcon.style.background = 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
        }

        // Highlight active link
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) link.classList.add('active');
        });
    } else {
        // Admin user: highlight active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) link.classList.add('active');
        });

        // Update welcome text for admin
        const user = getLoggedInUser();
        if (user && user.isAdmin) {
            const pageHeader = document.querySelector('.page-header p');
            if (pageHeader && currentPage === 'index.html') {
                pageHeader.textContent = `Welcome back, ${user.username}! 🛡️ Admin`;
            }
        }
    }
});

// Staff logout function (available globally for shared pages)
function staffLogout() {
    localStorage.removeItem('gym_staff');
    window.location.href = 'staff-login.html';
}

// --- Utility Functions ---
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

function getQueryParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}

function getMembershipBadge(type) {
    const cls = {
        'Monthly': 'badge-monthly',
        'Quarterly': 'badge-quarterly',
        'Half-Yearly': 'badge-half',
        'Yearly': 'badge-yearly'
    }[type] || 'badge-method';
    return `<span class="badge ${cls}">${type}</span>`;
}

function getMethodBadge(method) {
    return `<span class="badge badge-method">${method}</span>`;
}

function confirmDelete(name) {
    return confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
}
