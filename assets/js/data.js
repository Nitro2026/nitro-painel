// ==========================================
// NEXUS — DATA LAYER + MODAL SYSTEM
// ==========================================

// ---- SETTINGS (localStorage) ----

const SETTINGS_KEY = 'nexus_settings';

const defaultSettings = {
  empresa: 'Nexus Gestão Empresarial',
  cnpj: '12.345.678/0001-90',
  email: 'admin@nexus.com.br',
  fuso: 'América/São Paulo (UTC-3)',
  moeda: 'BRL — Real Brasileiro',
  alerta_fatura: '3',
  taxa_imposto: '8.65%',
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

// Aplica configurações salvas em toda a página
function applySettings() {
  const s = getSettings();

  // Nome da empresa no logo
  document.querySelectorAll('[data-bind="empresa"]').forEach(el => {
    el.textContent = s.empresa;
  });

  // Sigla (primeira letra) no logo mark
  document.querySelectorAll('[data-bind="empresa-letra"]').forEach(el => {
    el.textContent = s.empresa.charAt(0).toUpperCase();
  });

  // Email na user card
  document.querySelectorAll('[data-bind="email"]').forEach(el => {
    el.textContent = s.email;
  });
}

// ---- TOAST SYSTEM ----

function createToastContainer() {
  let tc = document.querySelector('.toast-container');
  if (!tc) {
    tc = document.createElement('div');
    tc.className = 'toast-container';
    document.body.appendChild(tc);
  }
  return tc;
}

function showToast(msg, type = 'info', duration = 3000) {
  const icons = { success: '✓', error: '✗', info: '◈' };
  const tc = createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '◈'}</span><span class="toast-text">${msg}</span>`;
  tc.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- MODAL SYSTEM ----

function openModal(html, size = '') {
  closeModal(); // Fecha qualquer modal aberto

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'nexus-modal';

  const modal = document.createElement('div');
  modal.className = `modal ${size}`;
  modal.innerHTML = html;
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // Abre com transição
  requestAnimationFrame(() => backdrop.classList.add('open'));

  // Fecha ao clicar no backdrop
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });

  // Fecha com ESC
  document._modalEsc = e => { if (e.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', document._modalEsc);

  // Botão X
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

// ---- MODAIS DE DETALHE: PROJETO ----

function modalProjeto(dados) {
  const statusClass = {
    'Em Andamento': 'badge-warning',
    'Em Revisão':   'badge-info',
    'Concluído':    'badge-success',
    'Atrasado':     'badge-danger',
  }[dados.status] || 'badge-metal';

  const progressColor = dados.progress >= 90 ? 'success'
    : dados.progress >= 60 ? ''
    : dados.progress >= 40 ? 'warning' : 'danger';

  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">${dados.nome}</div>
        <div class="modal-sub">${dados.cliente} · ${dados.valor}</div>
      </div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="badge ${statusClass}">${dados.status}</span>
        <span class="badge badge-metal">Prazo: ${dados.prazo}</span>
      </div>

      <p style="font-size:13px;color:var(--text2);line-height:1.6">${dados.descricao}</p>

      <div>
        <div class="detail-key" style="margin-bottom:8px">Progresso Geral</div>
        <div class="progress-bar" style="height:6px">
          <div class="progress-fill ${progressColor}" style="width:${dados.progress}%"></div>
        </div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);margin-top:4px">${dados.progress}% concluído</div>
      </div>

      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:14px">
        <div class="detail-row">
          <span class="detail-key">Cliente</span>
          <span class="detail-val">${dados.cliente}</span>
        </div>
        <div class="detail-row">
          <span class="detail-key">Valor</span>
          <span class="detail-val" style="color:var(--success)">${dados.valor}</span>
        </div>
        <div class="detail-row">
          <span class="detail-key">Prazo de Entrega</span>
          <span class="detail-val">${dados.prazo}</span>
        </div>
        <div class="detail-row">
          <span class="detail-key">Equipe</span>
          <div style="display:flex;gap:4px">
            ${dados.equipe.map(m => `<div class="avatar-sm ${m.cor}" style="width:26px;height:26px;font-size:10px" data-tip="${m.nome}">${m.inicial}</div>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Fechar</button>
      <button class="btn btn-primary btn-sm" onclick="closeModal();window.location.href='projetos.html'">Abrir Projeto →</button>
    </div>
  `);
}

// ---- MODAL DETALHE: COLABORADOR ----

function modalColaborador(dados) {
  const cargaColor = dados.carga >= 90 ? 'danger' : dados.carga >= 75 ? 'warning' : 'success';

  openModal(`
    <div class="modal-header">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="avatar-sm ${dados.cor}" style="width:44px;height:44px;font-size:18px;border-radius:50%;font-family:var(--font-disp)">${dados.inicial}</div>
        <div>
          <div class="modal-title">${dados.nome}</div>
          <div class="modal-sub">${dados.cargo} · ${dados.email}</div>
        </div>
      </div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-md);padding:14px">
        <div class="detail-row">
          <span class="detail-key">Cargo</span>
          <span class="detail-val">${dados.cargo}</span>
        </div>
        <div class="detail-row">
          <span class="detail-key">E-mail</span>
          <span class="detail-val" style="font-family:var(--font-mono);font-size:12px">${dados.email}</span>
        </div>
        <div class="detail-row">
          <span class="detail-key">Projetos Ativos</span>
          <span class="badge badge-metal">${dados.projetos} projetos</span>
        </div>
        <div class="detail-row">
          <span class="detail-key">Status de Carga</span>
          <span class="badge badge-${cargaColor === 'success' ? 'success' : cargaColor === 'warning' ? 'warning' : 'danger'}">${dados.cargaLabel}</span>
        </div>
      </div>

      <div>
        <div class="detail-key" style="margin-bottom:8px">Carga de Trabalho</div>
        <div class="progress-bar" style="height:8px">
          <div class="progress-fill ${cargaColor}" style="width:${dados.carga}%"></div>
        </div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text3);margin-top:4px">${dados.carga}% de capacidade utilizada</div>
      </div>

      <div>
        <div class="detail-key" style="margin-bottom:8px">Habilidades</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${dados.skills.map(s => `<span class="badge badge-metal">${s}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Fechar</button>
      <button class="btn btn-primary btn-sm" onclick="showToast('Perfil completo em breve','info');closeModal()">Ver Perfil Completo →</button>
    </div>
  `);
}

// ---- MODAL NOVO PROJETO ----

function modalNovoProjetoForm() {
  const s = getSettings();
  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">Novo Projeto</div>
        <div class="modal-sub">${s.empresa}</div>
      </div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label class="form-label">Nome do Projeto *</label>
        <input class="form-input" id="m-proj-nome" placeholder="Ex: Sistema de Gestão ABC">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cliente *</label>
          <input class="form-input" id="m-proj-cliente" placeholder="Nome do cliente">
        </div>
        <div class="form-group">
          <label class="form-label">Valor (R$)</label>
          <input class="form-input" id="m-proj-valor" placeholder="0,00">
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
        <label class="form-label">Descrição</label>
        <textarea class="form-input" id="m-proj-desc" rows="3" placeholder="Descreva o escopo do projeto..." style="resize:vertical"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Responsável</label>
        <select class="form-input" id="m-proj-resp">
          <option value="">Selecionar colaborador...</option>
          <option>Marcos Silva</option>
          <option>Ana Lima</option>
          <option>Pedro Alves</option>
          <option>Carla Matos</option>
          <option>Lucas Torres</option>
        </select>
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
  closeModal();
  showToast(`Projeto "${nome}" criado com sucesso!`, 'success');
}

// ---- MODAL NOVO CLIENTE ----

function modalNovoClienteForm() {
  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">Novo Cliente</div>
        <div class="modal-sub">Cadastrar na base de clientes</div>
      </div>
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
          <input class="form-input" id="m-cli-cargo" placeholder="Ex: Diretor, CEO">
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
        <label class="form-label">Status Inicial</label>
        <select class="form-input" id="m-cli-status">
          <option value="lead">Lead</option>
          <option value="proposta">Em Proposta</option>
          <option value="ativo">Cliente Ativo</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="salvarNovoCliente()">Cadastrar Cliente →</button>
    </div>
  `);
}

function salvarNovoCliente() {
  const empresa = document.getElementById('m-cli-empresa')?.value.trim();
  if (!empresa) { showToast('Informe o nome da empresa', 'error'); return; }
  closeModal();
  showToast(`Cliente "${empresa}" cadastrado!`, 'success');
}

// ---- MODAL NOVO COLABORADOR ----

function modalNovoColaboradorForm() {
  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">Novo Colaborador</div>
        <div class="modal-sub">Adicionar à equipe</div>
      </div>
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
          <label class="form-label">E-mail Corporativo</label>
          <input class="form-input" id="m-col-email" type="email" placeholder="nome@empresa.com">
        </div>
        <div class="form-group">
          <label class="form-label">Nível de Acesso</label>
          <select class="form-input" id="m-col-acesso">
            <option>Colaborador</option>
            <option>Gerente</option>
            <option>Administrador</option>
          </select>
        </div>
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
  closeModal();
  showToast(`Colaborador "${nome}" adicionado à equipe!`, 'success');
}

// ---- MODAL NOVA TAREFA ----
function modalNovaTarefaForm() {
  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">Nova Tarefa</div>
        <div class="modal-sub">Adicionar ao quadro</div>
      </div>
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
          <select class="form-input">
            <option>Projeto Alpha</option>
            <option>Sistema Inova</option>
            <option>E-commerce Global</option>
            <option>App Nexus Mobile</option>
            <option>BI Dashboard Corp</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Prioridade</label>
          <select class="form-input">
            <option>Normal</option>
            <option>Alta</option>
            <option>Urgente</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Responsável</label>
          <select class="form-input">
            <option>Marcos Silva</option>
            <option>Ana Lima</option>
            <option>Pedro Alves</option>
            <option>Carla Matos</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Prazo</label>
          <input class="form-input" type="date">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="
        const t=document.getElementById('m-tar-titulo')?.value.trim();
        if(!t){showToast('Informe o título','error');return;}
        closeModal();showToast('Tarefa criada!','success');
      ">Criar Tarefa →</button>
    </div>
  `);
}

// ---- MODAL NOVA ENTRADA FINANCEIRA ----
function modalNovaEntradaForm() {
  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">Nova Entrada</div>
        <div class="modal-sub">Registrar recebimento</div>
      </div>
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
          <input class="form-input" id="m-fin-valor" type="number" placeholder="0,00">
        </div>
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select class="form-input">
            <option>Entrada</option>
            <option>Saída</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cliente/Fornecedor</label>
          <input class="form-input" placeholder="Nome">
        </div>
        <div class="form-group">
          <label class="form-label">Data</label>
          <input class="form-input" type="date">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Projeto Relacionado</label>
        <select class="form-input">
          <option value="">Nenhum</option>
          <option>Projeto Alpha</option>
          <option>Sistema Inova</option>
          <option>E-commerce Global</option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="
        const d=document.getElementById('m-fin-desc')?.value.trim();
        if(!d){showToast('Informe a descrição','error');return;}
        closeModal();showToast('Lançamento registrado!','success');
      ">Registrar →</button>
    </div>
  `);
}

// ---- MODAL NOVA FATURA ----
function modalNovaFaturaForm() {
  openModal(`
    <div class="modal-header">
      <div>
        <div class="modal-title">Nova Fatura</div>
        <div class="modal-sub">Gerar cobrança para cliente</div>
      </div>
      <button class="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Cliente *</label>
          <select class="form-input" id="m-fat-cli">
            <option>Tech Corp</option>
            <option>Inova LTDA</option>
            <option>Global Soluções</option>
            <option>Digital Hub</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Projeto</label>
          <select class="form-input">
            <option>Projeto Alpha</option>
            <option>Sistema Inova</option>
            <option>E-commerce Global</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Valor (R$) *</label>
          <input class="form-input" id="m-fat-val" type="number" placeholder="0,00">
        </div>
        <div class="form-group">
          <label class="form-label">Vencimento</label>
          <input class="form-input" type="date">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Descrição do Serviço</label>
        <textarea class="form-input" rows="2" placeholder="Descreva o serviço cobrado..."></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-sm" onclick="
        const v=document.getElementById('m-fat-val')?.value;
        if(!v){showToast('Informe o valor','error');return;}
        closeModal();showToast('Fatura criada e enviada ao cliente!','success');
      ">Gerar Fatura →</button>
    </div>
  `);
}

// Expõe globalmente
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.getSettings = getSettings;
window.saveSettings = saveSettings;
window.applySettings = applySettings;
window.modalProjeto = modalProjeto;
window.modalColaborador = modalColaborador;
window.modalNovoProjetoForm = modalNovoProjetoForm;
window.modalNovoClienteForm = modalNovoClienteForm;
window.modalNovoColaboradorForm = modalNovoColaboradorForm;
window.modalNovaTarefaForm = modalNovaTarefaForm;
window.modalNovaEntradaForm = modalNovaEntradaForm;
window.modalNovaFaturaForm = modalNovaFaturaForm;
window.salvarNovoProjeto = salvarNovoProjeto;
window.salvarNovoCliente = salvarNovoCliente;
window.salvarNovoColaborador = salvarNovoColaborador;
