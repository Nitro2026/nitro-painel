// ==========================================
// DATA LAYER + MODAL SYSTEM
// ==========================================

// ---- SETTINGS ----
const SETTINGS_KEY = 'nexus_settings';

const defaultSettings = {
  empresa: '',
  cnpj: '',
  email: '',
  fuso: 'América/São Paulo (UTC-3)',
  moeda: 'BRL — Real Brasileiro',
  alerta_fatura: '3',
  taxa_imposto: '0%',
  notif_prazo: true,
  notif_tarefa: true,
  notif_fatura: true,
  notif_relatorio: false,
  notif_carga: true,
  backup: true,
};

function getSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings };
  } catch { return { ...defaultSettings }; }
}

function saveSettings(data) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

function applySettings() {
  const s = getSettings();
  const nome = s.empresa || 'Sistema de Gestão';
  document.querySelectorAll('[data-bind="empresa"]').forEach(el => el.textContent = nome);
  document.querySelectorAll('[data-bind="empresa-letra"]').forEach(el => el.textContent = nome.charAt(0).toUpperCase());
  document.querySelectorAll('[data-bind="email"]').forEach(el => el.textContent = s.email);
}

// ---- DATA STORES ----
const DATA_KEYS = {
  projetos:      'sys_projetos',
  clientes:      'sys_clientes',
  colaboradores: 'sys_colaboradores',
  tarefas:       'sys_tarefas',
  transacoes:    'sys_transacoes',
  faturas:       'sys_faturas',
};

function getData(key) {
  try {
    const raw = localStorage.getItem(DATA_KEYS[key] || key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveData(key, arr) {
  localStorage.setItem(DATA_KEYS[key] || key, JSON.stringify(arr));
}

function addItem(key, item) {
  item.id = Date.now() + Math.floor(Math.random() * 1000);
  const list = getData(key);
  list.push(item);
  saveData(key, list);
  return item;
}

function removeItem(key, id) {
  saveData(key, getData(key).filter(i => i.id !== Number(id) && i.id !== id));
}

// ---- HELPERS ----
function statusBadge(status) {
  const m = {
    'Em Andamento': 'badge-warning',
    'Em Revisão':   'badge-info',
    'Concluído':    'badge-success',
    'Atrasado':     'badge-danger',
  };
  return m[status] || 'badge-metal';
}

function statusKey(status) {
  const m = {
    'Em Andamento': 'andamento',
    'Em Revisão':   'revisao',
    'Concluído':    'concluido',
    'Atrasado':     'atrasado',
  };
  return m[status] || 'outros';
}

function cargaInfo(c) {
  c = Number(c) || 0;
  if (c >= 90) return { label: 'Carga Crítica', cls: 'badge-danger',   fill: 'danger' };
  if (c >= 75) return { label: 'Alta Carga',    cls: 'badge-warning',  fill: 'warning' };
  if (c < 50)  return { label: 'Disponível',    cls: 'badge-success',  fill: 'success' };
  return         { label: 'Normal',          cls: 'badge-success',  fill: '' };
}

function progressFill(p) {
  p = Number(p) || 0;
  if (p >= 90) return 'success';
  if (p >= 60) return '';
  if (p >= 30) return 'warning';
  return 'danger';
}

function formatMoney(v) {
  return parseFloat(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(s) {
  if (!s) return '—';
  try { return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR'); } catch { return s; }
}

const AVATAR_COLORS = ['', 'green', 'purple', 'orange', 'red'];
function avatarColor(i) { return AVATAR_COLORS[Number(i) % AVATAR_COLORS.length]; }

// Selects dinâmicos para formulários
function projetosOpts(placeholder) {
  const list = getData('projetos');
  if (!list.length) return `<option value="">${placeholder || 'Nenhum projeto cadastrado'}</option>`;
  return `<option value="">— Selecionar —</option>` + list.map(p => `<option>${p.nome}</option>`).join('');
}

function clientesOpts(placeholder) {
  const list = getData('clientes');
  if (!list.length) return `<option value="">${placeholder || 'Nenhum cliente cadastrado'}</option>`;
  return `<option value="">— Selecionar —</option>` + list.map(c => `<option>${c.empresa}</option>`).join('');
}

function colaboradoresOpts(placeholder) {
  const list = getData('colaboradores');
  if (!list.length) return `<option value="">${placeholder || 'Nenhum colaborador cadastrado'}</option>`;
  return `<option value="">— Selecionar —</option>` + list.map(c => `<option>${c.nome}</option>`).join('');
}

// ---- TOAST ----
function createToastContainer() {
  let tc = document.querySelector('.toast-container');
  if (!tc) { tc = document.createElement('div'); tc.className = 'toast-container'; document.body.appendChild(tc); }
  return tc;
}

function showToast(msg, type = 'info', duration = 3200) {
  const icons = { success: '✓', error: '✗', info: '◈', warning: '⚠' };
  const tc = createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '◈'}</span><span class="toast-text">${msg}</span>`;
  tc.appendChild(toast);
  setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, duration);
}

// ---- MODAL ----
function openModal(html, size = '') {
  closeModal();
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'nexus-modal';
  const modal = document.createElement('div');
  modal.className = `modal ${size}`;
  modal.innerHTML = html;
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('open'));
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
  document._modalEsc = e => { if (e.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', document._modalEsc);
  modal.querySelector('.modal-close')?.addEventListener('click', closeModal);
  return modal;
}

function closeModal() {
  const backdrop = document.getElementById('nexus-modal');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  setTimeout(() => backdrop.remove(), 200);
  document.removeEventListener('keydown', document._modalEsc);
}

// ---- MODAL DETALHE: PROJETO ----
function modalProjeto(dados) {
  const sc = statusBadge(dados.status);
  const pf = progressFill(dados.progress || 0);
  const equipe = dados.equipe || [];

  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">${dados.nome}</div>
        <div class="modal-sub">${dados.cliente || '—'} · R$ ${formatMoney(dados.valor)}</div>
      </div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="badge ${sc}">${dados.status}</span>
        <span class="badge badge-metal">Prazo: ${formatDate(dados.prazo)}</span>
      </div>
      ${dados.descricao ? `<p style="font-size:13px;color:var(--text2);line-height:1.6">${dados.descricao}</p>` : ''}
      <div>
        <div class="detail-key" style="margin-bottom:8px">Progresso Geral</div>
        <div class="progress-bar" style="height:6px">
          <div class="progress-fill ${pf}" style="width:${dados.progress || 0}%"></div>
        </div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);margin-top:4px">${dados.progress || 0}% concluído</div>
      </div>
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:14px">
        <div class="detail-row"><span class="detail-key">Cliente</span><span class="detail-val">${dados.cliente || '—'}</span></div>
        <div class="detail-row"><span class="detail-key">Valor</span><span class="detail-val" style="color:var(--success)">R$ ${formatMoney(dados.valor)}</span></div>
        <div class="detail-row"><span class="detail-key">Início</span><span class="detail-val">${formatDate(dados.inicio)}</span></div>
        <div class="detail-row"><span class="detail-key">Prazo</span><span class="detail-val">${formatDate(dados.prazo)}</span></div>
        <div class="detail-row"><span class="detail-key">Responsável</span><span class="detail-val">${dados.responsavel || '—'}</span></div>
        ${equipe.length ? `<div class="detail-row"><span class="detail-key">Equipe</span><div style="display:flex;gap:4px">${equipe.map((m,i) => `<div class="avatar-sm ${m.cor||avatarColor(i)}" data-tip="${m.nome}">${m.inicial}</div>`).join('')}</div></div>` : ''}
      </div>
      ${dados.id ? `
      <div style="display:flex;gap:8px;align-items:center">
        <label class="form-label" style="white-space:nowrap">Atualizar progresso:</label>
        <input type="range" min="0" max="100" value="${dados.progress||0}" id="prog-slider" style="flex:1">
        <span id="prog-val" style="font-family:var(--font-mono);font-size:12px;width:36px">${dados.progress||0}%</span>
      </div>` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Fechar</button>
      ${dados.id ? `<button class="btn btn-primary btn-sm" onclick="atualizarProgressoProjeto(${dados.id})">Salvar Progresso →</button>` : `<button class="btn btn-primary btn-sm" onclick="closeModal();window.location.href='projetos.html'">Ver Projetos →</button>`}
    </div>
  `);

  // Slider live update
  const slider = document.getElementById('prog-slider');
  const valEl = document.getElementById('prog-val');
  if (slider) slider.addEventListener('input', () => { valEl.textContent = slider.value + '%'; });
}

function atualizarProgressoProjeto(id) {
  const val = document.getElementById('prog-slider')?.value;
  if (val === undefined) return;
  const list = getData('projetos').map(p => p.id === id ? { ...p, progress: Number(val) } : p);
  saveData('projetos', list);
  closeModal();
  showToast('Progresso atualizado!', 'success');
  if (typeof renderProjetos === 'function') renderProjetos();
  if (typeof renderDashboard === 'function') renderDashboard();
}

// ---- MODAL DETALHE: COLABORADOR ----
function modalColaborador(dados) {
  const ci = cargaInfo(dados.carga);
  openModal(`
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="avatar-sm ${dados.cor||''}" style="width:44px;height:44px;font-size:18px;border-radius:50%;font-family:var(--font-disp)">${dados.inicial||dados.nome?.charAt(0)||'?'}</div>
        <div>
          <div class="modal-title">${dados.nome}</div>
          <div class="modal-sub">${dados.cargo} · ${dados.email}</div>
        </div>
      </div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:14px">
        <div class="detail-row"><span class="detail-key">Cargo</span><span class="detail-val">${dados.cargo}</span></div>
        <div class="detail-row"><span class="detail-key">E-mail</span><span class="detail-val" style="font-family:var(--font-mono);font-size:12px">${dados.email||'—'}</span></div>
        <div class="detail-row"><span class="detail-key">Projetos</span><span class="badge badge-metal">${dados.projetos||0} projetos</span></div>
        <div class="detail-row"><span class="detail-key">Status</span><span class="badge ${ci.cls}">${ci.label}</span></div>
        <div class="detail-row"><span class="detail-key">Nível de Acesso</span><span class="detail-val">${dados.acesso||'Colaborador'}</span></div>
      </div>
      <div>
        <div class="detail-key" style="margin-bottom:8px">Carga de Trabalho</div>
        <div class="progress-bar" style="height:8px">
          <div class="progress-fill ${ci.fill}" style="width:${dados.carga||0}%"></div>
        </div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);margin-top:4px">${dados.carga||0}% de capacidade</div>
      </div>
      ${dados.skills?.length ? `
      <div>
        <div class="detail-key" style="margin-bottom:8px">Habilidades</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${dados.skills.map(s => `<span class="badge badge-metal">${s}</span>`).join('')}
        </div>
      </div>` : ''}
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Fechar</button>
      ${dados.id ? `<button class="btn btn-ghost btn-sm" style="border-color:rgba(239,68,68,0.3);color:var(--danger)" onclick="removeItem('colaboradores',${dados.id});closeModal();if(typeof renderColaboradores==='function')renderColaboradores();showToast('Colaborador removido','success')">Remover</button>` : ''}
    </div>
  `);
}

// ---- MODAL DETALHE: CLIENTE ----
function modalCliente(dados) {
  const statusMap = { ativo: 'badge-success', proposta: 'badge-warning', lead: 'badge-info' };
  const statusLabel = { ativo: 'Ativo', proposta: 'Em Proposta', lead: 'Lead' };
  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">${dados.empresa}</div>
        <div class="modal-sub">${dados.contato||'—'} · ${dados.cargo||'—'}</div>
      </div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:14px">
        <div class="detail-row"><span class="detail-key">Contato</span><span class="detail-val">${dados.contato||'—'}</span></div>
        <div class="detail-row"><span class="detail-key">E-mail</span><span class="detail-val" style="font-family:var(--font-mono);font-size:12px">${dados.email||'—'}</span></div>
        <div class="detail-row"><span class="detail-key">Telefone</span><span class="detail-val">${dados.telefone||'—'}</span></div>
        <div class="detail-row"><span class="detail-key">Status</span><span class="badge ${statusMap[dados.status]||'badge-metal'}">${statusLabel[dados.status]||dados.status}</span></div>
        <div class="detail-row"><span class="detail-key">Projetos</span><span class="badge badge-metal">${dados.projetos||0}</span></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Fechar</button>
      ${dados.id ? `<button class="btn btn-ghost btn-sm" style="border-color:rgba(239,68,68,0.3);color:var(--danger)" onclick="removeItem('clientes',${dados.id});closeModal();if(typeof renderClientes==='function')renderClientes();showToast('Cliente removido','success')">Remover</button>` : ''}
    </div>
  `);
}

// ---- FORM: NOVO PROJETO ----
function modalNovoProjetoForm() {
  openModal(`
    <div class="modal-header">
      <div><div class="modal-title">Novo Projeto</div><div class="modal-sub">Adicionar ao sistema</div></div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Nome do Projeto *</label>
        <input class="form-input" id="m-proj-nome" placeholder="Ex: Sistema de Gestão ABC">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cliente</label>
          <input class="form-input" id="m-proj-cliente" placeholder="Nome do cliente">
        </div>
        <div class="form-group">
          <label class="form-label">Valor (R$)</label>
          <input class="form-input" id="m-proj-valor" type="number" placeholder="0">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Data de Início</label>
          <input class="form-input" id="m-proj-inicio" type="date">
        </div>
        <div class="form-group">
          <label class="form-label">Prazo de Entrega</label>
          <input class="form-input" id="m-proj-prazo" type="date">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-input" id="m-proj-status">
          <option>Em Andamento</option>
          <option>Em Revisão</option>
          <option>Atrasado</option>
          <option>Concluído</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Responsável</label>
        <select class="form-input" id="m-proj-resp">${colaboradoresOpts('Selecionar...')}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Descrição</label>
        <textarea class="form-input" id="m-proj-desc" rows="3" placeholder="Descreva o escopo..." style="resize:vertical"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="salvarNovoProjeto()">Criar Projeto →</button>
    </div>
  `, 'modal-lg');
}

function salvarNovoProjeto() {
  const nome = document.getElementById('m-proj-nome')?.value.trim();
  if (!nome) { showToast('Informe o nome do projeto', 'error'); return; }
  addItem('projetos', {
    nome,
    cliente:     document.getElementById('m-proj-cliente')?.value.trim() || '',
    valor:       document.getElementById('m-proj-valor')?.value || '0',
    inicio:      document.getElementById('m-proj-inicio')?.value || '',
    prazo:       document.getElementById('m-proj-prazo')?.value || '',
    status:      document.getElementById('m-proj-status')?.value || 'Em Andamento',
    responsavel: document.getElementById('m-proj-resp')?.value || '',
    descricao:   document.getElementById('m-proj-desc')?.value.trim() || '',
    progress:    0,
    equipe:      [],
  });
  closeModal();
  showToast(`Projeto "${nome}" criado!`, 'success');
  if (typeof renderProjetos    === 'function') renderProjetos();
  if (typeof renderDashboard   === 'function') renderDashboard();
}

// ---- FORM: NOVO CLIENTE ----
function modalNovoClienteForm() {
  openModal(`
    <div class="modal-header">
      <div><div class="modal-title">Novo Cliente</div><div class="modal-sub">Cadastrar na base</div></div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Empresa *</label>
        <input class="form-input" id="m-cli-empresa" placeholder="Nome da empresa">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Contato Principal</label>
          <input class="form-input" id="m-cli-contato" placeholder="Nome do responsável">
        </div>
        <div class="form-group">
          <label class="form-label">Cargo</label>
          <input class="form-input" id="m-cli-cargo" placeholder="Ex: CEO, Diretor">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input class="form-input" id="m-cli-email" type="email" placeholder="email@empresa.com">
        </div>
        <div class="form-group">
          <label class="form-label">Telefone / WhatsApp</label>
          <input class="form-input" id="m-cli-tel" placeholder="(11) 99999-9999">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-input" id="m-cli-status">
          <option value="lead">Lead</option>
          <option value="proposta">Em Proposta</option>
          <option value="ativo">Cliente Ativo</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="salvarNovoCliente()">Cadastrar →</button>
    </div>
  `);
}

function salvarNovoCliente() {
  const empresa = document.getElementById('m-cli-empresa')?.value.trim();
  if (!empresa) { showToast('Informe o nome da empresa', 'error'); return; }
  addItem('clientes', {
    empresa,
    contato:    document.getElementById('m-cli-contato')?.value.trim() || '',
    cargo:      document.getElementById('m-cli-cargo')?.value.trim() || '',
    email:      document.getElementById('m-cli-email')?.value.trim() || '',
    telefone:   document.getElementById('m-cli-tel')?.value.trim() || '',
    status:     document.getElementById('m-cli-status')?.value || 'lead',
    projetos:   0,
    valorTotal: 0,
  });
  closeModal();
  showToast(`Cliente "${empresa}" cadastrado!`, 'success');
  if (typeof renderClientes  === 'function') renderClientes();
  if (typeof renderDashboard === 'function') renderDashboard();
}

// ---- FORM: NOVO COLABORADOR ----
function modalNovoColaboradorForm() {
  openModal(`
    <div class="modal-header">
      <div><div class="modal-title">Novo Colaborador</div><div class="modal-sub">Adicionar à equipe</div></div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nome Completo *</label>
          <input class="form-input" id="m-col-nome" placeholder="Nome do colaborador">
        </div>
        <div class="form-group">
          <label class="form-label">Cargo *</label>
          <input class="form-input" id="m-col-cargo" placeholder="Ex: Dev Senior">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input class="form-input" id="m-col-email" type="email" placeholder="nome@empresa.com">
        </div>
        <div class="form-group">
          <label class="form-label">Carga Atual (%)</label>
          <input class="form-input" id="m-col-carga" type="number" min="0" max="100" value="0" placeholder="0–100">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Nível de Acesso</label>
        <select class="form-input" id="m-col-acesso">
          <option>Colaborador</option>
          <option>Gerente</option>
          <option>Administrador</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Habilidades (separadas por vírgula)</label>
        <input class="form-input" id="m-col-skills" placeholder="React, Node.js, Figma...">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="salvarNovoColaborador()">Adicionar →</button>
    </div>
  `);
}

function salvarNovoColaborador() {
  const nome = document.getElementById('m-col-nome')?.value.trim();
  if (!nome) { showToast('Informe o nome do colaborador', 'error'); return; }
  const skillsStr = document.getElementById('m-col-skills')?.value || '';
  addItem('colaboradores', {
    nome,
    cargo:    document.getElementById('m-col-cargo')?.value.trim() || '',
    email:    document.getElementById('m-col-email')?.value.trim() || '',
    carga:    Number(document.getElementById('m-col-carga')?.value || 0),
    acesso:   document.getElementById('m-col-acesso')?.value || 'Colaborador',
    skills:   skillsStr.split(',').map(s => s.trim()).filter(Boolean),
    projetos: 0,
  });
  closeModal();
  showToast(`Colaborador "${nome}" adicionado!`, 'success');
  if (typeof renderColaboradores === 'function') renderColaboradores();
  if (typeof renderDashboard     === 'function') renderDashboard();
}

// ---- FORM: NOVA TAREFA ----
function modalNovaTarefaForm() {
  openModal(`
    <div class="modal-header">
      <div><div class="modal-title">Nova Tarefa</div><div class="modal-sub">Adicionar ao kanban</div></div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Título da Tarefa *</label>
        <input class="form-input" id="m-tar-titulo" placeholder="Descreva a tarefa...">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Projeto</label>
          <select class="form-input" id="m-tar-proj">${projetosOpts('— Selecionar —')}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Prioridade</label>
          <select class="form-input" id="m-tar-prio">
            <option>Normal</option>
            <option>Alta</option>
            <option>Urgente</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Responsável</label>
          <select class="form-input" id="m-tar-resp">${colaboradoresOpts('— Selecionar —')}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Prazo</label>
          <input class="form-input" id="m-tar-prazo" type="date">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Categoria</label>
        <input class="form-input" id="m-tar-cat" placeholder="Ex: Backend, Design, QA...">
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="salvarNovaTarefa()">Criar Tarefa →</button>
    </div>
  `);
}

function salvarNovaTarefa() {
  const titulo = document.getElementById('m-tar-titulo')?.value.trim();
  if (!titulo) { showToast('Informe o título da tarefa', 'error'); return; }
  addItem('tarefas', {
    titulo,
    projeto:     document.getElementById('m-tar-proj')?.value || '',
    prioridade:  document.getElementById('m-tar-prio')?.value || 'Normal',
    responsavel: document.getElementById('m-tar-resp')?.value || '',
    prazo:       document.getElementById('m-tar-prazo')?.value || '',
    categoria:   document.getElementById('m-tar-cat')?.value.trim() || '',
    status:      'backlog',
  });
  closeModal();
  showToast('Tarefa criada!', 'success');
  if (typeof renderTarefas   === 'function') renderTarefas();
}

// ---- FORM: NOVA TRANSAÇÃO ----
function modalNovaEntradaForm() {
  openModal(`
    <div class="modal-header">
      <div><div class="modal-title">Nova Transação</div><div class="modal-sub">Registrar entrada ou saída</div></div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Descrição *</label>
        <input class="form-input" id="m-fin-desc" placeholder="Ex: Recebimento Tech Corp">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Valor (R$) *</label>
          <input class="form-input" id="m-fin-valor" type="number" step="0.01" placeholder="0,00">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select class="form-input" id="m-fin-tipo">
            <option>Entrada</option>
            <option>Saída</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cliente / Fornecedor</label>
          <input class="form-input" id="m-fin-origem" placeholder="Nome">
        </div>
        <div class="form-group">
          <label class="form-label">Data</label>
          <input class="form-input" id="m-fin-data" type="date" value="${new Date().toISOString().slice(0,10)}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Projeto Relacionado</label>
        <select class="form-input" id="m-fin-proj">${projetosOpts('— Nenhum —')}</select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="salvarNovaTransacao()">Registrar →</button>
    </div>
  `);
}

function salvarNovaTransacao() {
  const desc  = document.getElementById('m-fin-desc')?.value.trim();
  const valor = parseFloat(document.getElementById('m-fin-valor')?.value || 0);
  if (!desc)   { showToast('Informe a descrição', 'error'); return; }
  if (!valor)  { showToast('Informe o valor', 'error'); return; }
  addItem('transacoes', {
    descricao: desc,
    valor,
    tipo:    document.getElementById('m-fin-tipo')?.value || 'Entrada',
    origem:  document.getElementById('m-fin-origem')?.value.trim() || '',
    data:    document.getElementById('m-fin-data')?.value || new Date().toISOString().slice(0,10),
    projeto: document.getElementById('m-fin-proj')?.value || '',
  });
  closeModal();
  showToast('Lançamento registrado!', 'success');
  if (typeof renderFinanceiro === 'function') renderFinanceiro();
  if (typeof renderDashboard  === 'function') renderDashboard();
}

// ---- FORM: NOVA FATURA ----
function modalNovaFaturaForm() {
  const faturas = getData('faturas');
  const num = 'FAT-' + String(faturas.length + 1).padStart(3, '0');
  openModal(`
    <div class="modal-header">
      <div><div class="modal-title">Nova Fatura</div><div class="modal-sub">${num}</div></div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cliente *</label>
          <select class="form-input" id="m-fat-cli">${clientesOpts('— Selecionar —')}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Projeto</label>
          <select class="form-input" id="m-fat-proj">${projetosOpts('— Nenhum —')}</select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Valor (R$) *</label>
          <input class="form-input" id="m-fat-val" type="number" step="0.01" placeholder="0,00">
        </div>
        <div class="form-group">
          <label class="form-label">Vencimento</label>
          <input class="form-input" id="m-fat-venc" type="date">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Descrição do Serviço</label>
        <textarea class="form-input" id="m-fat-desc" rows="2" placeholder="Descreva o serviço cobrado..."></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="salvarNovaFatura()">Gerar Fatura →</button>
    </div>
  `);
}

function salvarNovaFatura() {
  const valor = parseFloat(document.getElementById('m-fat-val')?.value || 0);
  if (!valor) { showToast('Informe o valor', 'error'); return; }
  const faturas = getData('faturas');
  const num = 'FAT-' + String(faturas.length + 1).padStart(3, '0');
  addItem('faturas', {
    numero:     num,
    cliente:    document.getElementById('m-fat-cli')?.value || '',
    projeto:    document.getElementById('m-fat-proj')?.value || '',
    valor,
    vencimento: document.getElementById('m-fat-venc')?.value || '',
    descricao:  document.getElementById('m-fat-desc')?.value.trim() || '',
    status:     'pendente',
    emitidaEm:  new Date().toISOString().slice(0,10),
  });
  closeModal();
  showToast('Fatura criada!', 'success');
  if (typeof renderFinanceiro === 'function') renderFinanceiro();
}

// ---- EXPOR GLOBALMENTE ----
Object.assign(window, {
  openModal, closeModal, showToast,
  getSettings, saveSettings, applySettings,
  getData, saveData, addItem, removeItem,
  statusBadge, statusKey, cargaInfo, progressFill,
  formatMoney, formatDate, avatarColor,
  modalProjeto, modalColaborador, modalCliente,
  atualizarProgressoProjeto,
  modalNovoProjetoForm,   salvarNovoProjeto,
  modalNovoClienteForm,   salvarNovoCliente,
  modalNovoColaboradorForm, salvarNovoColaborador,
  modalNovaTarefaForm,    salvarNovaTarefa,
  modalNovaEntradaForm,   salvarNovaTransacao,
  modalNovaFaturaForm,    salvarNovaFatura,
});
