// ==========================================
// NEXUS CORE — APP JS
// ==========================================

// Página ativa na sidebar
function setActivePage(page) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
}

// Animação das barras do gráfico
function animateBars() {
  document.querySelectorAll('.bar[data-h]').forEach(bar => {
    setTimeout(() => {
      bar.style.height = bar.dataset.h + 'px';
    }, 200);
  });
}

// Progress bars animadas
function animateProgress() {
  document.querySelectorAll('.progress-fill[data-w]').forEach(bar => {
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.width = bar.dataset.w + '%';
    }, 300);
  });
}

// KPI counter animado
function animateCounter(el, target, prefix = '', suffix = '') {
  const duration = 1200;
  const start = performance.now();
  const isFloat = target % 1 !== 0;

  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = target * ease;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current).toLocaleString('pt-BR')) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const val = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    animateCounter(el, val, prefix, suffix);
  });
}

// Tooltip simples
function initTooltips() {
  document.querySelectorAll('[data-tip]').forEach(el => {
    el.addEventListener('mouseenter', e => {
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.textContent = el.dataset.tip;
      tip.style.cssText = `
        position:fixed;
        background:var(--surface3);
        border:1px solid var(--border2);
        color:var(--text);
        font-size:11px;
        font-family:var(--font-mono);
        padding:4px 9px;
        border-radius:6px;
        z-index:9999;
        pointer-events:none;
        white-space:nowrap;
        box-shadow:var(--shadow-md);
      `;
      document.body.appendChild(tip);

      const rect = el.getBoundingClientRect();
      tip.style.left = rect.left + (rect.width / 2) - (tip.offsetWidth / 2) + 'px';
      tip.style.top = rect.top - tip.offsetHeight - 6 + 'px';

      el._tip = tip;
    });

    el.addEventListener('mouseleave', () => {
      if (el._tip) { el._tip.remove(); el._tip = null; }
    });
  });
}

// Hora em tempo real no topbar
function startClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  tick();
  setInterval(tick, 1000);
}

// ---- SIDEBAR MOBILE TOGGLE ----
function toggleSidebar() {
  document.body.classList.toggle('sidebar-open');
}

function closeSidebar() {
  document.body.classList.remove('sidebar-open');
}

// Fecha sidebar ao navegar em mobile
document.querySelectorAll && document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', () => closeSidebar());
});

// Init geral
document.addEventListener('DOMContentLoaded', () => {
  animateBars();
  animateProgress();
  animateCounters();
  initTooltips();
  startClock();

  // Aplicar configurações salvas
  if (typeof applySettings === 'function') applySettings();

  // Detectar página atual
  const page = document.body.dataset.page || 'dashboard';
  setActivePage(page);

  // Ripple em botões
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      ripple.style.cssText = `
        position:absolute;
        width:60px; height:60px;
        border-radius:50%;
        background:rgba(255,255,255,0.15);
        transform:translate(-50%,-50%) scale(0);
        animation:ripple 0.4s ease;
        pointer-events:none;
        left:${e.clientX - rect.left}px;
        top:${e.clientY - rect.top}px;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });
});

// CSS ripple
const style = document.createElement('style');
style.textContent = `@keyframes ripple { to { transform: translate(-50%,-50%) scale(4); opacity:0; } }`;
document.head.appendChild(style);
