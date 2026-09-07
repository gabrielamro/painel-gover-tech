import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export async function requireUser(client: SupabaseClient, request: VercelRequest, response: VercelResponse): Promise<User | null> {
  if (!request.headers.authorization?.match(/^Bearer\s+\S+/i)) {
    response.status(401).json({ error: 'Autenticação obrigatória.' });
    return null;
  }
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    response.status(401).json({ error: 'Token de autenticação inválido ou expirado.' });
    return null;
  }
  return data.user;
}

