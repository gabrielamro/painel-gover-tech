import { createClient } from '@supabase/supabase-js';
import type { VercelRequest } from '@vercel/node';

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

export function supabaseFromRequest(request: VercelRequest) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  return createClient(required('SUPABASE_URL'), required('SUPABASE_ANON_KEY'), {
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

