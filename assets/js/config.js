// ==========================================
// Configuração Supabase
// ==========================================
// Preencha com as credenciais do seu projeto
// Encontre em: supabase.com → Projeto → Settings → API

const SUPABASE_CONFIG = {
  url:    'https://hkchobtmjcvbzqwxzbsg.supabase.co',
  anonKey: 'sb_publishable_NFva9CXNvymgd2Cns5jxwQ_373zlhia'
};

if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && window.supabase) {
  window._supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}
