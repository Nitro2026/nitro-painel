// ==========================================
// NEXUS — Camada de Autenticação
// Supabase (se configurado) ou demo local
// ==========================================

const AUTH_SESSION_KEY = 'nexus_session';

function getAuthUser() {
  try {
    const s = sessionStorage.getItem(AUTH_SESSION_KEY) || localStorage.getItem(AUTH_SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function setAuthUser(user, remember) {
  const data = JSON.stringify(user);
  (remember ? localStorage : sessionStorage).setItem(AUTH_SESSION_KEY, data);
}

function clearAuthUser() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

// Atualiza o user card na sidebar
function updateUserCard(email, role) {
  const first = (email || 'Admin').split('@')[0];
  const nome  = first.charAt(0).toUpperCase() + first.slice(1);
  const initial = nome.charAt(0).toUpperCase();

  document.querySelectorAll('.user-name').forEach(el => el.textContent = nome);
  document.querySelectorAll('.user-role').forEach(el => el.textContent = role || 'Administrador');
  document.querySelectorAll('.user-avatar').forEach(el => {
    const dot = el.querySelector('.user-online');
    el.textContent = initial;
    if (dot) el.appendChild(dot);
    else {
      const d = document.createElement('span');
      d.className = 'user-online';
      el.appendChild(d);
    }
  });
}

// Verifica autenticação e redireciona se necessário
async function requireAuth() {
  if (window._supabase) {
    const { data: { session } } = await window._supabase.auth.getSession();
    if (!session) { window.location.replace('login.html'); return; }
    updateUserCard(session.user.email, 'Administrador');
    return;
  }
  const user = getAuthUser();
  if (!user) { window.location.replace('login.html'); return; }
  updateUserCard(user.email || user.nome, user.cargo || 'Administrador');
}

// Logout
async function logout() {
  if (window._supabase) {
    await window._supabase.auth.signOut().catch(() => {});
  }
  clearAuthUser();
  window.location.href = 'login.html';
}

// Inicializa em cada página protegida
document.addEventListener('DOMContentLoaded', async () => {
  if (document.body.dataset.page === 'login') return;
  await requireAuth();
});
