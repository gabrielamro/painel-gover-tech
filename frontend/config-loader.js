try {
  const response = await fetch('/api/config', { cache: 'no-store' });
  if (response.ok) {
    const { data } = await response.json();
    if (data?.supabaseUrl && data?.supabaseAnonKey) {
      window.__PAINELPRO_SUPABASE__ = { url: data.supabaseUrl, anonKey: data.supabaseAnonKey };
    }
    window.__PAINELPRO_DATA_SOURCE__ = data?.dataSource || 'local';
  }
} catch (error) {
  console.warn('Configuração remota indisponível; usando modo local.', error);
  window.__PAINELPRO_DATA_SOURCE__ = 'local';
}

