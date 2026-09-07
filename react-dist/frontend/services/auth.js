const config = window.__PAINELPRO_SUPABASE__ || {};
const client = config.url && config.anonKey && window.supabase
  ? window.supabase.createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;

export const AuthService = {
  enabled: Boolean(client),
  async signIn(email, password) {
    if (!client) throw new Error('Supabase Auth não configurado.');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut() { if (client) await client.auth.signOut(); },
  async session() { if (!client) return null; return (await client.auth.getSession()).data.session; },
  async accessToken() { return (await this.session())?.access_token || null; },
  onChange(callback) {
    if (!client) return () => {};
    const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },
};

